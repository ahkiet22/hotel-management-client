import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, Inject, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IS_PUBLIC_ENABLED } from '@core/http/context.http';
import { AuthService } from '@core/services/auth.service';
import { StorageService } from '@core/services/storage.service';
import { AuthStore } from '@core/stores/auth.store';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  private get authStore(): AuthStore {
    return this.injector.get(AuthStore);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // If IS_PUBLIC_ENABLED is true, do not add the Authorization header
    if (req.context.get(IS_PUBLIC_ENABLED)) {
      return next.handle(req);
    }

    const token = this.storageService.get<string>('accessToken');
    let authReq = req;

    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      }),
    );
  }


  // Handle 401 errors by attempting to refresh the token
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const isBrowser = isPlatformBrowser(this.platformId);
    if (!isBrowser) {
      return next.handle(request);
    }

    if (this.isRefreshRequest(request.url)) {
      this.isRefreshing = false;
      this.refreshTokenSubject.next(null);
      this.authStore.forceLogout();
      return throwError(() => new HttpErrorResponse({
        error: { message: 'Refresh token expired or invalid' },
        status: 401,
        statusText: 'Unauthorized',
        url: request.url,
      }));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refresh().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addTokenHeader(request, response.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.authStore.forceLogout();
          return throwError(() => err);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token))),
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private isRefreshRequest(url: string): boolean {
    return url.includes('/api/v1/auth/refresh');
  }
}
