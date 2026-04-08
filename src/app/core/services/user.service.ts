import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface User {
  id: string;
  role_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<User> {
  protected override readonly endpoint = 'api/v1/users';

  // Specific user methods can be added here
  // For example, if there's a search endpoint
  // search(query: string): Observable<User[]> {
  //   return this.getAll({ q: query });
  // }

  // // If we need to update status specifically
  // updateStatus(id: string | number, status: string): Observable<User> {
  //   return this.update(id, { status } as any);
  // }
}
