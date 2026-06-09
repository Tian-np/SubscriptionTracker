import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { ExchangeRates } from '../models/currency.model';
import { ApiService } from './api.service';
import { MockApiService } from './mock-api.service';
import { SupabaseSubscriptionService } from './supabase-subscription.service';

@Injectable({ providedIn: 'root' })
export class CurrencyApiService {
  private readonly api = inject(ApiService);
  private readonly mock = inject(MockApiService);
  private readonly supabase = inject(SupabaseSubscriptionService);
  private readonly useMock = environment.useMockApi;
  private readonly useSupabase = environment.useSupabase;

  getRates(): Observable<ExchangeRates> {
    if (this.useSupabase) {
      return this.supabase.getExchangeRates();
    }
    if (this.useMock) {
      return this.mock.getExchangeRates();
    }
    return this.api
      .get<ApiResponse<ExchangeRates>>('/currency/rates')
      .pipe(map((res) => res.data));
  }
}
