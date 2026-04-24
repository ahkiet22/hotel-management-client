import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { CreateRoomDto, QueryRoomDto, Room, UpdateRoomDto } from '../interfaces/room.dto';
export type { CreateRoomDto, QueryRoomDto, Room, UpdateRoomDto };

@Injectable({
  providedIn: 'root'
})
export class RoomService extends BaseService {
  protected override readonly endpoint = 'api/v1/rooms';

  override getAll(query?: QueryRoomDto): Observable<PaginatedResponse<Room>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.room_type_id) params = params.set('room_type_id', query.room_type_id);
      if (query.status) params = params.set('status', query.status);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Room>>>(`${this.baseUrl}api/v1/rooms`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getAllPublic(query?: QueryRoomDto): Observable<PaginatedResponse<Room>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.room_type_id) params = params.set('room_type_id', query.room_type_id);
      if (query.status) params = params.set('status', query.status);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Room>>>(`${this.baseUrl}api/v1/rooms/public`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override getById(id: string): Observable<Room> {
    return this.http.get<ApiResponse<Room>>(`${this.baseUrl}api/v1/rooms/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateRoomDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/rooms`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateRoomDto): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/rooms/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/rooms/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
