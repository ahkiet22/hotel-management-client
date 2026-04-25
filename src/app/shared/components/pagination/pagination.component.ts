import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Meta } from '@core/interfaces';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input({ required: true }) meta!: Meta;
  @Output() pageChange = new EventEmitter<number>();

  get shouldShow(): boolean {
    return this.meta.totalPages > 1;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.meta.totalPages;
    const current = this.meta.page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  setPage(page: number): void {
    if (page < 1 || page > this.meta.totalPages || page === this.meta.page) {
      return;
    }
    this.pageChange.emit(page);
  }
}
