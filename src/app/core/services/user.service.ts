import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse, QueryParams } from '../interfaces/common.dto';
import { CreateUserDto, UpdateUserDto, User } from '../interfaces/user.dto';
export type { CreateUserDto, UpdateUserDto, User };

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  protected override readonly endpoint = 'api/v1/users';

  override getAll(query?: QueryParams): Observable<PaginatedResponse<User>> {
    return super.getAll(query) as Observable<PaginatedResponse<User>>;
  }

  override getById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}api/v1/users/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateUserDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}api/v1/users`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}api/v1/users/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/users/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
