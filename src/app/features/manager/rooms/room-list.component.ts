import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService, Room } from '@core/services/room.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Home } from 'lucide-angular';

import { Meta } from '@core/interfaces/api';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './room-list.component.html',
})
export class RoomListComponent implements OnInit {
  private roomService = inject(RoomService);
  rooms = signal<Room[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Home
  };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.roomService.getAll().subscribe({
      next: (res) => {
        this.rooms.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
