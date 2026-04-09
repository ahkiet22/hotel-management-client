import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '@core/interfaces/api';

export interface Booking {
  id: string;
  short_id: string;
  customer_id: string;
  staff_id?: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string | null;
  actual_check_out?: string | null;
  total_room_price: number;
  total_service_price: number;
  grand_total: number;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  coupon_code?: string;
  discount?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
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
}
