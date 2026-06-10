import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { ExchangeRates } from '../models/currency.model';
import {
  CreateSubscriptionDto,
  Subscription,
  UpdateSubscriptionDto,
} from '../models/subscription.model';
import { CategoryApiService } from '../services/category-api.service';
import { CurrencyApiService } from '../services/currency-api.service';
import { SubbyService } from '../services/subby.service';
import { SubscriptionApiService } from '../services/subscription-api.service';
import { SupabaseSubscriptionService } from '../services/supabase-subscription.service';
import { convertCurrency, daysUntil, toMonthlyAmount } from '../utils/currency.util';

@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly currencyApi = inject(CurrencyApiService);
  private readonly supabaseData = inject(SupabaseSubscriptionService);
  private readonly subby = inject(SubbyService);

  readonly subscriptions = signal<Subscription[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly exchangeRates = signal<ExchangeRates | null>(null);
  readonly baseCurrency = signal<string>(environment.defaultCurrency);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedCategoryId = signal<string | null>(null);
  readonly searchQuery = signal('');

  readonly activeSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.status === 'active'),
  );

  readonly inactiveSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.status !== 'active'),
  );

  readonly filteredSubscriptions = computed(() => {
    const categoryId = this.selectedCategoryId();
    const query = this.searchQuery().toLowerCase().trim();
    let list = this.subscriptions();

    if (categoryId) {
      list = list.filter((s) => s.categoryId === categoryId);
    }

    if (query) {
      list = list.filter((s) => s.name.toLowerCase().includes(query));
    }

    return list;
  });

  readonly monthlyTotal = computed(() => {
    const rates = this.exchangeRates();
    const base = this.baseCurrency();
    if (!rates) return 0;

    return this.activeSubscriptions().reduce((sum, sub) => {
      const monthly = toMonthlyAmount(sub.amount, sub.billingCycle);
      const converted = convertCurrency(monthly, sub.currency, base, rates);
      return sum + (sub.isShared ? this.getMyShare(sub, converted) : converted);
    }, 0);
  });

  readonly upcomingBillings = computed(() => {
    const rates = this.exchangeRates();
    const base = this.baseCurrency();
    if (!rates) return [];

    return this.activeSubscriptions()
      .map((sub) => {
        const days = daysUntil(sub.nextBillingDate);
        const amount = sub.isShared
          ? this.getMyShare(sub, sub.amount)
          : sub.amount;
        return {
          subscription: sub,
          daysUntil: days,
          amountInBaseCurrency: convertCurrency(amount, sub.currency, base, rates),
        };
      })
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  });

  readonly billingReminders = computed(() =>
    this.upcomingBillings().filter((item) => {
      const remindDays = item.subscription.remindDaysBefore;
      return item.daysUntil <= remindDays && item.daysUntil >= 0;
    }),
  );

  readonly categoryBreakdown = computed(() => {
    const rates = this.exchangeRates();
    const base = this.baseCurrency();
    if (!rates) return [];

    const cats = this.categories();
    return cats
      .map((cat) => {
        const total = this.activeSubscriptions()
          .filter((s) => s.categoryId === cat.id)
          .reduce((sum, sub) => {
            const monthly = toMonthlyAmount(sub.amount, sub.billingCycle);
            const converted = convertCurrency(monthly, sub.currency, base, rates);
            return sum + (sub.isShared ? this.getMyShare(sub, converted) : converted);
          }, 0);
        return { category: cat, total };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  readonly sharedSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.isShared && s.status === 'active'),
  );

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subby.onLoadStart();

    const settings$ = environment.useSupabase
      ? this.supabaseData.getBaseCurrency().pipe(catchError(() => of(environment.defaultCurrency)))
      : of(environment.defaultCurrency);

    forkJoin({
      subscriptions: this.subscriptionApi.getAll().pipe(catchError(() => of([]))),
      categories: this.categoryApi.getAll().pipe(catchError(() => of([]))),
      rates: this.currencyApi.getRates().pipe(catchError(() => of(null))),
      baseCurrency: settings$,
    })
      .pipe(
        tap(({ subscriptions, categories, rates, baseCurrency }) => {
          this.subscriptions.set(subscriptions);
          this.categories.set(categories);
          this.baseCurrency.set(baseCurrency);
          if (rates) {
            this.exchangeRates.set(rates);
          }
          this.loading.set(false);
          this.subby.onLoadDone();
        }),
        catchError((err: Error) => {
          this.error.set(err.message ?? 'Failed to load data');
          this.loading.set(false);
          this.subby.reactError(err.message ?? 'โหลดข้อมูลไม่สำเร็จ');
          return of(null);
        }),
      )
      .subscribe();
  }

  create(dto: CreateSubscriptionDto): Observable<Subscription | null> {
    this.loading.set(true);
    this.error.set(null);
    return this.subscriptionApi.create(dto).pipe(
      tap((created) => {
        this.subscriptions.update((list) => [...list, created]);
        this.loading.set(false);
        this.subby.react('created', `เพิ่ม ${created.name} สำเร็จ! 🎉`);
      }),
      catchError((err: Error) => {
        this.error.set(err.message ?? 'ไม่สามารถเพิ่ม subscription ได้');
        this.loading.set(false);
        this.subby.reactError(err.message);
        return of(null);
      }),
    );
  }

  update(id: string, dto: UpdateSubscriptionDto): Observable<Subscription | null> {
    this.loading.set(true);
    this.error.set(null);
    return this.subscriptionApi.update(id, dto).pipe(
      tap((updated) => {
        this.subscriptions.update((list) => list.map((s) => (s.id === id ? updated : s)));
        this.loading.set(false);
        this.subby.react('updated', `อัปเดต ${updated.name} แล้ว ✓`);
      }),
      catchError((err: Error) => {
        this.error.set(err.message ?? 'ไม่สามารถอัปเดต subscription ได้');
        this.loading.set(false);
        this.subby.reactError(err.message);
        return of(null);
      }),
    );
  }

  delete(id: string): void {
    const removed = this.subscriptions().find((s) => s.id === id);

    this.subscriptionApi
      .delete(id)
      .pipe(
        tap(() => {
          this.subscriptions.update((list) => list.filter((s) => s.id !== id));
          this.subby.react('deleted', removed ? `ลบ ${removed.name} แล้ว~` : undefined);
        }),
        catchError((err: Error) => {
          this.error.set(err.message);
          this.subby.reactError(err.message);
          return of(null);
        }),
      )
      .subscribe();
  }

  setBaseCurrency(currency: string): void {
    this.baseCurrency.set(currency);
    if (environment.useSupabase) {
      this.supabaseData.saveBaseCurrency(currency).subscribe();
    }
  }

  setCategoryFilter(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  convertAmount(amount: number, from: string): number {
    const rates = this.exchangeRates();
    if (!rates) return amount;
    return convertCurrency(amount, from, this.baseCurrency(), rates);
  }

  private getMyShare(sub: Subscription, totalAmount: number): number {
    if (!sub.isShared || sub.sharedMembers.length === 0) {
      return totalAmount;
    }
    const myMember = sub.sharedMembers.find((m) => m.name === 'You');
    if (myMember) {
      return myMember.shareAmount;
    }
    return totalAmount / sub.sharedMembers.length;
  }
}
