import { Injectable, signal, computed, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '@core/services/storage.service';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  role_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private storageService = inject(StorageService);
  private router = inject(Router);
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  user = computed(() => this._user());
  token = computed(() => this._token());
  isAuthenticated = computed(() => !!this._token());

  initialize() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;
    const token = this.storageService.get<string>('accessToken');
    if (token) {
      this._token.set(token);
    }
  }

  setAuth(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);
    this.storageService.set('accessToken', token);
  }

  setUser(user: User) {
    this._user.set(user);
  }

  clearAuth() {
    this._user.set(null);
    this._token.set(null);
    this._initialized = true;
    this.storageService.remove('accessToken');
    this.storageService.remove('refreshToken');
  }

  forceLogout() {
    this._user.set(null);
    this._token.set(null);
    this._initialized = true;
    this.storageService.clear();

    if (isPlatformBrowser(this.platformId)) {
      void this.router.navigate(['/login']);
    }
  }
}
