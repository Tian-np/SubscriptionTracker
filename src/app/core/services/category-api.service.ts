import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiListResponse } from '../models/api.model';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';
import { MockApiService } from './mock-api.service';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly api = inject(ApiService);
  private readonly mock = inject(MockApiService);
  private readonly useMock = environment.useMockApi;

  getAll(): Observable<Category[]> {
    if (this.useMock) {
      return this.mock.getCategories();
    }
    return this.api.get<ApiListResponse<Category>>('/categories').pipe(map((res) => res.data));
  }
}
