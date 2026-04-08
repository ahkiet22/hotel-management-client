import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelServiceService, HotelService } from '@core/services/hotel-service.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Briefcase, Check, X } from 'lucide-angular';

import { Meta } from '@core/interfaces/api';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(HotelServiceService);
  services = signal<HotelService[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Briefcase,
    Check,
    X
  };

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading.set(true);
    this.serviceService.getAll().subscribe({
      next: (res) => {
        this.services.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusClass(status?: string) {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  }
}
