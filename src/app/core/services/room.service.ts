import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { BaseService } from './base.service';
import ROOMS_DATA from '@assets/mocks/rooms.json';

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  room_type_name?: string;
  status: 'Vacant' | 'Reserved' | 'Occupied' | 'Out_of_Order';
  price?: number;
  created_at?: string;
  updated_at?: string;
}

const MOCK_ROOMS = ROOMS_DATA as unknown as Room[];

@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseService<Room> {
  protected override readonly endpoint = 'api/v1/rooms';

  override getAll(query?: any): Observable<Room[]> {
    return of(MOCK_ROOMS);
  }

  override getById(id: string | number): Observable<Room> {
    const room = MOCK_ROOMS.find((r) => r.id === id || r.room_number === String(id));
    if (!room) {
      return throwError(() => new Error('Room not found'));
    }
    return of(room);
  }

  override create(item: Room): Observable<Room> {
    return of({ ...item, id: `mock-${Date.now()}` });
  }

  override update(id: string | number, item: Partial<Room>): Observable<Room> {
    return of({ id: String(id), ...item } as Room);
  }

  override delete(id: string | number): Observable<any> {
    return of({ success: true, message: 'Room deleted' });
  }

  // --- Extra Endpoints ---

  addService(roomId: string | number, serviceId: string | number): Observable<any> {
    return of({ success: true, message: `Service ${serviceId} added to room ${roomId}` });
  }

  removeService(roomId: string | number, serviceId: string | number): Observable<any> {
    return of({ success: true, message: `Service ${serviceId} removed from room ${roomId}` });
  }
}
