import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelServiceService, HotelService } from '@core/services/hotel-service.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Briefcase, Check, X } from 'lucide-angular';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(HotelServiceService);
  services = signal<HotelService[]>([]);
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
      next: (data) => {
        this.services.set(data);
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
