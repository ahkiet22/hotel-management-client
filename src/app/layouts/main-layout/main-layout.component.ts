import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { AppRole } from '@core/constants/permissions';
import { HlmButton } from '@spartan-ng/helm/button';
import { User, Menu, X, LucideAngularModule, Star, LayoutDashboard } from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly User = User;
  readonly Menu = Menu;
  readonly Star = Star;
  readonly X = X;
  readonly LayoutDashboard = LayoutDashboard;
  auth = inject(AuthStore);
  canAccessManager = computed(() => {
    const role = this.auth.user()?.roleName as AppRole | undefined;
    return role === 'Admin' || role === 'Staff';
  });

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
