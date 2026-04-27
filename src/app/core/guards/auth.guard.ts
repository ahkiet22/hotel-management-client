import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

// This is a guard for routes that require authentication
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  auth.initialize();

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
