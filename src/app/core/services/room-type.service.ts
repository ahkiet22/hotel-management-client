import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse, ListResponse } from '@core/interfaces/api';

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  capacity: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService extends BaseService<RoomType> {
  protected override readonly endpoint = 'api/v1/room-types';

  /**
   * Get available room types
   */
  getAvailableRoomTypes(): Observable<ListResponse<RoomType>> {
    return this.http
      .get<ApiResponse<ListResponse<RoomType>>>(`${this.fullUrl}/available`)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }
}
