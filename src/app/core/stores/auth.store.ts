import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from '@core/services/storage.service';
import { AppRole } from '@core/constants/permissions';

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
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = computed(() => this._user());
  token = computed(() => this._token());
  isAuthenticated = computed(() => !!this._token());

  initialize() {
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
    this.storageService.remove('accessToken');
    this.storageService.remove('refreshToken');
  }
}