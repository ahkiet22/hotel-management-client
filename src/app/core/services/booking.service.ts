import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import BOOKINGS_DATA from '@assets/mocks/bookings.json';

export interface Booking {
  id: string;
  short_id: string;
  customer_id: string;
  staff_id: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string | null;
  actual_check_out?: string | null;
  total_room_price: number;
  total_service_price: number;
  grand_total: number;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  created_at?: string;
  updated_at?: string;
}

const MOCK_BOOKINGS = BOOKINGS_DATA as unknown as Booking[];

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService<Booking> {
  protected override readonly endpoint = 'api/v1/bookings';

  override getAll(query?: any): Observable<Booking[]> {
    return of(MOCK_BOOKINGS);
  }

  override getById(id: string | number): Observable<Booking> {
    const booking = MOCK_BOOKINGS.find((b) => b.id === id || b.short_id === String(id));
    if (!booking) throw new Error('Booking not found');
    return of(booking);
  }
}
