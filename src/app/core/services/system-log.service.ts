import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface SystemLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class SystemLogService extends BaseService<SystemLog> {
  protected override readonly endpoint = 'api/v1/admin/logs';
}
