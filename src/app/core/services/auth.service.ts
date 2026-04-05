import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { BaseService } from './base.service';
import BOOKINGS_DATA from '@assets/mocks/bookings.json';
import { ApiResponse } from '@core/interfaces/api';
import { HttpContext } from 'node_modules/@angular/common/types/_module-chunk';
import { IS_PUBLIC_ENABLED } from '@core/http/context.http';

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

  login(data: LoginData): Observable<ApiResponse<AuthTokens>> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.fullUrl}/login`, data, {
        context: new HttpContext().set(IS_PUBLIC_ENABLED, true),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
        }),
        catchError(this.handleError),
      );
  }
  
  logout(): Observable<ApiResponse<AuthTokens>> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.fullUrl}/logout`, {})
      .pipe(catchError(this.handleError));
  }

  refreshToken(): Observable<ApiResponse<AuthTokens>> {
    return this.http
      .post<ApiResponse<AuthTokens>>(
        `${this.fullUrl}/refresh`,
        {},
        {
          context: new HttpContext().set(IS_PUBLIC_ENABLED, true),
        },
      )
      .pipe(catchError(this.handleError));
  }
}
