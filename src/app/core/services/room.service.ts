import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseService } from './base.service';

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  room_type_name?: string;
  status: 'Vacant' | 'Reserved' | 'Occupied' | 'Out of Order';
  price?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseService<Room> {
  protected override readonly endpoint = 'api/v1/rooms';

  // --- Public APIs ---
  getPublicRooms(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.fullUrl}/public?page=${page}&limit=${limit}`).pipe(
      map((res: any) => res.data),
      catchError(this.handleError),
    );
  }

  getPublicRoomById(id: string | number): Observable<any> {
    return this.http.get(`${this.fullUrl}/public/${id}`).pipe(
      map((res: any) => res.data),
      catchError(this.handleError),
    );
  }

  // --- Extra Endpoints ---
  addService(roomId: string | number, serviceId: string | number): Observable<any> {
    return this.http.post(`${this.fullUrl}/${roomId}/services`, { serviceId }).pipe(
      map((res: any) => res.data),
      catchError(this.handleError),
    );
  }

  removeService(roomId: string | number, serviceId: string | number): Observable<any> {
    return this.http.delete(`${this.fullUrl}/${roomId}/services/${serviceId}`).pipe(
      map((res: any) => res.data),
      catchError(this.handleError),
    );
  }
}
