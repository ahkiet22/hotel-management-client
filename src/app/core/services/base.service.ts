import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, map, retry, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, ListResponse } from '@core/interfaces/api';

export abstract class BaseService<T> {
  protected http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  protected get fullUrl() {
    const api = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
    const endpoint = this.endpoint.startsWith('/') ? this.endpoint.slice(1) : this.endpoint;
    return `${api}${endpoint}`;
  }

  getAll(query?: any): Observable<ListResponse<T>> {
    const params = this.buildParams(query);
    return this.http
      .get<ApiResponse<ListResponse<T>>>(this.fullUrl, { params })
      .pipe(
        map((res) => res.data),
        retry(1),
        catchError(this.handleError)
      );
  }

  getById(id: string | number): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.fullUrl}/${id}`)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  create(item: Partial<T>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.fullUrl, item)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  update(id: string | number, item: Partial<T>): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.fullUrl}/${id}`, item)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  delete(id: string | number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.fullUrl}/${id}`)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  protected buildParams(query?: any): HttpParams {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }
    return params;
  }

  protected handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error?.error || new Error('Something went wrong. Please try again later.'));
  }
  protected handleError404(error: any) {
    if (error.status === 404) {
      return throwError(() => new Error('Resource not found.'));
    }
    return this.handleError(error);
  }
  protected handleError401(error: any) {
    if (error.status === 401) {
      return throwError(() => new Error('Unauthorized.'));
    }
    return this.handleError(error);
  }
}
