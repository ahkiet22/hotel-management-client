import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '@core/interfaces/api';
import { Booking } from '../interfaces';
export type { Booking };

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiredAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService<Booking> {
  protected override readonly endpoint = 'api/v1/bookings';

  /** POST /bookings/confirm/:id */
  confirmBooking(id: string): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(`${this.fullUrl}/confirm/${id}`, {})
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** GET /bookings/customer/:id */
  findByCustomerId(customerId: string): Observable<Booking[]> {
    return this.http
      .get<ApiResponse<Booking[]>>(`${this.fullUrl}/customer/${customerId}`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** GET /bookings/qr */
  getPaymentQr(amount: number, description: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.fullUrl}/qr`, {
        params: { amount: amount.toString(), description },
      })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** POST /bookings/by-customer */
  createByCustomer(data: any): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(`${this.fullUrl}/by-customer`, data)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** POST /bookings/served */
  createServed(data: any): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(`${this.fullUrl}/served`, data)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Coupon Management */

  createCoupon(data: any): Observable<Coupon> {
    return this.http
      .post<ApiResponse<Coupon>>(`${this.fullUrl}/coupon`, data)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  findAllCoupons(): Observable<Coupon[]> {
    return this.http
      .get<ApiResponse<Coupon[]>>(`${this.fullUrl}/coupons`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  applyCoupon(bookingId: string, couponCode: string): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(`${this.fullUrl}/coupon/use`, { bookingId, couponCode })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.fullUrl}/coupon/${id}`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }
}
