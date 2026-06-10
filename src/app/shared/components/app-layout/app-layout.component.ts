import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';

import { SUPPORTED_CURRENCIES } from '../../../core/models/currency.model';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { SupabaseAuthService } from '../../../core/services/supabase-auth.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { NotificationPromptComponent } from '../notification-prompt/notification-prompt.component';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    Button,
    Select,
    Toast,
    NotificationPromptComponent,
    MobileBottomNavComponent,
  ],
  template: `
    <p-toast position="top-right" />

    <div class="flex min-h-dvh-safe flex-col bg-app">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 shrink-0 border-b border-midnight-700 bg-midnight-900/95 pt-safe backdrop-blur-md"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-safe p-4!">
          <div class="flex min-w-0 items-center gap-2">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-white sm:h-9 sm:w-9"
            >
              <i class="pi pi-wallet text-sm"></i>
            </div>
            <div class="min-w-0 leading-tight">
              <h1 class="truncate text-sm font-semibold text-slate-100 sm:text-lg">SubTracker</h1>
              <p class="hidden text-xs text-slate-500 sm:block">จัดการ subscription ของคุณ</p>
            </div>
          </div>

          <!-- Desktop nav -->
          <nav class="hidden items-center gap-1 md:flex">
            <a
              routerLink="/"
              routerLinkActive="bg-midnight-700 text-accent"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-midnight-800 hover:text-slate-200"
            >
              <i class="pi pi-home mr-1.5"></i>Dashboard
            </a>
            <a
              routerLink="/subscriptions"
              routerLinkActive="bg-midnight-700 text-accent"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-midnight-800 hover:text-slate-200"
            >
              <i class="pi pi-list mr-1.5"></i>Subscriptions
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
        class="mx-auto w-full max-w-7xl flex-1 px-safe p-6! pb-nav-safe sm:px-6 sm:py-6 md:pb-safe"
      >
        <router-outlet />
      </main>

      <app-mobile-bottom-nav />
    </div>
  `,
})
export class AppLayoutComponent implements OnInit {
  readonly store = inject(SubscriptionStore);
  readonly push = inject(PushNotificationService);
  readonly auth = inject(SupabaseAuthService);
  private readonly notificationService = inject(NotificationService);

  readonly useSupabase = environment.useSupabase;
  readonly currencies = SUPPORTED_CURRENCIES.map((c) => ({ label: c, value: c }));

  ngOnInit(): void {
    this.notificationService.init();
  }

  async toggleNotifications(): Promise<void> {
    if (!this.push.isSubscribed()) {
      await this.push.enable();
    }
  }

  signOut(): void {
    this.auth.signOut().subscribe(() => {
      globalThis.location.href = '/login';
    });
  }
}
