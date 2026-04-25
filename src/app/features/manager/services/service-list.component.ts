import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelServiceService } from '@core/services/hotel-service.service';
import { LucideAngularModule, Search, Filter, Plus, Briefcase, Pencil, Trash2 } from 'lucide-angular';
import { CreateServiceDto, HotelService } from '@core/interfaces/service.dto';
import { Meta } from '@core/interfaces';
import { ServiceFormComponent } from './service-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ServiceFormComponent, UiConfirmComponent, PaginationComponent],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(HotelServiceService);
  private toastService = inject(ToastService);

  services = signal<HotelService[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // Form state
  isFormOpen = signal(false);
  selectedService = signal<HotelService | null>(null);

  // Delete confirm state
  isConfirmOpen = signal(false);
  serviceToDelete = signal<HotelService | null>(null);

  icons = { Search, Filter, Plus, Briefcase, Pencil, Trash2 };

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading.set(true);
    this.serviceService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res) => {
        const services = Array.isArray(res?.result) ? res.result.map((item) => this.normalizeService(item)) : [];
        this.services.set(services);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadServices();
  }

  openCreateForm() {
    this.selectedService.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(service: HotelService) {
    this.selectedService.set(service);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedService.set(null);
  }

  onSave(data: CreateServiceDto) {
    const payload: CreateServiceDto = {
      ...data,
      description: data.description?.trim() || '',
      price: this.normalizePrice(data.price),
    };

    const isEditing = !!this.selectedService();
    const obs = isEditing
      ? this.serviceService.update(this.selectedService()!.id, payload as any)
      : this.serviceService.create(payload as any);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadServices();
        this.toastService.success(isEditing ? 'Service updated successfully' : 'Service created successfully');
      },
      error: (err) => this.toastService.error('Failed to save service', err?.message)
    });
  }

  openDeleteConfirm(service: HotelService) {
    this.serviceToDelete.set(service);
    this.isConfirmOpen.set(true);
  }

  onDeleteConfirmed() {
    const service = this.serviceToDelete();
    if (!service) return;
    this.serviceService.delete(service.id).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.serviceToDelete.set(null);
        this.loadServices();
        this.toastService.success('Service deleted successfully');
      },
      error: (err) => this.toastService.error('Failed to delete service', err?.message)
    });
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.serviceToDelete.set(null);
  }

  getStatusClass(status?: string) {
    return status === 'Active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  }

  private normalizeService(item: any): HotelService {
    return {
      id: item?.id ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: this.normalizePrice(item?.price),
      status: item?.status ?? 'Inactive',
      type: item?.type ?? 'Other',
      quantity: Number(item?.quantity ?? 0),
      created_at: item?.created_at ?? item?.createdAt ?? '',
      updated_at: item?.updated_at ?? item?.updatedAt ?? '',
    } as HotelService;
  }

  private normalizePrice(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '').trim();
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }
}
