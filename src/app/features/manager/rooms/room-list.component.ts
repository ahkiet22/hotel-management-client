import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '@core/services/room.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Home, Edit, Trash2 } from 'lucide-angular';
import { CreateRoomDto, Room } from '@core/interfaces/room.dto';
import { RoomFormComponent } from './room-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Meta } from '@core/interfaces';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RoomFormComponent, UiConfirmComponent, PaginationComponent],
  templateUrl: './room-list.component.html',
})
export class RoomListComponent implements OnInit {
  private roomService = inject(RoomService);
  private toastService = inject(ToastService);
  rooms = signal<Room[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // Form state
  isFormOpen = signal(false);
  selectedRoom = signal<Room | null>(null);

  // Delete confirm state
  isConfirmOpen = signal(false);
  roomToDelete = signal<Room | null>(null);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Home,
    Edit,
    Trash2
  };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.roomService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res: any) => {
        const rawResult: any[] = Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : [];
        const result: Room[] = rawResult.map((item) => this.normalizeRoom(item));
        const current = this.pagination();
        const totalItems = res?.meta?.totalItems ?? result.length;
        const limit = res?.meta?.limit ?? current.limit;
        const page = res?.meta?.page ?? current.page;
        const totalPages = res?.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(limit, 1)));

        this.rooms.set(result);
        this.pagination.set({ page, limit, totalPages, totalItems });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private normalizeRoom(item: any): Room {
    return {
      id: item?.id,
      room_number: item?.room_number ?? item?.roomNumber ?? '',
      description: item?.description,
      is_public: this.normalizeBoolean(item?.is_public ?? item?.isPublic, true),
      room_type_id: item?.room_type_id ?? item?.roomTypeId ?? '',
      status: item?.status,
      room_type_name: item?.room_type_name ?? item?.roomTypeName ?? item?.roomType?.name,
      base_price: item?.base_price ?? item?.basePrice,
      price_per_night: item?.price_per_night ?? item?.pricePerNight,
      capacity: item?.capacity,
      created_at: item?.created_at ?? item?.createdAt ?? '',
      updated_at: item?.updated_at ?? item?.updatedAt ?? ''
    };
  }

  getRoomNumber(room: Room): string {
    return room.room_number || 'N/A';
  }

  getRoomFloor(room: Room): string {
    const roomNumber = this.getRoomNumber(room);
    if (roomNumber === 'N/A') return 'N/A';
    return roomNumber.substring(0, 1);
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadRooms();
  }

  openCreateForm() {
    this.selectedRoom.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(room: Room) {
    this.selectedRoom.set(room);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedRoom.set(null);
  }

  onSave(data: CreateRoomDto) {
    const payload: CreateRoomDto = {
      ...data,
      is_public: this.normalizeBoolean(data?.is_public, true),
    };

    const isEditing = !!this.selectedRoom();
    const obs = isEditing
      ? this.roomService.update(this.selectedRoom()!.id, payload)
      : this.roomService.create(payload);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadRooms();
        this.toastService.success(
          isEditing ? 'Room updated successfully' : 'Room created successfully'
        );
      },
      error: (err) => this.toastService.error('Failed to save room', err?.message)
    });
  }

  openDeleteConfirm(room: Room) {
    this.roomToDelete.set(room);
    this.isConfirmOpen.set(true);
  }

  onDeleteConfirmed() {
    const room = this.roomToDelete();
    if (!room) return;
    this.roomService.delete(room.id).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.roomToDelete.set(null);
        this.loadRooms();
        this.toastService.success('Room deleted successfully');
      },
      error: (err) => this.toastService.error('Failed to delete room', err?.message)
    });
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.roomToDelete.set(null);
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Vacant': return 'bg-green-100 text-green-700 border-green-200';
      case 'Occupied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reserved': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Out_of_Order': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  private normalizeBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }

    return fallback;
  }
}
