import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (auth.isAuthenticated() && auth.user()) {
    return true;
  }

  return router.parseUrl('/login');
};
