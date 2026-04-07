import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap, switchMap, map } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse } from '@core/interfaces/api';
import { IS_PUBLIC_ENABLED } from '@core/http/context.http';
import { HttpContext } from '@angular/common/http';
import { AuthStore, User } from '../stores/auth.store';
import { StorageService } from './storage.service';

interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService<any> {
  protected override readonly endpoint = 'api/v1/auth';
  private authStore = inject(AuthStore);
  private storageService = inject(StorageService);

  login(data: LoginData): Observable<ApiResponse<AuthTokens>> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.fullUrl}/login`, data, {
        context: new HttpContext().set(IS_PUBLIC_ENABLED, true),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.storageService.set('accessToken', response.data.accessToken);
            this.storageService.set('refreshToken', response.data.refreshToken);
          }
        }),
        switchMap((response) => {
          if (response.success) {
            return this.getProfile().pipe(
              map((profileRes) => {
                if (profileRes.success) {
                  this.authStore.setAuth(profileRes.data, response.data.accessToken);
                }
                return response;
              }),
            );
          }
          return of(response);
        }),
        catchError(this.handleError),
      );
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.fullUrl}/logout`, {}).pipe(
      tap(() => {
        this.authStore.clearAuth();
      }),
      catchError((err) => {
        this.authStore.clearAuth();
        return this.handleError(err);
      }),
    );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${this.fullUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  refreshToken(): Observable<ApiResponse<AuthTokens>> {
    const refreshToken = this.storageService.get<string>('refreshToken');
    return this.http
      .post<ApiResponse<AuthTokens>>(
        `${this.fullUrl}/refresh`,
        { refreshToken },
        {
          context: new HttpContext().set(IS_PUBLIC_ENABLED, true),
        },
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            this.storageService.set('accessToken', response.data.accessToken);
            this.storageService.set('refreshToken', response.data.refreshToken);
          }
        }),
        catchError(this.handleError),
      );
  }
}
