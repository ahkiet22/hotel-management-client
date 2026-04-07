import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/services/loading.service';
import { SKIP_LOADING } from '@core/http/context.http';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  // Golobally track active HTTP requests to manage loading state
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.context.get(SKIP_LOADING) === true) {
      return next.handle(request);
    }
    if (this.activeRequests === 0) {
      this.loadingService.show();
    }
    this.activeRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.hide();
        }
      }),
    );
  }
}
