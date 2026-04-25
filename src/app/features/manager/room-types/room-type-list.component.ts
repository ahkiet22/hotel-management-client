import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '@core/services/room-type.service';
import { BookingService } from '@core/services/booking.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Layout, Edit, Trash2 } from 'lucide-angular';
import { RoomTypeFormComponent } from './room-type-form.component';
import { CreateRoomTypeDto, RoomType } from '@core/interfaces/room-type.dto';

import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { Meta } from '@core/interfaces';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RoomTypeFormComponent, UiConfirmComponent, PaginationComponent],
  templateUrl: './room-type-list.component.html',
})
export class RoomTypeListComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  roomTypes = signal<RoomType[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);
  showOnlyAvailable = signal(false);

  // Form state
  isFormOpen = signal(false);
  selectedRoomType = signal<RoomType | null>(null);

  // Delete confirm state
  isConfirmOpen = signal(false);
  itemToDelete = signal<RoomType | null>(null);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Layout,
    Edit,
    Trash2
  };

  ngOnInit() {
    this.loadRoomTypes();
  }

  loadRoomTypes() {
    this.isLoading.set(true);
    
    if (this.showOnlyAvailable()) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      this.bookingService.getAvailableRoomTypes({
        checkIn: today.toISOString(),
        checkOut: tomorrow.toISOString(),
        page: this.pagination().page,
        limit: this.pagination().limit
      }).subscribe({
        next: (res) => {
          // Map AvailableRoom to something that looks like RoomType for the list
          const mapped: RoomType[] = res.result.map((r: any) => ({
            id: r.id,
            name: `${r.room_type_name} (Room ${r.room_number})`,
            description: r.description || undefined,
            base_price: Number(r.base_price),
            capacity: r.capacity,
            price_per_night: Number(r.price_per_night || r.base_price),
            created_at: '',
            updated_at: ''
          }));
          this.roomTypes.set(mapped);
          this.pagination.set(res.meta);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.roomTypeService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
        next: (res) => {
          const items = Array.isArray(res?.result) ? res.result.map((item: any) => this.normalizeRoomType(item)) : [];
          this.roomTypes.set(items);
          this.pagination.set(res.meta);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleAvailable() {
    this.showOnlyAvailable.set(!this.showOnlyAvailable());
    this.loadRoomTypes();
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadRoomTypes();
  }

  openCreateForm() {
    this.selectedRoomType.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(roomType: RoomType) {
    this.selectedRoomType.set(roomType);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedRoomType.set(null);
  }

  onSave(data: CreateRoomTypeDto) {
    const payload: CreateRoomTypeDto = {
      ...data,
      description: data.description?.trim() || '',
      base_price: this.normalizeNumber((data as any).base_price),
      price_per_night: this.normalizeNumber((data as any).price_per_night),
      capacity: this.normalizeNumber(data.capacity, 1),
      images: Array.isArray(data.images) ? data.images : [],
    };

    const isEditing = !!this.selectedRoomType();
    const obs = isEditing
      ? this.roomTypeService.update(this.selectedRoomType()!.id, payload as any)
      : this.roomTypeService.create(payload as any);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadRoomTypes();
        this.toastService.success(isEditing ? 'Room type updated successfully' : 'Room type created successfully');
      },
      error: (err) => this.toastService.error('Failed to save room type', err?.message)
    });
  }

  openDeleteConfirm(roomType: RoomType) {
    this.itemToDelete.set(roomType);
    this.isConfirmOpen.set(true);
  }

  onDeleteConfirmed() {
    const item = this.itemToDelete();
    if (!item) return;
    this.roomTypeService.delete(item.id).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.itemToDelete.set(null);
        this.loadRoomTypes();
        this.toastService.success('Room type deleted successfully');
      },
      error: (err) => this.toastService.error('Failed to delete room type', err?.message)
    });
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.itemToDelete.set(null);
  }

  private normalizeRoomType(item: any): RoomType {
    return {
      id: item?.id ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      images: Array.isArray(item?.images) ? item.images : [],
      base_price: this.normalizeNumber(item?.base_price ?? item?.basePrice),
      price_per_night: this.normalizeNumber(item?.price_per_night ?? item?.pricePerNight),
      capacity: this.normalizeNumber(item?.capacity, 1),
      created_at: item?.created_at ?? item?.createdAt ?? '',
      updated_at: item?.updated_at ?? item?.updatedAt ?? '',
      is_public: item?.is_public ?? item?.isPublic,
    };
  }

  private normalizeNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
  }
}
