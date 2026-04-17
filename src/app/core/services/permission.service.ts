import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../stores/auth.store';
import { PERMISSIONS, ROLE_PERMISSIONS, PermissionType } from '../constants/permissions';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private authStore = inject(AuthStore);

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: PermissionType): boolean {
    const user = this.authStore.user();
    if (!user) return false;

    const role = user.role;
    const permissions = ROLE_PERMISSIONS[role];

    // Admin has everything
    if (permissions.includes(PERMISSIONS.ADMIN)) return true;

    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the provided permissions
   */
  hasAnyPermission(requiredPermissions: PermissionType[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => this.hasPermission(perm));
  }

  /**
   * Check if user has all of the provided permissions
   */
  hasAllPermissions(requiredPermissions: PermissionType[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) => this.hasPermission(perm));
  }
}
