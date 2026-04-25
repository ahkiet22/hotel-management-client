import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  Briefcase,
  Car,
  Coffee,
  LucideAngularModule,
  Shirt,
  Sparkles,
  Waves,
} from 'lucide-angular';
import { HotelService } from '@core/interfaces/service.dto';
import { HotelServiceService } from '@core/services/hotel-service.service';

type ServiceView = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  type: string;
  quantity: number;
  createdAt: string;
};

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './services.component.html',
})
export class ServicesPageComponent implements OnInit {
  private serviceService = inject(HotelServiceService);

  services = signal<ServiceView[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  icons = {
    Briefcase,
    Car,
    Coffee,
    Shirt,
    Sparkles,
    Waves,
  };

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Hotel Services | Paradise Hotel');
    this.meta.updateTag({
      name: 'description',
      content:
        'Discover dining, spa, laundry, transportation, and other hotel services available at Paradise Hotel.',
    });

    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.serviceService.getAll({ page: 1, limit: 24 }).subscribe({
      next: (res) => {
        const items = Array.isArray(res?.result) ? res.result : [];
        this.services.set(items.map((item) => this.normalizeService(item)));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load hotel services at the moment.');
        this.isLoading.set(false);
      },
    });
  }

  getVisibleServices(): ServiceView[] {
    return this.services().filter((service) => service.status.toLowerCase() !== 'inactive');
  }

  getTypeIcon(type: string) {
    switch (type) {
      case 'F&B':
        return this.icons.Coffee;
      case 'Spa':
        return this.icons.Waves;
      case 'Laundry':
        return this.icons.Shirt;
      case 'Transportation':
        return this.icons.Car;
      default:
        return this.icons.Sparkles;
    }
  }

  getTypeLabel(type: string): string {
    return type || 'Hotel Service';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'active'
      ? 'bg-[#00A699]/10 text-[#00A699] border-[#00A699]/20'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  }

  private normalizeService(item: HotelService & Record<string, any>): ServiceView {
    return {
      id: item?.id ?? '',
      name: item?.name ?? 'Hotel service',
      description:
        item?.description ??
        'Enhance your stay with a curated hotel service tailored for comfort and convenience.',
      price: Number(item?.price ?? 0),
      status: item?.status ?? 'Inactive',
      type: item?.type ?? 'Other',
      quantity: Number(item?.quantity ?? 0),
      createdAt: item?.['createdAt'] ?? item?.created_at ?? '',
    };
  }
}
