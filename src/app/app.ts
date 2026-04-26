import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/stores/auth.store';
import { AuthService } from './core/services/auth.service';
import { UiToastComponent } from '@shared/components/ui-toast/ui-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('hotel-management-client');
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);

  ngOnInit() {
    this.authStore.initialize();
    if (this.authStore.isAuthenticated()) {
      this.authService.getMe().subscribe({
        next: (res) => {
          this.authStore.setUser({
            id: res.id,
            email: res.email,
            fullName: res.fullName,
            roleName: res.role.name,
            role_id: res.role.id
          });
        },
        error: () => {
          this.authStore.forceLogout();
        },
      });
    }
  }
}
