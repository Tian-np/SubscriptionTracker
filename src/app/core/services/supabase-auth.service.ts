import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService {
  private readonly supabase = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly authError = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly userEmail = computed(() => this.user()?.email ?? '');

  init(): void {
    if (!environment.useSupabase || !this.supabase.client) {
      this.loading.set(false);
      return;
    }

    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      this.user.set(session?.user ?? null);
      this.loading.set(false);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  signUp(email: string, password: string): Observable<void> {
    return this.authOp(() =>
      this.supabase.client!.auth.signUp({ email, password }),
    );
  }

  signIn(email: string, password: string): Observable<void> {
    return this.authOp(() =>
      this.supabase.client!.auth.signInWithPassword({ email, password }),
    );
  }

  signOut(): Observable<void> {
    if (!this.supabase.client) {
      return from(Promise.resolve());
    }
    return from(this.supabase.client.auth.signOut()).pipe(map(() => void 0));
  }

  private authOp(
    op: () => Promise<{ error: { message: string } | null }>,
  ): Observable<void> {
    return from(op()).pipe(
      map(({ error }) => {
        if (error) {
          this.authError.set(error.message);
          throw new Error(error.message);
        }
        this.authError.set(null);
      }),
    );
  }
}
