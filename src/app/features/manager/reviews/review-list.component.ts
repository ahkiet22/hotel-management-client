import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review } from '@core/services/review.service';
import { LucideAngularModule, Star, MessageSquare, Trash2 } from 'lucide-angular';

import { Meta } from '@core/interfaces';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PaginationComponent],
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent implements OnInit {
  private reviewService = inject(ReviewService);
  reviews = signal<Review[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 9, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  icons = {
    Star,
    MessageSquare,
    Trash2
  };

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading.set(true);
    this.reviewService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res: any) => {
        this.reviews.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadReviews();
  }

  getStarArray(rating: number) {
    return Array(rating).fill(0);
  }
}
