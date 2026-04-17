import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService, RoomType } from '@core/services/room-type.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Layout, Edit, Trash2 } from 'lucide-angular';
import { Meta } from '@core/interfaces/api';
import { RoomTypeFormComponent } from './room-type-form.component';
import { CreateRoomTypeDto } from '@core/interfaces/room-type.dto';

@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RoomTypeFormComponent],
  templateUrl: './room-type-list.component.html',
})
export class RoomTypeListComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  roomTypes = signal<RoomType[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);
  showOnlyAvailable = signal(false);

  // Form state
  isFormOpen = signal(false);
  selectedRoomType = signal<RoomType | null>(null);

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
      this.roomTypeService.getAvailableRoomTypes().subscribe({
        next: (res) => {
          // Map AvailableRoom to something that looks like RoomType for the list
          const mapped: RoomType[] = res.result.map(r => ({
            id: r.id,
            name: `${r.roomTypeName} (Room ${r.roomNumber})`,
            description: r.description || undefined,
            base_price: Number(r.pricePerNight),
            capacity: r.capacity
          }));
          this.roomTypes.set(mapped);
          this.pagination.set(res.meta);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.roomTypeService.getAll().subscribe({
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

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this room type?')) {
      this.roomTypeService.delete(id).subscribe({
        next: () => this.loadRoomTypes(),
        error: (err) => console.error('Error deleting room type:', err)
      });
    }
  }
}
