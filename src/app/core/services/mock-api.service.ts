import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { DEFAULT_CATEGORIES } from '../models/category.model';
import { ExchangeRates } from '../models/currency.model';
import {
  CreateSubscriptionDto,
  MonthlySummary,
  Subscription,
  UpdateSubscriptionDto,
} from '../models/subscription.model';

const MOCK_RATES: ExchangeRates = {
  base: 'THB',
  rates: { THB: 1, USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.2, SGD: 0.038 },
  updatedAt: new Date().toISOString(),
};

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    categoryId: 'streaming',
    amount: 419,
    currency: 'THB',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(5),
    status: 'active',
    isShared: true,
    sharedMembers: [
      { name: 'You', shareAmount: 140 },
      { name: 'Friend A', shareAmount: 140 },
      { name: 'Friend B', shareAmount: 139 },
    ],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'YouTube Premium',
    categoryId: 'streaming',
    amount: 149,
    currency: 'THB',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(12),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'iCloud+ 200GB',
    categoryId: 'cloud',
    amount: 99,
    currency: 'THB',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(2),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'ChatGPT Plus',
    categoryId: 'ai',
    amount: 20,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(8),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'GitHub Copilot',
    categoryId: 'dev',
    amount: 10,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(20),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'example.com Domain',
    categoryId: 'hosting',
    amount: 450,
    currency: 'THB',
    billingCycle: 'yearly',
    nextBillingDate: daysFromNow(45),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'DigitalOcean VPS',
    categoryId: 'hosting',
    amount: 6,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(15),
    status: 'active',
    isShared: false,
    sharedMembers: [],
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Adobe Creative Cloud',
    categoryId: 'productivity',
    amount: 798,
    currency: 'THB',
    billingCycle: 'monthly',
    nextBillingDate: daysFromNow(30),
    status: 'cancelled',
    isShared: false,
    sharedMembers: [],
    notes: 'ไม่ได้ใช้แล้ว — ยกเลิกเมื่อ ม.ค.',
    remindDaysBefore: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private subscriptions = [...INITIAL_SUBSCRIPTIONS];

  getSubscriptions(): Observable<Subscription[]> {
    return of([...this.subscriptions]).pipe(delay(300));
  }

  getSubscription(id: string): Observable<Subscription | undefined> {
    return of(this.subscriptions.find((s) => s.id === id)).pipe(delay(200));
  }

  createSubscription(dto: CreateSubscriptionDto): Observable<Subscription> {
    const now = new Date().toISOString();
    const subscription: Subscription = {
      ...dto,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptions = [...this.subscriptions, subscription];
    return of(subscription).pipe(delay(300));
  }

  updateSubscription(id: string, dto: UpdateSubscriptionDto): Observable<Subscription> {
    const index = this.subscriptions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    const updated: Subscription = {
      ...this.subscriptions[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.subscriptions = this.subscriptions.map((s) => (s.id === id ? updated : s));
    return of(updated).pipe(delay(300));
  }

  deleteSubscription(id: string): Observable<void> {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
    return of(void 0).pipe(delay(200));
  }

  getCategories() {
    return of([...DEFAULT_CATEGORIES]).pipe(delay(100));
  }

  getExchangeRates(): Observable<ExchangeRates> {
    return of({ ...MOCK_RATES, updatedAt: new Date().toISOString() }).pipe(delay(200));
  }

  getMonthlySummary(baseCurrency: string): Observable<MonthlySummary> {
    const active = this.subscriptions.filter((s) => s.status === 'active');
    const byCategory = DEFAULT_CATEGORIES.map((cat) => {
      const subs = active.filter((s) => s.categoryId === cat.id);
      const total = subs.reduce((sum, s) => {
        const monthly = s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
        return sum + this.convert(monthly, s.currency, baseCurrency);
      }, 0);
      return { categoryId: cat.id, categoryName: cat.name, total };
    }).filter((c) => c.total > 0);

    const totalInBaseCurrency = byCategory.reduce((sum, c) => sum + c.total, 0);

    return of({
      month: new Date().toLocaleString('th-TH', { month: 'long', year: 'numeric' }),
      totalInBaseCurrency,
      baseCurrency,
      byCategory,
      subscriptionCount: active.length,
    }).pipe(delay(200));
  }

  private convert(amount: number, from: string, to: string): number {
    const fromRate = MOCK_RATES.rates[from] ?? 1;
    const toRate = MOCK_RATES.rates[to] ?? 1;
    return (amount / fromRate) * toRate;
  }
}
