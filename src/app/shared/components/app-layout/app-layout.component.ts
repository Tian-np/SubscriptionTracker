import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';

import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { SubbyService } from '../../../core/services/subby.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { NotificationPromptComponent } from '../notification-prompt/notification-prompt.component';
import { PixelBgComponent } from '../pixel-bg/pixel-bg.component';
import { PixelBuddyComponent } from '../pixel-buddy/pixel-buddy.component';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Button,
    Toast,
    NotificationPromptComponent,
    MobileBottomNavComponent,
    PixelBgComponent,
    PixelBuddyComponent,
  ],
  template: `
    <p-toast position="top-right" />
    <app-pixel-bg />

    <div class="relative z-10 flex min-h-dvh-safe flex-col bg-app">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 shrink-0 border-b border-midnight-700 bg-midnight-900/95 pt-safe backdrop-blur-md"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-safe p-4!">
          <div class="flex min-w-0 items-center gap-2">
            <div class="min-w-0 leading-tight">
              <div class="flex items-center gap-2">
                <h1 class="truncate text-sm font-semibold text-slate-100 sm:text-lg">SubTracker</h1>
                <span class="pixel-badge hidden sm:inline">8-bit</span>
              </div>
              <p class="hidden text-xs text-slate-500 sm:block">จัดการ subscription ของคุณ ✦</p>
            </div>
          </div>

          <!-- Desktop nav -->
          <nav class="hidden items-center gap-1 md:flex">
            <a
              routerLink="/"
              routerLinkActive="bg-accent/10 text-accent"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-midnight-800/80 hover:text-slate-200"
            >
              <i class="pi pi-home mr-1.5 text-[0.8rem]"></i>Dashboard
            </a>
            <a
              routerLink="/subscriptions"
              routerLinkActive="bg-accent/10 text-accent"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-midnight-800/80 hover:text-slate-200"
            >
              <i class="pi pi-list mr-1.5 text-[0.8rem]"></i>Subscriptions
            </a>
          </nav>

          <div class="flex shrink-0 items-center gap-0.5 sm:gap-2">
            @if (push.permission() === 'granted') {
              <p-button
                [icon]="push.isSubscribed() ? 'pi pi-bell' : 'pi pi-bell-slash'"
                [severity]="push.isSubscribed() ? 'success' : 'secondary'"
                [text]="true"
                size="small"
                [title]="push.statusLabel()"
                (onClick)="toggleNotifications()"
              />
            }
            @if (useSupabase && auth.isAuthenticated()) {
              <p-button
                icon="pi pi-sign-out"
                severity="secondary"
                [text]="true"
                size="small"
                [title]="auth.username()"
                (onClick)="signOut()"
              />
            }
          </div>
        </div>
      </header>

      <app-notification-prompt />

      <!-- Main — extra bottom padding on mobile for tab bar -->
      <main
        class="mx-auto w-full max-w-7xl flex-1 px-safe p-6! pb-nav-safe sm:px-6 sm:py-6 md:pb-safe max-sm:mb-15!"
      >
        <div class="page-enter">
          <router-outlet />
        </div>
      </main>

      <app-mobile-bottom-nav />

      <!-- Desktop floating buddy -->
      <div class="pointer-events-none fixed right-4 bottom-20 z-20 hidden lg:block">
        <app-pixel-buddy sync [size]="72" />
      </div>
    </div>
  `,
})
export class AppLayoutComponent implements OnInit {
  readonly store = inject(SubscriptionStore);
  readonly push = inject(PushNotificationService);
  readonly auth = inject(SupabaseAuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly subby = inject(SubbyService);

  readonly useSupabase = environment.useSupabase;

  ngOnInit(): void {
    this.notificationService.init();
    this.subby.refreshContext();
  }

  async toggleNotifications(): Promise<void> {
    if (!this.push.isSubscribed()) {
      const ok = await this.push.enable();
      if (ok) {
        this.subby.react('notify_on');
      }
    }
  }

  signOut(): void {
    this.auth.signOut().subscribe(() => {
      globalThis.location.href = '/login';
    });
  }
}
