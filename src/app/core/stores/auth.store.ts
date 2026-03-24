import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = computed(() => this._user());
  token = computed(() => this._token());
  isAuthenticated = computed(() => !!this._token());

  setAuth(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);
  }

  clearAuth() {
    this._user.set(null);
    this._token.set(null);
  }
}