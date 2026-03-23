import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseService } from './base.service';

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  status: string; // 'Vacant' | 'Reserved' | 'Occupied' | 'Out_of_Order'
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService extends BaseService<Room> {
  protected override readonly endpoint = 'assets/mocks/rooms.json';

  override getAll(query?: any): Observable<Room[]> {
    return this.http.get<Room[]>(this.endpoint).pipe(catchError(this.handleError.bind(this)));
  }

  override getById(id: string | number): Observable<Room> {
    return this.http.get<Room[]>(this.endpoint).pipe(
      map(rooms => {
        const room = rooms.find(r => r.id === id);
        if (!room) throw new Error('Room not found');
        return room;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  override create(item: Room): Observable<Room> {
    return of({ ...item, id: `mock-${Date.now()}` }).pipe(catchError(this.handleError.bind(this)));
  }

  override update(id: string | number, item: Partial<Room>): Observable<Room> {
    return of({ id: String(id), ...item } as Room).pipe(catchError(this.handleError.bind(this)));
  }

  override delete(id: string | number): Observable<any> {
    return of({ success: true, message: 'Room deleted' }).pipe(catchError(this.handleError.bind(this)));
  }

  // --- Extra Endpoints according to API Design ---

  addService(roomId: string | number, serviceId: string | number): Observable<any> {
    // Mock the PATCH api/v1/rooms/add-service/:id endpoint
    return of({ success: true, message: `Service ${serviceId} added to room ${roomId}` }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  removeService(roomId: string | number, serviceId: string | number): Observable<any> {
    // Mock the PATCH api/v1/rooms/remove-service/:id endpoint
    return of({ success: true, message: `Service ${serviceId} removed from room ${roomId}` }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
