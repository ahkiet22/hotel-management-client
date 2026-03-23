import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { BaseService } from './base.service';
import USERS_DATA from '@assets/mocks/users.json';

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

const MOCK_USERS = USERS_DATA as unknown as User[];

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<User> {
  protected override readonly endpoint = 'api/v1/users';

  override getAll(query?: any): Observable<User[]> {
    return of(MOCK_USERS);
  }

  override getById(id: string | number): Observable<User> {
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    return of(user);
  }

  override create(item: User): Observable<User> {
    return of({ ...item, id: `mock-${Date.now()}` });
  }

  override update(id: string | number, item: Partial<User>): Observable<User> {
    return of({ id: String(id), ...item } as User);
  }

  override delete(id: string | number): Observable<any> {
    return of({ success: true, message: 'User deleted' });
  }
}