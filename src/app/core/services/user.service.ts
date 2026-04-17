import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '@core/interfaces/api';
import { User } from '../interfaces';
export type { User };

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<User> {
  protected override readonly endpoint = 'api/v1/users';

  /**
   * Public registration
   */
  register(data: any): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.fullUrl}/register`, data)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /**
   * Change current user password
   */
  changePassword(data: any): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.fullUrl}/change-password`, data)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }
}
