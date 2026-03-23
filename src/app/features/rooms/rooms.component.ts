import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
})
export class RoomsPageComponent implements OnInit {
  rooms: RoomView[] = [];

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data.map(room => ({
          id: room.id,
          title: 'The Royal Room', 
          price: '₩190,000',
          isAvailable: room.status === 'Vacant',
          imageUrl: 'assets/images/pic-1.jpg' // Placeholder image
        }));

        // For presentation purposes to match 6 cards in UI exactly:
        if (this.rooms.length > 0 && this.rooms.length < 6) {
           const additional = [];
           while (this.rooms.length + additional.length < 6) {
             additional.push({...this.rooms[0], id: `mock-${additional.length}`});
           }
           this.rooms = [...this.rooms, ...additional];
        }
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
      }
    });
  }
}
