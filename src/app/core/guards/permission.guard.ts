import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/services/permission.service';
import { PermissionType } from '@core/constants/permissions';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Get required permissions from route data
  const requiredPermission = route.data['permission'] as PermissionType;
  const requiredPermissions = route.data['permissions'] as PermissionType[];

  if (requiredPermission) {
    if (permissionService.hasPermission(requiredPermission)) {
      return true;
    }
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    if (permissionService.hasAnyPermission(requiredPermissions)) {
      return true;
    }
  } else {
    // If no permission is required, allow access
    return true;
  }

  // Redirect to unauthorized page or dashboard
  return router.parseUrl('/manager/dashboard');
};
