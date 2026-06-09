import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { RegisterPushDto } from '../models/push.model';
import { ApiService } from './api.service';

const STORAGE_KEY = 'subtracker_push_subscription';

@Injectable({ providedIn: 'root' })
export class PushApiService {
  private readonly api = inject(ApiService);

  register(dto: RegisterPushDto): Observable<void> {
    if (environment.useMockApi) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dto));
      return of(void 0);
    }
    return this.api
      .post<ApiResponse<void>>('/push/subscribe', dto)
      .pipe(map(() => void 0));
  }

  unregister(endpoint: string): Observable<void> {
    if (environment.useMockApi) {
      localStorage.removeItem(STORAGE_KEY);
      return of(void 0);
    }
    return this.api
      .post<ApiResponse<void>>('/push/unsubscribe', { endpoint })
      .pipe(map(() => void 0));
  }

  isRegistered(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }
}
