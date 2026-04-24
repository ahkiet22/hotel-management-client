import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelServiceService } from '@core/services/hotel-service.service';
import { LucideAngularModule, Search, Filter, Plus, Briefcase, Pencil, Trash2 } from 'lucide-angular';
import { CreateServiceDto, HotelService } from '@core/interfaces/service.dto';
import { Meta } from '@core/interfaces';
import { ServiceFormComponent } from './service-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ServiceFormComponent, UiConfirmComponent],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(HotelServiceService);

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
    this.serviceService.getAll().subscribe({
      next: (res) => {
        this.services.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
    const obs = this.selectedService()
      ? this.serviceService.update(this.selectedService()!.id, data as any)
      : this.serviceService.create(data as any);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadServices();
      },
      error: (err) => console.error('Error saving service:', err)
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
      },
      error: (err) => console.error('Error deleting service:', err)
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
}
