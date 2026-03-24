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
    this.title.setTitle('Browse Luxury Rooms & Best Deals | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content:
        'Browse luxury rooms, suites and villas at Paradise Hotel. Find the best deals and book your stay.',
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'hotel rooms, luxury rooms, Paradise Hotel rooms',
    });
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data.map((room) => ({
          id: room.id,
          title: 'The Royal Room',
          price: '₩190,000',
          isAvailable: room.status === 'Vacant',
          imageUrl: 'assets/images/pic-1.jpg', // Placeholder image
        }));

        // For presentation purposes to match 6 cards in UI exactly:
        if (this.rooms.length > 0 && this.rooms.length < 6) {
          const additional = [];
          while (this.rooms.length + additional.length < 6) {
            additional.push({ ...this.rooms[0], id: `mock-${additional.length}` });
          }
          this.rooms = [...this.rooms, ...additional];
        }
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
      },
    });
  }
}
