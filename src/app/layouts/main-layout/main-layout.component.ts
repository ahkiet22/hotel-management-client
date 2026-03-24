import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { HlmButton } from '@spartan-ng/helm/button';
import { User, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmButton, LucideAngularModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly User = User;
  auth = inject(AuthStore);
}
