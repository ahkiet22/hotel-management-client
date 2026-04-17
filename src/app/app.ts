import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/stores/auth.store';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
      this.authService.getProfile().subscribe({
        next: (res) => {
          if (res.success) {
            this.authStore.setUser(res.data);
          }
        },
        error: () => {
          this.authStore.clearAuth();
        },
      });
    }
  }
}
