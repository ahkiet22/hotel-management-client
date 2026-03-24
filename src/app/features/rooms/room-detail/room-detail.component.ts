import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService, Room } from '@core/services/room.service';
import { LucideAngularModule, ArrowLeft, Star, Wifi, Coffee, Maximize, Users, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './room-detail.component.html',
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  
  room = signal<Room | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  stars = [1, 2, 3, 4, 5];

  icons = {
    ArrowLeft,
    Star,
    Wifi,
    Coffee,
    Maximize,
    Users,
    CheckCircle2
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRoom(id);
    } else {
      this.error.set('No room ID provided');
      this.isLoading.set(false);
    }
  }

  loadRoom(id: string) {
    this.isLoading.set(true);
    this.roomService.getById(id).subscribe({
      next: (data) => {
        this.room.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Room not found or error loading data');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
