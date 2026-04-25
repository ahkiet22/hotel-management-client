import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  protected http = inject(HttpClient);
  protected baseUrl: string = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  protected abstract readonly endpoint: string;

  protected getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  getAll(query?: any): Observable<PaginatedResponse<any>> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && query[key] !== null) {
          params = params.set(key, query[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}${this.endpoint}`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  create(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  update(id: string, data: any): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred!';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);

    if (isPlatformServer(this.platformId)) {
      return EMPTY;
    }

    return throwError(() => new Error(errorMessage));
  };
}
