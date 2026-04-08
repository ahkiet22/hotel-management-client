import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'Pending' | 'Completed' | 'Failed';
  transaction_id?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends BaseService<Payment> {
  protected override readonly endpoint = 'api/v1/payments';
}
