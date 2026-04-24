import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '@core/services/room.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Home, Edit, Trash2 } from 'lucide-angular';
import { CreateRoomDto, Room } from '@core/interfaces/room.dto';
import { RoomFormComponent } from './room-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RoomFormComponent, UiConfirmComponent],
  templateUrl: './room-list.component.html',
})
export class RoomListComponent implements OnInit {
  private roomService = inject(RoomService);
  rooms = signal<Room[]>([]);
  pagination = signal({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
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
      next: (res) => {
        this.rooms.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
    const obs = this.selectedRoom()
      ? this.roomService.update(this.selectedRoom()!.id, data)
      : this.roomService.create(data);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadRooms();
      },
      error: (err) => console.error('Error saving room:', err)
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
      },
      error: (err) => console.error('Error deleting room:', err)
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
}
