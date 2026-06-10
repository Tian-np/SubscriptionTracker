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
  ],
  template: `
    <p-toast position="top-right" />

    <div class="min-h-dvh-safe bg-slate-50">
      <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md pt-safe">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-safe px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm sm:h-9 sm:w-9"
            >
              <i class="pi pi-wallet text-sm"></i>
            </div>
            <div class="min-w-0">
              <h1 class="truncate text-base font-semibold text-slate-900 sm:text-lg">SubTracker</h1>
              <p class="hidden text-xs text-slate-500 sm:block">จัดการ subscription ของคุณ</p>
            </div>
          </div>

          <nav class="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <a
              routerLink="/"
              routerLinkActive="bg-indigo-50 text-indigo-700"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg p-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:px-3"
            >
              <i class="pi pi-home sm:mr-1.5"></i>
              <span class="hidden sm:inline">Dashboard</span>
            </a>
            <a
              routerLink="/subscriptions"
              routerLinkActive="bg-indigo-50 text-indigo-700"
              class="rounded-lg p-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:px-3"
            >
              <i class="pi pi-list sm:mr-1.5"></i>
              <span class="hidden sm:inline">Subscriptions</span>
            </a>
          </nav>

          <div class="flex shrink-0 items-center gap-1 sm:gap-2">
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
            <p-select
              [options]="currencies"
              [ngModel]="store.baseCurrency()"
              (ngModelChange)="store.setBaseCurrency($event)"
              optionLabel="label"
              optionValue="value"
              class="w-20 sm:w-28"
              size="small"
            />
          </div>
        </div>
      </header>

      <app-notification-prompt />

      <main class="mx-auto max-w-7xl px-safe px-4 py-4 pb-safe sm:px-6 sm:py-6">
        <router-outlet />
      </main>
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
