import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  authErrorMessage,
  emailToUsername,
  normalizeUsername,
  usernameToEmail,
} from '../utils/auth.util';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService {
  private readonly supabase = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly authError = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly username = computed(() => {
    const u = this.user();
    if (!u) return '';
    const meta = u.user_metadata?.['username'] as string | undefined;
    return meta ?? emailToUsername(u.email);
  });

  /** @deprecated use username() */
  readonly userEmail = this.username;

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

  signUp(username: string, password: string): Observable<void> {
    const normalized = normalizeUsername(username);
    return this.authOp(() =>
      this.supabase.client!.auth.signUp({
        email: usernameToEmail(normalized),
        password,
        options: {
          data: { username: normalized },
        },
      }),
    );
  }

  signIn(username: string, password: string): Observable<void> {
    const normalized = normalizeUsername(username);
    return this.authOp(() =>
      this.supabase.client!.auth.signInWithPassword({
        email: usernameToEmail(normalized),
        password,
      }),
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
          const msg = authErrorMessage(error.message);
          this.authError.set(msg);
          throw new Error(msg);
        }
        this.authError.set(null);
      }),
    );
  }
}
