import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptService, Receipt } from '@core/services/receipt.service';
import { LucideAngularModule, FileText, Download, Printer } from 'lucide-angular';

import { Meta } from '@core/interfaces';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './receipt-list.component.html',
})
export class ReceiptListComponent implements OnInit {
  private receiptService = inject(ReceiptService);
  receipts = signal<Receipt[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  icons = {
    FileText,
    Download,
    Printer
  };

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts() {
    this.isLoading.set(true);
    this.receiptService.getAll().subscribe({
      next: (res) => {
        this.receipts.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
