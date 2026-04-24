import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse } from '../interfaces/common.dto';
import { AuthResponse, LoginDto, RegisterUserDto, UserMe } from '../interfaces/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  protected override readonly endpoint = 'api/v1/auth';

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<any>(`${this.baseUrl}api/v1/auth/login`, dto)
      .pipe(
        map(res => ({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })),
        catchError(this.handleError)
      );
  }


  register(dto: RegisterUserDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/auth/register`, dto)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}api/v1/auth/refresh`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/auth/logout`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getMe(): Observable<UserMe> {
    return this.http.get<ApiResponse<UserMe>>(`${this.baseUrl}api/v1/auth/me`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
