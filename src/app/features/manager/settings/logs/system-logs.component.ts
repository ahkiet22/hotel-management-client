import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemLogService, SystemLog } from '@core/services/system-log.service';
import { LucideAngularModule, Activity, Clock, Shield, Search, User, Filter, RefreshCw, X } from 'lucide-angular';

import { Meta } from '@core/interfaces';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaginationComponent],
  templateUrl: './system-logs.component.html',
})
export class SystemLogsComponent implements OnInit {
  private logService = inject(SystemLogService);
  logs = signal<SystemLog[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // Filters
  filterUserId = signal('');
  filterAction = signal('');

  icons = {
    Activity, Clock, Shield, Search, User, Filter, RefreshCw, X
  };

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    const params: any = {
      page: this.pagination().page,
      limit: this.pagination().limit,
    };
    
    if (this.filterUserId()) params.userId = this.filterUserId();
    if (this.filterAction()) params.action = this.filterAction();

    this.logService.getAll(params).subscribe({
      next: (res: any) => {
        this.logs.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  applyFilters() {
    this.pagination.update((p: Meta) => ({ ...p, page: 1 }));
    this.loadLogs();
  }

  resetFilters() {
    this.filterUserId.set('');
    this.filterAction.set('');
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadLogs();
  }
}
