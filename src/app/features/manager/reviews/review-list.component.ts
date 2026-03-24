import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review } from '@core/services/review.service';
import { LucideAngularModule, Star, MessageSquare, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent implements OnInit {
  private reviewService = inject(ReviewService);
  reviews = signal<Review[]>([]);
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
    this.reviewService.getAll().subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStarArray(rating: number) {
    return Array(rating).fill(0);
  }
}
