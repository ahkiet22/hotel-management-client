import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { RoomTypeService } from '@core/services/room-type.service';

export interface RoomView {
  id: string;
  title: string;
  price: string;
  isAvailable: boolean;
  imageUrl: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-rooms-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rooms.component.html',
})
export class RoomsPageComponent implements OnInit {
  rooms = signal<RoomView[]>([]);

  scrollToSection() {
    window.scrollTo({
      top: 700,
      behavior: 'smooth',
    });
  }

  constructor(
    private roomTypeService: RoomTypeService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Luxury Rooms & Suites | Paradise Hotel Experience');

    this.meta.updateTag({
      name: 'description',
      content:
        'Discover the epitome of luxury at Paradise Hotel. Explore our curated selection of premium rooms, executive suites, and private villas designed for ultimate comfort.',
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'luxury hotel rooms, boutique suites, paradise hotel booking, premium accommodation',
    });

    this.roomTypeService.getAllPublic({ page: 1, limit: 12 }).subscribe({
      next: (data) => {
        const roomData = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.result)
            ? (data as any).result
            : [];

        this.rooms.set(roomData.map((roomType: any) => {
          const price = roomType.base_price || roomType.basePrice || roomType.price_per_night || roomType.pricePerNight || 0;
          const images = Array.isArray(roomType.images) ? roomType.images : [];
          return {
            id: roomType.id,
            title: roomType.name || 'Luxury Room',
            price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price)),
            isAvailable: Boolean(roomType.is_public ?? roomType.isPublic ?? true),
            imageUrl: images[0] || `https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80`,
            description: roomType.description || 'Experience comfort and elegance in our meticulously designed space.',
            features: [
              `${Number(roomType.capacity ?? 1)} Guest${Number(roomType.capacity ?? 1) > 1 ? 's' : ''}`,
              'Flexible Stay',
              'Free Wi-Fi',
            ]
          };
        }));
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
        this.rooms.set([]);
      },
    });
  }
}
