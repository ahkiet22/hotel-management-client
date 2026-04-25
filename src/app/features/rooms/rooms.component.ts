import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { RoomService } from '@core/services/room.service';
import { Room } from '@core/interfaces/room.dto';

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
  scrollToSection() {
    window.scrollTo({
      top: 700,
      behavior: 'smooth',
    });
  }

  rooms: RoomView[] = [];

  constructor(
    private roomService: RoomService,
    private title: Title,
    private meta: Meta,
    private cdr: ChangeDetectorRef
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

    this.roomService.getAllPublic({ page: 1, limit: 12 }).subscribe({
      next: (data) => {
        const roomData = data.result;
        
        setTimeout(() => {
          this.rooms = roomData.map((room: any) => {
            const price = room.basePrice || room.pricePerNight || 0;
            return {
              id: room.id,
              title: room.roomTypeName || `Room ${room.roomNumber}` || 'Luxury Room',
              price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price)),
              isAvailable: room.status === 'Vacant',
              imageUrl: room.imageUrl || `https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80`,
              description: room.description || 'Experience comfort and elegance in our meticulously designed space.',
              features: ['King Bed', 'Ocean View', 'Free Wi-Fi']
            };
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
      },
    });
  }
}
