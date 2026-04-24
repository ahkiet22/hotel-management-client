import { Injectable } from '@angular/core';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: string;
  ip: string | null;
  user_agent: string | null;
  description: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class SystemLogService extends BaseService {
  protected override readonly endpoint = 'api/v1/admin/logs';

  override getAll(params: any): Observable<PaginatedResponse<SystemLog>> {
    return this.http.get<ApiResponse<PaginatedResponse<SystemLog>>>(`${this.baseUrl}${this.endpoint}`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
