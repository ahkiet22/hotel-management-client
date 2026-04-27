import { Component, OnDestroy, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { PermissionService } from '@core/services/permission.service';
import { SIDEBAR_ITEMS, SidebarItem } from '@core/constants/sidebar';
import {
  LucideAngularModule,
  ChevronDown,
  LogOut,
  Maximize,
  Menu,
  Minimize,
  X
} from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LucideAngularModule],
  templateUrl: './manager-layout.component.html',
})
export class ManagerLayoutComponent implements OnDestroy {
  auth = inject(AuthStore);
  permissionService = inject(PermissionService);
  isCollapsed = signal(false);
  isFullscreen = signal(false);
  toggleMap: Record<string, boolean> = {};
  menuItems = computed(() => this.filterMenuItems(SIDEBAR_ITEMS));

  icons = {
    ChevronDown,
    LogOut,
    Maximize,
    Menu,
    Minimize,
    X
  };

  constructor(private router: Router) {
    effect(() => {
      this.auth.user();
      this.expandActiveMenus();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.expandActiveMenus();
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      this.syncFullscreenState();
    }
  }

  private filterMenuItems(items: SidebarItem[]): SidebarItem[] {
    return items
      .map(item => {
        const children = item.children ? this.filterMenuItems(item.children) : undefined;
        return {
          ...item,
          children
        };
      })
      .filter(item => {
        const hasVisibleChildren = !!item.children?.length;
        const hasPermission = !item.permission || (
          Array.isArray(item.permission)
            ? this.permissionService.hasAnyPermission(item.permission)
            : this.permissionService.hasPermission(item.permission)
        );

        if (hasVisibleChildren) return hasPermission || !item.href;
        return hasPermission;
      });
  }

  private expandActiveMenus() {
    this.menuItems().forEach(item => {
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
    return !!path && this.router.url.startsWith(path);
  }

  toggleSidebar() {
    this.isCollapsed.update((state) => !state);
  }

  async toggleFullscreen() {
    if (typeof document === 'undefined') {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen', error);
    } finally {
      this.syncFullscreenState();
    }
  }

  onLogout() {
    this.auth.clearAuth();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    }
  }

  private handleFullscreenChange = () => {
    this.syncFullscreenState();
  };

  private syncFullscreenState() {
    this.isFullscreen.set(typeof document !== 'undefined' && !!document.fullscreenElement);
  }
}
