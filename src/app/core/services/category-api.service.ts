import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../models/api.model';
import { Category, DEFAULT_CATEGORIES } from '../models/category.model';
import { ApiService } from './api.service';
import { MockApiService } from './mock-api.service';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly api = inject(ApiService);
  private readonly mock = inject(MockApiService);
  private readonly useMock = environment.useMockApi;
  private readonly useSupabase = environment.useSupabase;

  getAll(): Observable<Category[]> {
    if (this.useSupabase) {
      return from(Promise.resolve([...DEFAULT_CATEGORIES]));
    }
    if (this.useMock) {
      return this.mock.getCategories();
    }
    return this.api.get<ApiListResponse<Category>>('/categories').pipe(map((res) => res.data));
  }
}
