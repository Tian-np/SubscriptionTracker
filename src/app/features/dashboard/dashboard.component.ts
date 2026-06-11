import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { Tag } from 'primeng/tag';

import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionStore } from '../../core/stores/subscription.store';
import { formatCurrency } from '../../core/utils/currency.util';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PixelBuddyComponent } from '../../shared/components/pixel-buddy/pixel-buddy.component';
import { PixelLoaderComponent } from '../../shared/components/pixel-loader/pixel-loader.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    Button,
    ChartModule,
    Tag,
    CurrencyFormatPipe,
    PixelBuddyComponent,
    PixelLoaderComponent,
  ],
  styles: `
    .dashboard-buddy-float {
      animation: dashboard-buddy-float 3s ease-in-out infinite;
    }

    @keyframes dashboard-buddy-float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }
  `,
  template: `
    <div class="space-y-4 sm:space-y-6">
      <div class="pixel-frame relative overflow-visible rounded-xl bg-card/60 p-4 sm:p-5">
        <div
          class="dashboard-buddy-float pointer-events-none absolute -top-5 right-3 z-10 sm:-top-6 sm:right-5"
        >
          <app-pixel-buddy sync [size]="56" />
        </div>

        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <div class="min-w-0 pr-14 sm:pr-16">
            <h2 class="text-xl font-bold text-slate-100 sm:text-2xl">Dashboard</h2>
            <p class="text-xs text-slate-500 sm:text-sm">ภาพรวม subscription ของคุณในเดือนนี้ ✨</p>
          </div>

          @if (!store.loading() && store.categoryBreakdown().length > 0) {
            <div class="relative mx-auto w-36 shrink-0 sm:mx-0 sm:w-40">
              <p-chart
                type="doughnut"
                [data]="categoryChartData()"
                [options]="categoryChartOptions"
                class="h-36 sm:h-40"
              />
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              >
                <p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  รวมต่อเดือน
                </p>
                <p class="text-sm font-bold text-slate-100">
                  {{ store.monthlyTotal() | currencyFormat: store.baseCurrency() }}
                </p>
              </div>
            </div>
          }

          <p-button
            label="เพิ่ม Subscription"
            icon="pi pi-plus"
            routerLink="/subscriptions"
            [queryParams]="{ action: 'add' }"
            styleClass="w-full sm:w-auto"
            class="btn-mobile-full hidden sm:inline-flex"
          />
        </div>
      </div>

      @if (store.loading()) {
        <div class="flex items-center justify-center py-20">
          <app-pixel-loader label="กำลังโหลดข้อมูล..." />
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <div
            class="pixel-card rounded-xl border border-midnight-700 bg-card p-3 sm:rounded-2xl sm:p-5"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div
                class="rounded-lg border border-accent/15 bg-accent/10 p-2 sm:rounded-xl sm:p-3 flex justify-center"
              >
                <i class="pi pi-wallet text-accent text-sm sm:text-base"></i>
              </div>
              <div class="min-w-0">
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"
                >
                  รวมต่อเดือน
                </p>
                <p class="truncate text-lg font-bold text-slate-100 sm:text-2xl">
                  {{ store.monthlyTotal() | currencyFormat: store.baseCurrency() }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="pixel-card rounded-xl border border-midnight-700 bg-card p-3 sm:rounded-2xl sm:p-5"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div
                class="rounded-lg border border-emerald-500/15 bg-emerald-500/10 p-2 sm:rounded-xl sm:p-3 flex justify-center"
              >
                <i class="pi pi-check-circle text-emerald-400/90 text-sm sm:text-base"></i>
              </div>
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"
                >
                  ใช้งานอยู่
                </p>
                <p class="text-lg font-bold text-slate-100 sm:text-2xl">
                  {{ store.activeSubscriptions().length }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="pixel-card rounded-xl border border-midnight-700 bg-card p-3 sm:rounded-2xl sm:p-5"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div
                class="rounded-lg border border-amber-500/15 bg-amber-500/10 p-2 sm:rounded-xl sm:p-3 flex justify-center"
              >
                <i class="pi pi-bell text-amber-400/90 text-sm sm:text-base"></i>
              </div>
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"
                >
                  ใกล้ตัดบัตร
                </p>
                <p class="text-lg font-bold text-slate-100 sm:text-2xl">
                  {{ store.billingReminders().length }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="pixel-card rounded-xl border border-midnight-700 bg-card p-3 sm:rounded-2xl sm:p-5"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div
                class="rounded-lg border border-rose-500/15 bg-rose-500/10 p-2 sm:rounded-xl sm:p-3 flex justify-center"
              >
                <i class="pi pi-times-circle text-rose-400/90 text-sm sm:text-base"></i>
              </div>
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"
                >
                  ไม่ได้ใช้แล้ว
                </p>
                <p class="text-lg font-bold text-slate-100 sm:text-2xl">
                  {{ store.inactiveSubscriptions().length }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div class="rounded-xl border border-midnight-700 bg-card p-4 sm:rounded-2xl sm:p-5">
            <h3
              class="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100 sm:mb-4 sm:text-lg"
            >
              <i class="pi pi-calendar text-accent"></i>
              กำหนดตัดบัตรถัดไป
            </h3>
            @if (store.upcomingBillings().length === 0) {
              <p class="py-8 text-center text-sm text-slate-600">ไม่มีรายการใน 30 วันข้างหน้า</p>
            } @else {
              <div class="space-y-3">
                @for (item of store.upcomingBillings(); track item.subscription.id) {
                  <div
                    class="flex flex-col gap-2 rounded-xl border border-midnight-700 bg-midnight-800/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                  >
                    <div class="flex min-w-0 items-center gap-3">
                      @if (store.getCategoryById(item.subscription.categoryId); as cat) {
                        <div
                          class="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                          [style.background-color]="cat.color"
                        >
                          <i [class]="store.getDisplayIcon(item.subscription) + ' text-sm'"></i>
                        </div>
                      }
                      <div>
                        <p class="font-medium text-slate-100">{{ item.subscription.name }}</p>
                        <p class="text-xs text-slate-500">
                          {{ formatDate(item.subscription.nextBillingDate) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-2 sm:block sm:text-right">
                      <p class="font-semibold text-slate-100">
                        {{ item.amountInBaseCurrency | currencyFormat: store.baseCurrency() }}
                      </p>
                      <p-tag
                        [value]="daysLabel(item.daysUntil)"
                        [severity]="urgencySeverity(item.daysUntil)"
                        class="shrink-0 text-xs"
                      />
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="rounded-xl border border-midnight-700 bg-card p-4 sm:rounded-2xl sm:p-5">
            <h3
              class="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100 sm:mb-4 sm:text-lg"
            >
              <i class="pi pi-chart-pie text-accent"></i>
              สรุปตามหมวด
            </h3>
            @if (store.categoryBreakdown().length === 0) {
              <p class="py-8 text-center text-sm text-slate-600">ยังไม่มีข้อมูล</p>
            } @else {
              <div class="space-y-3">
                @for (item of store.categoryBreakdown(); track item.category.id) {
                  <div>
                    <div class="mb-1 flex items-center justify-between text-sm">
                      <span class="flex items-center gap-2 font-medium text-slate-300">
                        <i [class]="item.category.icon" [style.color]="item.category.color"></i>
                        {{ item.category.name }}
                      </span>
                      <span class="font-semibold text-slate-100">
                        {{ item.total | currencyFormat: store.baseCurrency() }}
                      </span>
                    </div>
                    <div class="h-1.5 overflow-hidden rounded-full bg-midnight-700">
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

        @if (store.inactiveSubscriptions().length > 0) {
          <div
            class="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4 sm:rounded-2xl sm:p-5"
          >
            <h3
              class="mb-3 flex items-center gap-2 text-base font-semibold text-rose-300 sm:text-lg"
            >
              <i class="pi pi-exclamation-triangle"></i>
              ไม่ได้ใช้แล้ว / ยกเลิกแล้ว
            </h3>
            <div class="flex flex-wrap gap-2">
              @for (sub of store.inactiveSubscriptions(); track sub.id) {
                <p-tag [value]="sub.name" severity="danger" [rounded]="true" />
              }
            </div>
          </div>
        }

        @if (store.sharedSubscriptions().length > 0) {
          <div class="rounded-xl border border-midnight-700 bg-card p-4 sm:rounded-2xl sm:p-5">
            <h3
              class="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100 sm:mb-4 sm:text-lg"
            >
              <i class="pi pi-users text-accent"></i>
              Shared Subscriptions
            </h3>
            <div class="grid gap-3 sm:grid-cols-2">
              @for (sub of store.sharedSubscriptions(); track sub.id) {
                <div class="rounded-xl border border-midnight-700 bg-midnight-800/60 p-4">
                  <p class="font-medium text-slate-100">{{ sub.name }}</p>
                  <p class="mt-1 text-sm text-slate-500">
                    รวม {{ sub.amount | currencyFormat: sub.currency }}/{{
                      cycleLabel(sub.billingCycle)
                    }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1">
                    @for (member of sub.sharedMembers; track member.name) {
                      <p-tag
                        [value]="
                          member.name + ': ' + formatCurrency(member.shareAmount, sub.currency)
                        "
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

  readonly categoryChartData = computed(() => {
    const breakdown = this.store.categoryBreakdown();
    return {
      labels: breakdown.map((item) => item.category.name),
      datasets: [
        {
          data: breakdown.map((item) => item.total),
          backgroundColor: breakdown.map((item) => item.category.color),
          hoverBackgroundColor: breakdown.map((item) => item.category.color),
          borderWidth: 0,
        },
      ],
    };
  });

  categoryChartOptions: Record<string, unknown> = {};

  ngOnInit(): void {
    this.categoryChartOptions = {
      cutout: '70%',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2744',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          borderColor: '#243352',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx: { parsed: number; label?: string }) => {
              const total = this.store.monthlyTotal();
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
              const amount = formatCurrency(ctx.parsed, this.store.baseCurrency());
              return ` ${ctx.label}: ${amount} (${pct}%)`;
            },
          },
        },
      },
    };

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
