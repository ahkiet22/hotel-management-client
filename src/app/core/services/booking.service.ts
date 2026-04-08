import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

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

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService<Booking> {
  protected override readonly endpoint = 'api/v1/bookings';
}
