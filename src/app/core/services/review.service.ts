import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import REVIEWS_DATA from '@assets/mocks/reviews.json';

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  room_id: string;
  rating: number;
  comment: string;
  created_at?: string;
}

const MOCK_REVIEWS = REVIEWS_DATA as unknown as Review[];

@Injectable({
  providedIn: 'root',
})
export class ReviewService extends BaseService<Review> {
  protected override readonly endpoint = 'api/v1/reviews';

  override getAll(query?: any): Observable<Review[]> {
    return of(MOCK_REVIEWS);
  }

  override getById(id: string | number): Observable<Review> {
    const review = MOCK_REVIEWS.find((r) => r.id === id);
    if (!review) throw new Error('Review not found');
    return of(review);
  }
}
