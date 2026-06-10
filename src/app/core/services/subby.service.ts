import { computed, inject, Injectable, Injector, signal } from '@angular/core';

import { SubscriptionStore } from '../stores/subscription.store';

export type SubbyMood = 'happy' | 'wave' | 'sad' | 'excited';
export type SubbyVariant = 'default' | 'success' | 'warning' | 'danger' | 'celebrate';

export type SubbyEvent =
  | 'idle'
  | 'welcome'
  | 'loading'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'error'
  | 'billing_alert'
  | 'empty'
  | 'not_found'
  | 'notify_on';

interface SubbyReaction {
  mood: SubbyMood;
  variant: SubbyVariant;
  speech: string;
  resetMs?: number;
}

const REACTIONS: Record<SubbyEvent, SubbyReaction> = {
  idle: { mood: 'happy', variant: 'default', speech: '', resetMs: 0 },
  welcome: { mood: 'wave', variant: 'celebrate', speech: 'ยินดีต้อนรับกลับมา! ✨', resetMs: 5000 },
  loading: { mood: 'happy', variant: 'default', speech: 'กำลังโหลดข้อมูล...', resetMs: 0 },
  created: { mood: 'excited', variant: 'success', speech: 'เพิ่มสำเร็จ! เก่งมาก 🎉', resetMs: 4500 },
  updated: { mood: 'happy', variant: 'success', speech: 'บันทึกเรียบร้อยแล้ว ✓', resetMs: 4000 },
  deleted: { mood: 'wave', variant: 'warning', speech: 'ลบแล้วนะ บายบาย~', resetMs: 4000 },
  error: { mood: 'sad', variant: 'danger', speech: 'อุ๊ปส์! มีบางอย่างผิดพลาด', resetMs: 5000 },
  billing_alert: { mood: 'excited', variant: 'warning', speech: 'ใกล้ตัดบัตรแล้ว! อย่าลืมเช็ค 💳', resetMs: 0 },
  empty: { mood: 'sad', variant: 'default', speech: 'ยังไม่มีรายการเลยน้า...', resetMs: 0 },
  not_found: { mood: 'sad', variant: 'default', speech: 'หาไม่เจอเลย ลองค้นใหม่นะ', resetMs: 3500 },
  notify_on: { mood: 'excited', variant: 'celebrate', speech: 'เปิดแจ้งเตือนแล้ว! 🔔', resetMs: 4000 },
};

@Injectable({ providedIn: 'root' })
export class SubbyService {
  private readonly injector = inject(Injector);

  /** Lazy resolve to avoid circular DI: SubscriptionStore -> SubbyService -> SubscriptionStore */
  private get store(): SubscriptionStore {
    return this.injector.get(SubscriptionStore);
  }

  private readonly mood = signal<SubbyMood>('happy');
  private readonly variant = signal<SubbyVariant>('default');
  private readonly speech = signal<string | null>(null);
  private readonly tick = signal(0);

  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private activeEvent = signal<SubbyEvent>('idle');

  readonly state = computed(() => ({
    mood: this.mood(),
    variant: this.variant(),
    speech: this.speech(),
    tick: this.tick(),
  }));

  react(event: SubbyEvent, customSpeech?: string): void {
    const reaction = REACTIONS[event];
    this.activeEvent.set(event);

    this.mood.set(reaction.mood);
    this.variant.set(reaction.variant);
    this.speech.set(customSpeech ?? (reaction.speech || null));
    this.tick.update((n) => n + 1);

    this.clearResetTimer();

    const resetMs = reaction.resetMs ?? 0;
    if (resetMs > 0) {
      this.resetTimer = setTimeout(() => {
        this.resetTimer = null;
        this.applyContextIdle();
      }, resetMs);
    }
  }

  reactError(message?: string): void {
    this.react('error', message ?? REACTIONS.error.speech);
  }

  /** Recompute idle mood from app context (billing, empty list, time of day). */
  refreshContext(): void {
    this.applyContextIdle();
  }

  onLoadStart(): void {
    this.react('loading');
  }

  onLoadDone(): void {
    this.applyContextIdle();
  }

  private applyContextIdle(): void {
    if (this.resetTimer !== null) return;

    this.activeEvent.set('idle');

    if (this.store.loading()) {
      this.setState('happy', 'default', REACTIONS.loading.speech);
      return;
    }

    const reminders = this.store.billingReminders();
    if (reminders.length > 0) {
      const next = reminders[0];
      const days = next.daysUntil;
      const dayLabel = days === 0 ? 'วันนี้' : days === 1 ? 'พรุ่งนี้' : `อีก ${days} วัน`;
      this.setState(
        'excited',
        'warning',
        `${next.subscription.name} ตัดบัตร${dayLabel}! 💳`,
      );
      return;
    }

    if (this.store.subscriptions().length === 0) {
      this.setState('sad', 'default', REACTIONS.empty.speech);
      return;
    }

    this.setState('happy', 'default', this.greeting());
  }

  private setState(mood: SubbyMood, variant: SubbyVariant, speech: string | null): void {
    this.mood.set(mood);
    this.variant.set(variant);
    this.speech.set(speech);
    this.tick.update((n) => n + 1);
  }

  private greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า! ☀️';
    if (hour < 18) return 'สวัสดีตอนบ่าย! ✨';
    return 'สวัสดีตอนเย็น! 🌙';
  }

  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
