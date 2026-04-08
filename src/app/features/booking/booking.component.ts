import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoomService, Room } from '@core/services/room.service';
import {
  LucideAngularModule,
  Calendar,
  Users,
  Briefcase,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-angular';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './booking.component.html',
})
export class BookingPageComponent implements OnInit {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}
  private roomService = inject(RoomService);
  private route = inject(ActivatedRoute);

  // Filters
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);

  // Selection
  rooms = signal<Room[]>([]);
  selectedRoomId = signal<string | null>(null);
  isLoading = signal(true);

  // Computed data
  selectedRoom = computed(() => this.rooms().find((r) => r.id === this.selectedRoomId()) || null);

  totalNights = computed(() => {
    if (!this.checkIn() || !this.checkOut()) return 1;
    const start = new Date(this.checkIn());
    const end = new Date(this.checkOut());
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 1;
  });

  totalPrice = computed(() => {
    const room = this.selectedRoom();
    if (!room || !room.price) return 0;
    return room.price * this.totalNights();
  });

  icons = {
    Calendar,
    Users,
    Briefcase,
    ChevronRight,
    Info,
    CheckCircle2,
  };

  ngOnInit() {
    this.title.setTitle('Book Your Stay | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content:
        'Complete your booking at Paradise Hotel. Secure your stay with the best rooms and services.',
    });
    // Optionally get room id from queryParams if coming from room detail
    this.route.queryParams.subscribe((params) => {
      if (params['roomId']) {
        this.selectedRoomId.set(params['roomId']);
      }
    });

    this.loadRooms();

    // Default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.checkIn.set(today.toISOString().split('T')[0]);
    this.checkOut.set(tomorrow.toISOString().split('T')[0]);
  }

  loadRooms() {
    this.isLoading.set(true);
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms.set(data.result.filter((r) => r.status === 'Vacant'));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSelectRoom(id: string) {
    this.selectedRoomId.set(id);
  }
}
