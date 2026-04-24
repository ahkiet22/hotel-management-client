import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse, PaginatedResponse } from '../interfaces/common.dto';
import { 
  ApplyCouponDto, 
  Booking, 
  CreateBookingDto, 
  CreateCouponDto, 
  Coupon, 
  QueryBookingDto, 
  UpdateBookingDto 
} from '../interfaces/booking.dto';
export type { 
  ApplyCouponDto, 
  Booking, 
  CreateBookingDto, 
  CreateCouponDto, 
  Coupon, 
  QueryBookingDto, 
  UpdateBookingDto 
};

@Injectable({
  providedIn: 'root'
})
export class BookingService extends BaseService {
  protected override readonly endpoint = 'api/v1/bookings';

  override getAll(query?: QueryBookingDto): Observable<PaginatedResponse<Booking>> {
    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.status) params = params.set('status', query.status);
      if (query.customerId) params = params.set('customerId', query.customerId);
      if (query.checkInDate) params = params.set('checkInDate', query.checkInDate);
      if (query.checkOutDate) params = params.set('checkOutDate', query.checkOutDate);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Booking>>>(`${this.baseUrl}api/v1/bookings`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.baseUrl}api/v1/bookings/my-bookings`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override getById(id: string): Observable<Booking> {
    return this.http.get<ApiResponse<Booking>>(`${this.baseUrl}api/v1/bookings/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override create(data: CreateBookingDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override update(id: string, data: UpdateBookingDto): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/${id}`, data)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  override delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  confirm(id: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/confirm/${id}`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  checkIn(id: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/check-in/${id}`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  checkOut(id: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/check-out/${id}`, {})
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getAvailableRoomTypes(params: {
    roomTypeId?: string;
    checkIn: string;
    checkOut: string;
    capacity?: number;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams()
      .set('checkIn', params.checkIn)
      .set('checkOut', params.checkOut);
    
    if (params.roomTypeId) httpParams = httpParams.set('roomTypeId', params.roomTypeId);
    if (params.capacity) httpParams = httpParams.set('capacity', params.capacity.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}api/v1/bookings/available`, { params: httpParams })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getPaymentQr(amount: number, description: string): Observable<any> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('description', description);
    
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/qr`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  // Coupon methods
  createCoupon(dto: CreateCouponDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/coupon`, dto)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.baseUrl}api/v1/bookings/coupons`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  applyCoupon(dto: ApplyCouponDto): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/coupon/use`, dto)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}api/v1/bookings/coupon/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }
}
