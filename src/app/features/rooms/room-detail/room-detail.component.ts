import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '@core/services/room.service';
import { RoomTypeService } from '@core/services/room-type.service';
import {
  ArrowLeft,
  CheckCircle2,
  Coffee,
  LucideAngularModule,
  Maximize,
  Star,
  Users,
  Wifi,
} from 'lucide-angular';

const FALLBACK_IMAGE = 'assets/images/pic-1.jpg';

interface RoomDetailView {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  status: string;
  capacity: number;
  description: string;
  basePrice: number;
  pricePerNight: number;
  createdAt: string;
  isPublic: boolean;
}

interface RoomTypeDetailView {
  id: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  pricePerNight: number;
  capacity: number;
  isPublic: boolean;
}

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './room-detail.component.html',
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);

  room = signal<RoomDetailView | null>(null);
  roomType = signal<RoomTypeDetailView | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  stars = [1, 2, 3, 4, 5];

  private activeImage = signal(FALLBACK_IMAGE);

  icons = {
    ArrowLeft,
    Star,
    Wifi,
    Coffee,
    Maximize,
    Users,
    CheckCircle2,
  };

  roomView = computed(() => {
    const room = this.room();
    if (!room) {
      return null;
    }

    const roomType = this.roomType();

    return {
      ...room,
      roomTypeName: roomType?.name || room.roomTypeName || 'Signature Room',
      description:
        roomType?.description ||
        room.description ||
        'A refined stay designed for comfort, privacy, and a seamless hotel experience.',
      images: this.normalizeImages(roomType?.images),
      basePrice: room.basePrice || roomType?.basePrice || 0,
      pricePerNight:
        room.pricePerNight ||
        roomType?.pricePerNight ||
        room.basePrice ||
        roomType?.basePrice ||
        0,
      capacity: roomType?.capacity || room.capacity || 1,
      isPublic: room.isPublic || roomType?.isPublic || false,
    };
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No room ID provided');
      this.isLoading.set(false);
      return;
    }

    this.loadRoom(id);
  }

  loadRoom(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.roomType.set(null);

    this.roomService.getById(id).subscribe({
      next: (rawRoom: any) => {
        const room = this.normalizeRoom(rawRoom);
        this.room.set(room);

        if (!room.roomTypeId) {
          this.syncActiveImage();
          this.isLoading.set(false);
          return;
        }

        this.roomTypeService.getById(room.roomTypeId).subscribe({
          next: (rawRoomType: any) => {
            this.roomType.set(this.normalizeRoomType(rawRoomType));
            this.syncActiveImage();
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error(err);
            this.syncActiveImage();
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set('Room not found or error loading data');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  getMainImage(): string {
    return this.activeImage();
  }

  setMainImage(url: string) {
    this.activeImage.set(url || FALLBACK_IMAGE);
  }

  getGalleryImages(): string[] {
    return this.getAllImages().slice(0, 4);
  }

  getRemainingCount(): number {
    const remaining = this.getAllImages().length - 4;
    return remaining > 0 ? remaining : 0;
  }

  getFeatureList(): string[] {
    const room = this.roomView();
    if (!room) {
      return [];
    }

    return [
      `Designed for up to ${room.capacity} guest${room.capacity > 1 ? 's' : ''}`,
      room.isPublic ? 'Currently listed for public booking' : 'Available by direct reservation request',
      `Room ${room.roomNumber} is currently ${room.status?.toLowerCase() || 'available'}`,
    ];
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = FALLBACK_IMAGE;
  }

  private getAllImages(): string[] {
    const images = this.roomView()?.images || [];
    return images.length > 0 ? images : [FALLBACK_IMAGE];
  }

  private syncActiveImage(): void {
    this.activeImage.set(this.getAllImages()[0] || FALLBACK_IMAGE);
  }

  private normalizeImages(images: unknown): string[] {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter((image): image is string => typeof image === 'string' && image.length > 0);
  }

  private normalizeRoom(raw: any): RoomDetailView {
    return {
      id: raw?.id ?? '',
      roomNumber: raw?.roomNumber ?? raw?.room_number ?? 'N/A',
      roomTypeId: raw?.roomTypeId ?? raw?.room_type_id ?? '',
      roomTypeName: raw?.roomTypeName ?? raw?.room_type_name ?? '',
      status: raw?.status ?? 'Unavailable',
      capacity: Number(raw?.capacity ?? 1),
      description: raw?.description ?? '',
      basePrice: Number(raw?.basePrice ?? raw?.base_price ?? 0),
      pricePerNight: Number(
        raw?.pricePerNight ??
          raw?.price_per_night ??
          raw?.basePrice ??
          raw?.base_price ??
          0,
      ),
      createdAt: raw?.createdAt ?? raw?.created_at ?? '',
      isPublic: Boolean(raw?.isPublic ?? raw?.is_public ?? false),
    };
  }

  private normalizeRoomType(raw: any): RoomTypeDetailView {
    return {
      id: raw?.id ?? '',
      name: raw?.name ?? 'Signature Room',
      description: raw?.description ?? '',
      images: this.normalizeImages(raw?.images),
      basePrice: Number(raw?.basePrice ?? raw?.base_price ?? 0),
      pricePerNight: Number(
        raw?.pricePerNight ??
          raw?.price_per_night ??
          raw?.basePrice ??
          raw?.base_price ??
          0,
      ),
      capacity: Number(raw?.capacity ?? 1),
      isPublic: Boolean(raw?.isPublic ?? raw?.is_public ?? false),
    };
  }
}
