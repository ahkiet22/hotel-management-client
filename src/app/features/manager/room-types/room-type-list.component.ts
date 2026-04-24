import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '@core/services/room-type.service';
import { BookingService } from '@core/services/booking.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Layout, Edit, Trash2 } from 'lucide-angular';
import { RoomTypeFormComponent } from './room-type-form.component';
import { CreateRoomTypeDto, RoomType } from '@core/interfaces/room-type.dto';

import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { Meta } from '@core/interfaces';

@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RoomTypeFormComponent, UiConfirmComponent],
  templateUrl: './room-type-list.component.html',
})
export class RoomTypeListComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private bookingService = inject(BookingService);

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
          this.roomTypes.set(res.result);
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
    const obs = this.selectedRoomType()
      ? this.roomTypeService.update(this.selectedRoomType()!.id, data as any)
      : this.roomTypeService.create(data as any);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadRoomTypes();
      },
      error: (err) => console.error('Error saving room type:', err)
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
      },
      error: (err) => console.error('Error deleting room type:', err)
    });
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.itemToDelete.set(null);
  }
}
