import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';

// This is a guard for routes publicly accessible
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthStore);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.parseUrl('/');
  }
  return true;
};
