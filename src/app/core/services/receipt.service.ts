import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import RECEIPTS_DATA from '@assets/mocks/receipts.json';

export interface Receipt {
  id: string;
  booking_id: string;
  invoice_number: string;
  total_amount: number;
  issued_date: string;
  issued_by: string;
}

const MOCK_RECEIPTS = RECEIPTS_DATA as unknown as Receipt[];

@Injectable({
  providedIn: 'root',
})
export class ReceiptService extends BaseService<Receipt> {
  protected override readonly endpoint = 'api/v1/receipts';

  override getAll(query?: any): Observable<Receipt[]> {
    return of(MOCK_RECEIPTS);
  }

  override getById(id: string | number): Observable<Receipt> {
    const receipt = MOCK_RECEIPTS.find((r) => r.id === id);
    if (!receipt) throw new Error('Receipt not found');
    return of(receipt);
  }
}
