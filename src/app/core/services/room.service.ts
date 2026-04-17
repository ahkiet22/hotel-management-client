import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse, ListResponse } from '@core/interfaces/api';
import { Room } from '../interfaces';
export type { Room };

@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseService<Room> {
  protected override readonly endpoint = 'api/v1/rooms';

  /**
   * Get public rooms (for customers)
   */
  getPublicRooms(page: number = 1, limit: number = 10): Observable<ListResponse<Room>> {
    return this.http
      .get<ApiResponse<ListResponse<Room>>>(`${this.fullUrl}/public`, {
        params: { page: page.toString(), limit: limit.toString() },
      })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError),
      );
  }

  /**
   * Get public room by ID
   */
  getPublicRoomById(id: string): Observable<Room> {
    return this.http
      .get<ApiResponse<Room>>(`${this.fullUrl}/public/${id}`)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError),
      );
  }

  /**
   * Admin/Staff get all rooms (paginated)
   */
  getRooms(page: number = 1, limit: number = 10): Observable<ListResponse<Room>> {
    return this.getAll({ page, limit });
  }
}
