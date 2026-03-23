import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from 'src/app/stores/auth.store';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthStore);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.parseUrl('/');
  }
  return true;
};
