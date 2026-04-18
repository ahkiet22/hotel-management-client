import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { PermissionService } from '@core/services/permission.service';
import { SIDEBAR_ITEMS, SidebarItem } from '@core/constants/sidebar';
import {
  LucideAngularModule,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LucideAngularModule],
  templateUrl: './manager-layout.component.html',
})
export class ManagerLayoutComponent {
  auth = inject(AuthStore);
  permissionService = inject(PermissionService);
  isCollapsed = signal(false);
  toggleMap: Record<string, boolean> = {};
  menuItems: SidebarItem[] = [];

  icons = {
    ChevronDown,
    LogOut,
    Menu,
    X
  };

  constructor(private router: Router) {
    // Filter menu items based on permissions
    this.menuItems = this.filterMenuItems(SIDEBAR_ITEMS);

    // Check current URL to expand active menus on load
    this.expandActiveMenus();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.expandActiveMenus();
    });
  }

  private filterMenuItems(items: SidebarItem[]): SidebarItem[] {
    return items
      .filter(item => {
        if (!item.permission) return true;
        return Array.isArray(item.permission)
          ? this.permissionService.hasAnyPermission(item.permission)
          : this.permissionService.hasPermission(item.permission);
      })
      .map(item => ({
        ...item,
        children: item.children ? this.filterMenuItems(item.children) : undefined
      }));
  }

  private expandActiveMenus() {
    this.menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => this.isActive(child.href));
        if (hasActiveChild) {
          this.toggleMap[item.title] = true;
        }
      }
    });
  }

  toggle(title: string) {
    this.toggleMap[title] = !this.toggleMap[title];
  }

  isActive(path?: string) {
    return path && this.router.url.startsWith(path);
  }

  toggleSidebar() {
    this.isCollapsed.update((state) => !state);
  }

  // onLogout() {
  //   this.auth.logout();
  // }
}
