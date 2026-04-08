import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface Receipt {
  id: string;
  booking_id: string;
  invoice_number: string;
  total_amount: number;
  issued_date: string;
  issued_by: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReceiptService extends BaseService<Receipt> {
  protected override readonly endpoint = 'api/v1/receipts';
}
