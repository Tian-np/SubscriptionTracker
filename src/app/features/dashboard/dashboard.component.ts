import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionStore } from '../../core/stores/subscription.store';
import { formatCurrency } from '../../core/utils/currency.util';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Button, Tag, CurrencyFormatPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p class="text-sm text-slate-500">ภาพรวม subscription ของคุณในเดือนนี้</p>
        </div>
        <p-button
          label="เพิ่ม Subscription"
          icon="pi pi-plus"
          routerLink="/subscriptions"
          [queryParams]="{ action: 'add' }"
        />
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-20">
          <i class="pi pi-spin pi-spinner text-3xl text-indigo-500"></i>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-indigo-100 p-3">
                <i class="pi pi-wallet text-indigo-600"></i>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                  รวมต่อเดือน
                </p>
                <p class="text-2xl font-bold text-slate-900">
                  {{ store.monthlyTotal() | currencyFormat: store.baseCurrency() }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-emerald-100 p-3">
                <i class="pi pi-check-circle text-emerald-600"></i>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">ใช้งานอยู่</p>
                <p class="text-2xl font-bold text-slate-900">
                  {{ store.activeSubscriptions().length }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-amber-100 p-3">
                <i class="pi pi-bell text-amber-600"></i>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                  ใกล้ตัดบัตร
                </p>
                <p class="text-2xl font-bold text-slate-900">
                  {{ store.billingReminders().length }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-rose-100 p-3">
                <i class="pi pi-times-circle text-rose-600"></i>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                  ไม่ได้ใช้แล้ว
                </p>
                <p class="text-2xl font-bold text-slate-900">
                  {{ store.inactiveSubscriptions().length }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Upcoming Billings -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <i class="pi pi-calendar text-indigo-500"></i>
              กำหนดตัดบัตรถัดไป
            </h3>
            @if (store.upcomingBillings().length === 0) {
              <p class="py-8 text-center text-sm text-slate-400">ไม่มีรายการใน 30 วันข้างหน้า</p>
            } @else {
              <div class="space-y-3">
                @for (item of store.upcomingBillings(); track item.subscription.id) {
                  <div
                    class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div class="flex items-center gap-3">
                      @if (store.getCategoryById(item.subscription.categoryId); as cat) {
                        <div
                          class="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                          [style.background-color]="cat.color"
                        >
                          <i [class]="cat.icon + ' text-sm'"></i>
                        </div>
                      }
                      <div>
                        <p class="font-medium text-slate-900">{{ item.subscription.name }}</p>
                        <p class="text-xs text-slate-500">
                          {{ formatDate(item.subscription.nextBillingDate) }}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-slate-900">
                        {{ item.amountInBaseCurrency | currencyFormat: store.baseCurrency() }}
                      </p>
                      <p-tag
                        [value]="daysLabel(item.daysUntil)"
                        [severity]="urgencySeverity(item.daysUntil)"
                        class="text-xs"
                      />
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Category Breakdown -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <i class="pi pi-chart-pie text-indigo-500"></i>
              สรุปตามหมวด
            </h3>
            @if (store.categoryBreakdown().length === 0) {
              <p class="py-8 text-center text-sm text-slate-400">ยังไม่มีข้อมูล</p>
            } @else {
              <div class="space-y-3">
                @for (item of store.categoryBreakdown(); track item.category.id) {
                  <div>
                    <div class="mb-1 flex items-center justify-between text-sm">
                      <span class="flex items-center gap-2 font-medium text-slate-700">
                        <i [class]="item.category.icon" [style.color]="item.category.color"></i>
                        {{ item.category.name }}
                      </span>
                      <span class="font-semibold text-slate-900">
                        {{ item.total | currencyFormat: store.baseCurrency() }}
                      </span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="h-full rounded-full transition-all"
                        [style.width.%]="percentOfTotal(item.total)"
                        [style.background-color]="item.category.color"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Inactive / Unused -->
        @if (store.inactiveSubscriptions().length > 0) {
          <div class="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
            <h3 class="mb-3 flex items-center gap-2 text-lg font-semibold text-rose-800">
              <i class="pi pi-exclamation-triangle"></i>
              ไม่ได้ใช้แล้ว / ยกเลิกแล้ว
            </h3>
            <div class="flex flex-wrap gap-2">
              @for (sub of store.inactiveSubscriptions(); track sub.id) {
                <p-tag
                  [value]="sub.name"
                  severity="danger"
                  [rounded]="true"
                />
              }
            </div>
          </div>
        }

        <!-- Shared Subscriptions -->
        @if (store.sharedSubscriptions().length > 0) {
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <i class="pi pi-users text-indigo-500"></i>
              Shared Subscriptions
            </h3>
            <div class="grid gap-3 sm:grid-cols-2">
              @for (sub of store.sharedSubscriptions(); track sub.id) {
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p class="font-medium text-slate-900">{{ sub.name }}</p>
                  <p class="mt-1 text-sm text-slate-500">
                    รวม {{ sub.amount | currencyFormat: sub.currency }}/{{ cycleLabel(sub.billingCycle) }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    @for (member of sub.sharedMembers; track member.name) {
                      <p-tag
                        [value]="member.name + ': ' + formatCurrency(member.shareAmount, sub.currency)"
                        severity="info"
                        [rounded]="true"
                        class="text-xs"
                      />
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(SubscriptionStore);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    if (this.store.subscriptions().length === 0) {
      this.store.loadAll();
    }
    setTimeout(() => this.notificationService.checkBillingReminders(), 1000);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency = formatCurrency;

  daysLabel(days: number): string {
    if (days === 0) return 'วันนี้';
    if (days === 1) return 'พรุ่งนี้';
    return `อีก ${days} วัน`;
  }

  urgencySeverity(days: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (days <= 1) return 'danger';
    if (days <= 3) return 'warn';
    if (days <= 7) return 'info';
    return 'secondary';
  }

  percentOfTotal(amount: number): number {
    const total = this.store.monthlyTotal();
    return total > 0 ? (amount / total) * 100 : 0;
  }

  cycleLabel(cycle: string): string {
    const labels: Record<string, string> = {
      monthly: 'เดือน',
      yearly: 'ปี',
      weekly: 'สัปดาห์',
    };
    return labels[cycle] ?? cycle;
  }
}
