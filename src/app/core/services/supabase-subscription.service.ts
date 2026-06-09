import { inject, Injectable } from '@angular/core';
import { from, map, Observable, throwError } from 'rxjs';

import { DEFAULT_CATEGORIES } from '../models/category.model';
import { ExchangeRates } from '../models/currency.model';
import { SubscriptionRow } from '../models/supabase.model';
import {
  CreateSubscriptionDto,
  MonthlySummary,
  Subscription,
  UpdateSubscriptionDto,
} from '../models/subscription.model';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseService } from './supabase.service';

const EXCHANGE_RATES: ExchangeRates = {
  base: 'THB',
  rates: { THB: 1, USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.2, SGD: 0.038 },
  updatedAt: new Date().toISOString(),
};

@Injectable({ providedIn: 'root' })
export class SupabaseSubscriptionService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(SupabaseAuthService);

  getAll(): Observable<Subscription[]> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('next_billing_date', { ascending: true }),
      ).pipe(
        map(({ data, error }) => {
          if (error) throw new Error(error.message);
          return (data as SubscriptionRow[]).map(toSubscription);
        }),
      ),
    );
  }

  getById(id: string): Observable<Subscription> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('subscriptions')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single(),
      ).pipe(
        map(({ data, error }) => {
          if (error) throw new Error(error.message);
          return toSubscription(data as SubscriptionRow);
        }),
      ),
    );
  }

  create(dto: CreateSubscriptionDto): Observable<Subscription> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('subscriptions')
          .insert(toRow(dto, userId))
          .select()
          .single(),
      ).pipe(
        map(({ data, error }) => {
          if (error) throw new Error(error.message);
          return toSubscription(data as SubscriptionRow);
        }),
      ),
    );
  }

  update(id: string, dto: UpdateSubscriptionDto): Observable<Subscription> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('subscriptions')
          .update(toRowUpdate(dto))
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single(),
      ).pipe(
        map(({ data, error }) => {
          if (error) throw new Error(error.message);
          return toSubscription(data as SubscriptionRow);
        }),
      ),
    );
  }

  delete(id: string): Observable<void> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId),
      ).pipe(
        map(({ error }) => {
          if (error) throw new Error(error.message);
        }),
      ),
    );
  }

  getBaseCurrency(): Observable<string> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('user_settings')
          .select('base_currency')
          .eq('user_id', userId)
          .maybeSingle(),
      ).pipe(
        map(({ data, error }) => {
          if (error) throw new Error(error.message);
          return data?.base_currency ?? 'THB';
        }),
      ),
    );
  }

  saveBaseCurrency(currency: string): Observable<void> {
    return this.query((userId) =>
      from(
        this.supabase.client!
          .from('user_settings')
          .upsert({ user_id: userId, base_currency: currency }),
      ).pipe(
        map(({ error }) => {
          if (error) throw new Error(error.message);
        }),
      ),
    );
  }

  getExchangeRates(): Observable<ExchangeRates> {
    return from(Promise.resolve({ ...EXCHANGE_RATES, updatedAt: new Date().toISOString() }));
  }

  getMonthlySummary(baseCurrency: string): Observable<MonthlySummary> {
    return this.getAll().pipe(
      map((subscriptions) => {
        const active = subscriptions.filter((s) => s.status === 'active');
        const byCategory = DEFAULT_CATEGORIES.map((cat) => {
          const subs = active.filter((s) => s.categoryId === cat.id);
          const total = subs.reduce((sum, s) => {
            const monthly = s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
            return sum + convert(monthly, s.currency, baseCurrency);
          }, 0);
          return { categoryId: cat.id, categoryName: cat.name, total };
        }).filter((c) => c.total > 0);

        return {
          month: new Date().toLocaleString('th-TH', { month: 'long', year: 'numeric' }),
          totalInBaseCurrency: byCategory.reduce((sum, c) => sum + c.total, 0),
          baseCurrency,
          byCategory,
          subscriptionCount: active.length,
        };
      }),
    );
  }

  private query<T>(fn: (userId: string) => Observable<T>): Observable<T> {
    const userId = this.auth.user()?.id;
    if (!this.supabase.client || !userId) {
      return throwError(() => new Error('Not authenticated'));
    }
    return fn(userId);
  }
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    amount: Number(row.amount),
    currency: row.currency,
    billingCycle: row.billing_cycle,
    nextBillingDate: row.next_billing_date,
    status: row.status,
    isShared: row.is_shared,
    sharedMembers: row.shared_members ?? [],
    notes: row.notes ?? undefined,
    remindDaysBefore: row.remind_days_before,
    icon: row.icon ?? undefined,
    url: row.url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(dto: CreateSubscriptionDto, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    name: dto.name,
    category_id: dto.categoryId,
    amount: dto.amount,
    currency: dto.currency,
    billing_cycle: dto.billingCycle,
    next_billing_date: dto.nextBillingDate,
    status: dto.status,
    is_shared: dto.isShared,
    shared_members: dto.sharedMembers,
    notes: dto.notes ?? null,
    remind_days_before: dto.remindDaysBefore,
    icon: dto.icon ?? null,
    url: dto.url ?? null,
  };
}

function toRowUpdate(dto: UpdateSubscriptionDto): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (dto.name !== undefined) row['name'] = dto.name;
  if (dto.categoryId !== undefined) row['category_id'] = dto.categoryId;
  if (dto.amount !== undefined) row['amount'] = dto.amount;
  if (dto.currency !== undefined) row['currency'] = dto.currency;
  if (dto.billingCycle !== undefined) row['billing_cycle'] = dto.billingCycle;
  if (dto.nextBillingDate !== undefined) row['next_billing_date'] = dto.nextBillingDate;
  if (dto.status !== undefined) row['status'] = dto.status;
  if (dto.isShared !== undefined) row['is_shared'] = dto.isShared;
  if (dto.sharedMembers !== undefined) row['shared_members'] = dto.sharedMembers;
  if (dto.notes !== undefined) row['notes'] = dto.notes;
  if (dto.remindDaysBefore !== undefined) row['remind_days_before'] = dto.remindDaysBefore;
  if (dto.icon !== undefined) row['icon'] = dto.icon;
  if (dto.url !== undefined) row['url'] = dto.url;
  return row;
}

function convert(amount: number, from: string, to: string): number {
  const fromRate = EXCHANGE_RATES.rates[from] ?? 1;
  const toRate = EXCHANGE_RATES.rates[to] ?? 1;
  return (amount / fromRate) * toRate;
}
