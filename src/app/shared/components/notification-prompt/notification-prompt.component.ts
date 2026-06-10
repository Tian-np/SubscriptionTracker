import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';

import { PushNotificationService } from '../../../core/services/push-notification.service';

@Component({
  selector: 'app-notification-prompt',
  imports: [Button, Message],
  template: `
    @if (showBanner()) {
      <div class="border-b border-accent/20 bg-accent/10 px-safe px-3 py-2.5 sm:px-4 sm:py-3">
        <div
          class="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 px-4! relative"
        >
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10"
            >
              <i class="pi pi-bell text-sm text-accent"></i>
            </span>
            <div>
              <p class="text-sm font-medium text-slate-200">เปิดการแจ้งเตือนบน iPhone</p>
              @if (push.needsHomeScreen()) {
                <p class="mt-0.5 text-xs text-slate-400">
                  1. กด <strong class="text-slate-300">Share</strong> →
                  <strong class="text-slate-300">Add to Home Screen</strong><br />
                  2. เปิดแอปจากหน้าจอหลัก → กดปุ่มด้านล่างเพื่ออนุญาตการแจ้งเตือน
                </p>
              } @else if (push.permission() === 'denied') {
                <p class="mt-0.5 text-xs text-slate-400">
                  ไปที่ Settings → Notifications → SubTracker → เปิด Allow Notifications
                </p>
              } @else {
                <p class="mt-0.5 text-xs text-slate-400">
                  รับแจ้งเตือนก่อนตัดบัตรตรงบนหน้าจอ iPhone แม้ไม่ได้เปิดแอป
                </p>
              }
            </div>
          </div>

          <div class="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            @if (!push.needsHomeScreen() && push.permission() !== 'denied') {
              <p-button
                label="เปิดการแจ้งเตือน"
                icon="pi pi-bell"
                size="small"
                styleClass="w-full sm:w-auto"
                [loading]="push.isLoading()"
                (onClick)="enable()"
              />
            }
            <p-button
              class="absolute right-1 top-[-8px]"
              icon="pi pi-times"
              severity="secondary"
              [text]="true"
              size="small"
              (onClick)="dismiss()"
            />
          </div>
        </div>

        @if (push.lastError()) {
          <p-message
            severity="warn"
            [text]="push.lastError()!"
            class="mx-auto mt-2 block max-w-7xl"
          />
        }
      </div>
    }
  `,
})
export class NotificationPromptComponent {
  readonly push = inject(PushNotificationService);

  private dismissed = false;

  showBanner(): boolean {
    if (this.dismissed) return false;
    if (this.push.permission() === 'unsupported') return false;
    if (this.push.isSubscribed() && this.push.permission() === 'granted') return false;
    return true;
  }

  async enable(): Promise<void> {
    const ok = await this.push.enable();
    if (ok) {
      this.dismissed = true;
    }
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
