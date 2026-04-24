import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { CreateRoomTypeDto, QueryRoomTypeDto, RoomType, UpdateRoomTypeDto } from '../interfaces/room-type.dto';
export type { CreateRoomTypeDto, QueryRoomTypeDto, RoomType, UpdateRoomTypeDto };

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService extends BaseService {
  protected override readonly endpoint = 'api/v1/room-types';

  override getAll(query?: QueryRoomTypeDto): Observable<PaginatedResponse<RoomType>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<RoomType>>>(`${this.baseUrl}api/v1/room-types`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getAllPublic(query?: QueryRoomTypeDto): Observable<PaginatedResponse<RoomType>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<RoomType>>>(`${this.baseUrl}api/v1/room-types/public`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override getById(id: string): Observable<RoomType> {
    return this.http.get<ApiResponse<RoomType>>(`${this.baseUrl}api/v1/room-types/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateRoomTypeDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/room-types`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateRoomTypeDto): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/room-types/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/room-types/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
