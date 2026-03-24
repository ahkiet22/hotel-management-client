import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import PAYMENTS_DATA from '@assets/mocks/payments.json';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'Pending' | 'Completed' | 'Failed';
  transaction_id?: string;
  created_at?: string;
}

const MOCK_PAYMENTS = PAYMENTS_DATA as unknown as Payment[];

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends BaseService<Payment> {
  protected override readonly endpoint = 'api/v1/payments';

  override getAll(query?: any): Observable<Payment[]> {
    return of(MOCK_PAYMENTS);
  }

  override getById(id: string | number): Observable<Payment> {
    const payment = MOCK_PAYMENTS.find((p) => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return of(payment);
  }
}
