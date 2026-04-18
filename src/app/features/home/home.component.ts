import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomTypeService, AvailableRoom } from '@core/services/room-type.service';
import {
  LucideAngularModule,
  Play,
  MapPin,
  Users,
  Calendar,
  Wifi,
  Waves,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Coffee,
  Dumbbell,
  Gamepad2,
  Lightbulb,
  WashingMachine,
  Car,
  Info,
} from 'lucide-angular';
import { RoomType } from '@core/interfaces';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomePageComponent implements OnInit {
  private router = inject(Router);
  private roomTypeService = inject(RoomTypeService);

  // Booking signals
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);
  rooms = signal<AvailableRoom[]>([]);
  roomTypes = signal<RoomType[]>([]);
  selectedRoomTypeId = signal<string>('');

  icons = {
    Play,
    MapPin,
    Users,
    Calendar,
    Wifi,
    Waves,
    Star,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Coffee,
    Dumbbell,
    Gamepad2,
    Lightbulb,
    WashingMachine,
    Car,
    Info,
  };

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Paradise Hotel - Luxury Hotel Booking & Best Deals');

    // Default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.checkIn.set(today.toISOString().split('T')[0]);
    this.checkOut.set(tomorrow.toISOString().split('T')[0]);

    this.meta.addTags([
      {
        name: 'description',
        content:
          'Paradise Hotel - Book luxury hotels, resorts and villas with the best prices. Enjoy premium services and exclusive deals.',
      },
      {
        name: 'keywords',
        content: 'Paradise Hotel, hotel booking, luxury hotel, resort, villa, travel Vietnam',
      },
      {
        name: 'author',
        content: 'Paradise Hotel',
      },
    ]);

    // Open Graph (Facebook, Zalo)
    this.meta.addTags([
      {
        property: 'og:title',
        content: 'Paradise Hotel - Best Hotel Booking Platform',
      },
      {
        property: 'og:description',
        content: 'Discover luxury hotels and enjoy the best deals with Paradise Hotel.',
      },
      {
        property: 'og:image',
        content: 'https://yourdomain.com/Paradise-hotel-banner.jpg',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ]);

    // Twitter Card
    this.meta.addTags([
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Paradise Hotel - Luxury Hotel Booking',
      },
      {
        name: 'twitter:description',
        content: 'Book top hotels with the best prices at Paradise Hotel.',
      },
    ]);

    this.loadRoomTypes();
    this.loadRooms();
  }

  loadRooms() {
    const capacity = this.adults() + this.children();
    
    // Format dates with time for API
    const checkInDate = this.checkIn() ? `${this.checkIn()}T14:00:00` : undefined;
    const checkOutDate = this.checkOut() ? `${this.checkOut()}T12:00:00` : undefined;

    this.roomTypeService
      .getAvailableRoomTypes(undefined, checkInDate, checkOutDate, capacity)
      .subscribe({
        next: (res) => {
          this.rooms.set(res.result.slice(0, 3)); // Show first 3 rooms
        },
      });
  }

  loadRoomTypes() {
    this.roomTypeService.getAll().subscribe({
      next: (res) => {
        this.roomTypes.set(res.result);
      },
    });
  }

  onSearch() {
    this.router.navigate(['/booking'], {
      queryParams: {
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        adults: this.adults(),
        children: this.children(),
        typeId: this.selectedRoomTypeId(),
      },
    });
  }

  bookRoom(roomId: string) {
    this.router.navigate(['/booking'], {
      queryParams: {
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        adults: this.adults(),
        children: this.children(),
        typeId: this.selectedRoomTypeId(),
        roomId: roomId
      },
    });
  }
}
