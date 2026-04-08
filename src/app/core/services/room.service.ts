import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseService } from './base.service';

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


@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseService<Room> {
  protected override readonly endpoint = 'api/v1/rooms';

  // --- Extra Endpoints ---

  addService(roomId: string | number, serviceId: string | number): Observable<any> {
    return this.http.post(`${this.fullUrl}/${roomId}/services`, { serviceId }).pipe(
      map((res: any) => res.data),
      catchError(this.handleError)
    );
  }

  removeService(roomId: string | number, serviceId: string | number): Observable<any> {
    return this.http.delete(`${this.fullUrl}/${roomId}/services/${serviceId}`).pipe(
      map((res: any) => res.data),
      catchError(this.handleError)
    );
  }
}
