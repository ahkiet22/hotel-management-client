import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoomTypeService, AvailableRoom, RoomType } from '@core/services/room-type.service';
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
  private roomTypeService = inject(RoomTypeService);
  private route = inject(ActivatedRoute);

  // Filters
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);
  selectedRoomTypeId = signal<string>('');
  roomTypes = signal<RoomType[]>([]);

  // Selection
  rooms = signal<AvailableRoom[]>([]);
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
    if (!room || !room.pricePerNight) return 0;
    return Number(room.pricePerNight) * this.totalNights();
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

    // Read query params
    this.route.queryParams.subscribe((params) => {
      if (params['roomId']) {
        this.selectedRoomId.set(params['roomId']);
      }
      if (params['checkIn']) {
        this.checkIn.set(params['checkIn']);
      }
      if (params['checkOut']) {
        this.checkOut.set(params['checkOut']);
      }
      if (params['adults']) {
        this.adults.set(Number(params['adults']));
      }
      if (params['children']) {
        this.children.set(Number(params['children']));
      }
      if (params['typeId']) {
        this.selectedRoomTypeId.set(params['typeId']);
      }
      
      this.loadRooms();
    });

    this.loadRoomTypes();

    // Default dates (today and tomorrow) if not set
    if (!this.checkIn()) {
      const today = new Date();
      this.checkIn.set(today.toISOString().split('T')[0]);
    }
    if (!this.checkOut()) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      this.checkOut.set(tomorrow.toISOString().split('T')[0]);
    }
  }

  loadRooms() {
    this.isLoading.set(true);
    const capacity = Number(this.adults()) + Number(this.children());
    const typeId = this.selectedRoomTypeId() || undefined;

    // Format dates with time for API
    const checkInDate = this.checkIn() ? `${this.checkIn()}T14:00:00` : undefined;
    const checkOutDate = this.checkOut() ? `${this.checkOut()}T12:00:00` : undefined;

    this.roomTypeService
      .getAvailableRoomTypes(typeId, checkInDate, checkOutDate, capacity)
      .subscribe({
        next: (data) => {
          this.rooms.set(data.result);
          this.isLoading.set(false);
          
          // Reset selection if the current selected room is no longer in the list
          if (this.selectedRoomId() && !data.result.find(r => r.id === this.selectedRoomId())) {
            this.selectedRoomId.set(null);
          }
        },
        error: () => this.isLoading.set(false),
      });
  }

  onSelectRoom(id: string) {
    this.selectedRoomId.set(id);
  }

  loadRoomTypes() {
    this.roomTypeService.getAll().subscribe({
      next: (res) => {
        this.roomTypes.set(res.result);
      },
    });
  }
}
