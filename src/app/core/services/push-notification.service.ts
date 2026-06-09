import { computed, inject, Injectable, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { RegisterPushDto } from '../models/push.model';
import { PushApiService } from './push-api.service';

export type NotificationPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly pushApi = inject(PushApiService);

  readonly permission = signal<NotificationPermissionState>('default');
  readonly isSubscribed = signal(false);
  readonly isStandalone = signal(false);
  readonly isIos = signal(false);
  readonly isLoading = signal(false);
  readonly lastError = signal<string | null>(null);

  readonly canEnable = computed(
    () =>
      this.permission() === 'default' ||
      (this.permission() === 'granted' && !this.isSubscribed()),
  );

  readonly needsHomeScreen = computed(() => this.isIos() && !this.isStandalone());

  readonly statusLabel = computed(() => {
    if (this.permission() === 'unsupported') return 'เบราว์เซอร์ไม่รองรับ';
    if (this.permission() === 'denied') return 'ถูกปฏิเสธ — เปิดใน Settings';
    if (this.needsHomeScreen()) return 'เพิ่มไปหน้าจอหลักก่อน';
    if (this.isSubscribed()) return 'เปิดการแจ้งเตือนแล้ว';
    return 'ยังไม่ได้เปิด';
  });

  init(): void {
    this.detectEnvironment();
    this.syncPermission();
    this.isSubscribed.set(this.pushApi.isRegistered());
    this.registerServiceWorker();
  }

  async enable(): Promise<boolean> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      if (!this.isPushSupported()) {
        this.permission.set('unsupported');
        this.lastError.set('อุปกรณ์นี้ไม่รองรับ Push Notification');
        return false;
      }

      if (this.needsHomeScreen()) {
        this.lastError.set('บน iPhone ต้องเพิ่มแอปไปที่หน้าจอหลักก่อน (Share → Add to Home Screen)');
        return false;
      }

      const perm = await Notification.requestPermission();
      this.permission.set(perm as NotificationPermissionState);

      if (perm !== 'granted') {
        this.lastError.set('คุณปฏิเสธการแจ้งเตือน — เปิดได้ใน Settings → Notifications');
        return false;
      }

      if (!environment.vapidPublicKey) {
        this.isSubscribed.set(true);
        return true;
      }

      const registration = await this.getRegistration();
      if (!registration) {
        this.lastError.set('ไม่สามารถลงทะเบียน Service Worker ได้');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.vapidPublicKey),
      });

      const dto: RegisterPushDto = {
        subscription: subscription.toJSON() as RegisterPushDto['subscription'],
        deviceInfo: {
          platform: this.isIos() ? 'ios' : 'other',
          userAgent: navigator.userAgent,
          isStandalone: this.isStandalone(),
        },
      };

      this.pushApi.register(dto).subscribe({
        next: () => {
          this.isSubscribed.set(true);
        },
        error: () => {
          this.lastError.set('ลงทะเบียน Push กับ server ไม่สำเร็จ');
        },
      });

      this.isSubscribed.set(true);
      return true;
    } catch (err) {
      this.lastError.set(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async showLocalNotification(
    title: string,
    body: string,
    tag?: string,
    requireInteraction = false,
  ): Promise<void> {
    if (Notification.permission !== 'granted') return;

    const registration = await this.getRegistration();

    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        tag: tag ?? 'subtracker-local',
        requireInteraction,
      });
      return;
    }

    new Notification(title, { body, icon: '/icons/icon.svg', tag });
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {
      // Service worker registration may fail on localhost without HTTPS in some browsers
    }
  }

  private async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;

    try {
      return await navigator.serviceWorker.ready;
    } catch {
      return null;
    }
  }

  private detectEnvironment(): void {
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    this.isIos.set(isIos);
    this.isStandalone.set(
      window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator && !!(navigator as Navigator & { standalone?: boolean }).standalone),
    );
  }

  private syncPermission(): void {
    if (!('Notification' in window)) {
      this.permission.set('unsupported');
      return;
    }
    this.permission.set(Notification.permission as NotificationPermissionState);
  }

  private isPushSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const output = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) {
      output[i] = raw.charCodeAt(i);
    }
    return output;
  }
}
