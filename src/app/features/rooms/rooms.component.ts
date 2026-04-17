import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { RoomService, Room } from '@core/services/room.service';

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

    this.roomService.getPublicRooms(1, 12).subscribe({
      next: (data) => {
        // Handle both possible structures: { result: [...] } or straight array
        const roomData = data.result || data;

        console.log('Fetched rooms:', roomData);
        
        this.rooms = roomData.map((room: any) => ({
          id: room.id,
          title: room.room_type_name || room.room_number || 'Luxury Room',
          price: room.price ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(room.price) : '₩190,000',
          isAvailable: room.status === 'Vacant',
          imageUrl: room.image || `https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80`,
          description: room.description || 'Experience comfort and elegance in our meticulously designed space.',
          features: room.room_type?.features || ['King Bed', 'Ocean View', 'Free Wi-Fi']
        }));

        // Keep mock data for UI demo if needed, but only if real data is sparse
        if (this.rooms.length > 0 && this.rooms.length < 3) {
           const mockRooms = [
             { id: 'm1', title: 'Executive Ocean Suite', price: '₩450,000', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', description: 'Panoramic ocean views with private balcony.', features: ['King Bed', 'Balcony', 'Mini Bar'] },
             { id: 'm2', title: 'Royal Garden Villa', price: '₩890,000', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'Ultimate privacy with a private pool and garden.', features: ['Private Pool', 'Kitchen', '2 Bedrooms'] }
           ];
           this.rooms = [...this.rooms, ...mockRooms];
        }
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
      },
    });
  }
}
