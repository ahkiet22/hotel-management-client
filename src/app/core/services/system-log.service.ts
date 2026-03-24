import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import LOGS_DATA from '@assets/mocks/system_logs.json';

export interface SystemLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  created_at: string;
}

const MOCK_LOGS = LOGS_DATA as unknown as SystemLog[];

@Injectable({
  providedIn: 'root',
})
export class SystemLogService extends BaseService<SystemLog> {
  protected override readonly endpoint = 'api/v1/admin/logs';

  override getAll(query?: any): Observable<SystemLog[]> {
    return of(MOCK_LOGS);
  }

  override getById(id: string | number): Observable<SystemLog> {
    const log = MOCK_LOGS.find((l) => l.id === id);
    if (!log) throw new Error('Log not found');
    return of(log);
  }
}
