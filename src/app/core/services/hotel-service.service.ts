import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { 
  AddBookingServiceDto, 
  CreateServiceDto, 
  QueryServiceDto, 
  UpdateServiceDto,
  HotelService
} from '../interfaces/service.dto';
export type { 
  AddBookingServiceDto, 
  CreateServiceDto, 
  QueryServiceDto, 
  UpdateServiceDto,
  HotelService
};

@Injectable({
  providedIn: 'root'
})
export class HotelServiceService extends BaseService {
  protected override readonly endpoint = 'api/v1/services';

  override getAll(query?: QueryServiceDto): Observable<PaginatedResponse<HotelService>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<HotelService>>>(`${this.baseUrl}api/v1/services`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override getById(id: string): Observable<HotelService> {
    return this.http.get<ApiResponse<HotelService>>(`${this.baseUrl}api/v1/services/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateServiceDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/services`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateServiceDto): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/services/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/services/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  addToBooking(bookingId: string, dto: AddBookingServiceDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/services/booking/${bookingId}`, dto)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getBookingServices(bookingId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}api/v1/services/booking/${bookingId}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
