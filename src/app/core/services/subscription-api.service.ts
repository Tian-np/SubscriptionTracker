import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api.model';
import {
  CreateSubscriptionDto,
  MonthlySummary,
  Subscription,
  UpdateSubscriptionDto,
} from '../models/subscription.model';
import { ApiService } from './api.service';
import { MockApiService } from './mock-api.service';
import { SupabaseSubscriptionService } from './supabase-subscription.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionApiService {
  private readonly api = inject(ApiService);
  private readonly mock = inject(MockApiService);
  private readonly supabase = inject(SupabaseSubscriptionService);
  private readonly useMock = environment.useMockApi;
  private readonly useSupabase = environment.useSupabase;

  getAll(): Observable<Subscription[]> {
    if (this.useSupabase) {
      return this.supabase.getAll();
    }
    if (this.useMock) {
      return this.mock.getSubscriptions();
    }
    return this.api
      .get<ApiListResponse<Subscription>>('/subscriptions')
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Subscription> {
    if (this.useSupabase) {
      return this.supabase.getById(id);
    }
    if (this.useMock) {
      return this.mock.getSubscription(id).pipe(
        map((sub) => {
          if (!sub) throw new Error('Subscription not found');
          return sub;
        }),
      );
    }
    return this.api
      .get<ApiResponse<Subscription>>(`/subscriptions/${id}`)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateSubscriptionDto): Observable<Subscription> {
    if (this.useSupabase) {
      return this.supabase.create(dto);
    }
    if (this.useMock) {
      return this.mock.createSubscription(dto);
    }
    return this.api
      .post<ApiResponse<Subscription>>('/subscriptions', dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateSubscriptionDto): Observable<Subscription> {
    if (this.useSupabase) {
      return this.supabase.update(id, dto);
    }
    if (this.useMock) {
      return this.mock.updateSubscription(id, dto);
    }
    return this.api
      .patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    if (this.useSupabase) {
      return this.supabase.delete(id);
    }
    if (this.useMock) {
      return this.mock.deleteSubscription(id);
    }
    return this.api.delete<void>(`/subscriptions/${id}`);
  }

  getMonthlySummary(baseCurrency: string): Observable<MonthlySummary> {
    if (this.useSupabase) {
      return this.supabase.getMonthlySummary(baseCurrency);
    }
    if (this.useMock) {
      return this.mock.getMonthlySummary(baseCurrency);
    }
    return this.api
      .get<ApiResponse<MonthlySummary>>('/subscriptions/summary/monthly', { baseCurrency })
      .pipe(map((res) => res.data));
  }
}
