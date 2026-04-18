import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { BaseService } from './base.service';
import { ApiResponse, ListResponse } from '@core/interfaces/api';
import { RoomType } from '../interfaces';

export interface AvailableRoom {
  id: string;
  roomNumber: string;
  description: string | null;
  isPublic: number;
  roomTypeId: string;
  roomTypeName: string;
  basePrice: string;
  pricePerNight: string;
  capacity: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService extends BaseService<RoomType> {
  protected override readonly endpoint = 'api/v1/room-types';

  /**
   * Get available room types
   */
  getAvailableRoomTypes(
    typeId?: string,
    checkIn?: string,
    checkOut?: string,
    capacity?: number,
  ): Observable<ListResponse<AvailableRoom>> {
    let params: any = {};
    if (typeId) params.typeId = typeId;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (capacity) params.capacity = capacity.toString();

    return this.http
      .get<ApiResponse<ListResponse<AvailableRoom>>>(`${this.fullUrl}/available`, {
        params,
      })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError),
      );
  }
}
