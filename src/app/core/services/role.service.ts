import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { CreateRoleDto, Role, UpdateRoleDto } from '../interfaces/role.dto';
export type { CreateRoleDto, Role, UpdateRoleDto };

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {
  protected override readonly endpoint = 'api/v1/roles';

  override getAll(): Observable<PaginatedResponse<Role>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}api/v1/roles`)
      .pipe(
        map(res => ({
          result: res.data,
          meta: {
            page: 1,
            limit: res.data.length,
            totalPages: 1,
            totalItems: res.data.length
          }
        })),
        catchError(this.handleError)
      );
  }

  override getById(id: string): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}api/v1/roles/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateRoleDto): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}api/v1/roles`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateRoleDto): Observable<Role> {
    return this.http.patch<ApiResponse<Role>>(`${this.baseUrl}api/v1/roles/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/roles/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
