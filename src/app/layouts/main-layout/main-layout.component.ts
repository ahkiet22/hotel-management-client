import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { HlmButton } from '@spartan-ng/helm/button';
import { User, Menu, X, LucideAngularModule, Star } from 'lucide-angular';

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
  auth = inject(AuthStore);

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
