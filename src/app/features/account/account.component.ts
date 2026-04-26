import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, History, LogOut } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';
import { AuthStore } from '@core/stores/auth.store';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50/50 pt-12 pb-12">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900">Your Account</h1>
          <p class="text-slate-500 mt-2">Manage your personal information and view your booking history.</p>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
          <!-- Sidebar Navigation -->
          <aside class="w-full md:w-64 shrink-0">
            <nav class="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-1">
              <a
                routerLink="/account/profile"
                routerLinkActive="bg-blue-50 text-blue-600 font-medium border-blue-100"
                class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-slate-50 text-slate-600 border border-transparent"
              >
                <lucide-icon [img]="UserIcon" class="w-5 h-5"></lucide-icon>
                <span>Profile Details</span>
              </a>
              <a
                routerLink="/account/history-booking"
                routerLinkActive="bg-blue-50 text-blue-600 font-medium border-blue-100"
                class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-slate-50 text-slate-600 border border-transparent"
              >
                <lucide-icon [img]="HistoryIcon" class="w-5 h-5"></lucide-icon>
                <span>Booking History</span>
              </a>
              
              <div class="pt-2 mt-2 border-t border-slate-100">
                <button
                  (click)="logout()"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 text-red-600 font-medium border border-transparent"
                >
                  <lucide-icon [img]="LogOutIcon" class="w-5 h-5"></lucide-icon>
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          <!-- Main Content Area -->
          <main class="flex-1">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AccountComponent {
  readonly UserIcon = User;
  readonly HistoryIcon = History;
  readonly LogOutIcon = LogOut;

  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authStore.forceLogout();
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Still clear local auth state if server fails
        this.authStore.forceLogout();
      }
    });
  }
}
