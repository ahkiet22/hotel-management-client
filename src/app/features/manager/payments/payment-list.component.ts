import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, Payment } from '@core/services/payment.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, CreditCard, DollarSign } from 'lucide-angular';

import { Meta } from '@core/interfaces';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PaginationComponent],
  templateUrl: './payment-list.component.html',
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  payments = signal<Payment[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    CreditCard,
    DollarSign
  };

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading.set(true);
    this.paymentService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res) => {
        this.payments.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadPayments();
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
