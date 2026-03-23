import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
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
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  protected override readonly endpoint = 'assets/mocks/users.json';

  override getAll(query?: any): Observable<User[]> {
    return this.http.get<User[]>(this.fullUrl).pipe(catchError(this.handleError.bind(this)));
  }

  override getById(id: string | number): Observable<User> {
    return this.http.get<User[]>(this.fullUrl).pipe(
      map(users => {
        const user = users.find(u => u.id === id);
        if (!user) throw new Error('User not found');
        return user;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  override create(item: User): Observable<User> {
    return of({ ...item, id: `mock-${Date.now()}` }).pipe(catchError(this.handleError.bind(this)));
  }

  override update(id: string | number, item: Partial<User>): Observable<User> {
    return of({ id: String(id), ...item } as User).pipe(catchError(this.handleError.bind(this)));
  }

  override delete(id: string | number): Observable<any> {
    return of({ success: true, message: 'User deleted' }).pipe(catchError(this.handleError.bind(this)));
  }
}