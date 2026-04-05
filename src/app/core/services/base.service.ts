import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '@env/environment';

export abstract class BaseService<T> {
  protected http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  protected get fullUrl() {
    const api = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
    const endpoint = this.endpoint.startsWith('/') ? this.endpoint.slice(1) : this.endpoint;
    return `${api}${endpoint}`;
  }

  getAll(query?: any): Observable<T[]> {
    let params = new HttpParams();

    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http
      .get<T[]>(this.fullUrl, { params })
      .pipe(retry(1), catchError(this.handleError));
  }

  getById(id: string | number): Observable<T | any> {
    return this.http.get<T | any>(`${this.fullUrl}/${id}`).pipe(catchError(this.handleError));
  }

  create(item: T): Observable<T | any> {
    return this.http.post<T | any>(this.fullUrl, item).pipe(catchError(this.handleError));
  }

  update(id: string | number, item: T): Observable<T | any> {
    return this.http.put<T | any>(`${this.fullUrl}/${id}`, item).pipe(catchError(this.handleError));
  }

  delete(id: string | number): Observable<T | any> {
    return this.http.delete(`${this.fullUrl}/${id}`).pipe(catchError(this.handleError));
  }

  protected handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}
