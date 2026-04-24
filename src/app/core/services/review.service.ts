import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  room_id: string;
  rating: number;
  comment: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService extends BaseService {
  protected override readonly endpoint = 'api/v1/reviews';
}
