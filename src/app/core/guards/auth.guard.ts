import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { SupabaseAuthService } from '../services/supabase-auth.service';

export const authGuard: CanActivateFn = () => {
  if (!environment.useSupabase) {
    return true;
  }

  const auth = inject(SupabaseAuthService);
  const router = inject(Router);

  if (auth.loading()) {
    return router.createUrlTree(['/login']);
  }

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
