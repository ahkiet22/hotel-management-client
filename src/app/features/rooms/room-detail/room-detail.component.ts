import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private roomTypeService = inject(RoomTypeService);

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

  roomView = computed(() => this.roomType());

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No room type ID provided');
      this.isLoading.set(false);
      return;
    }

    this.loadRoomType(id);
  }

  loadRoomType(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.roomTypeService.getById(id).subscribe({
      next: (rawRoomType: any) => {
        this.roomType.set(this.normalizeRoomType(rawRoomType));
        this.syncActiveImage();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Room type not found or error loading data');
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
    const roomType = this.roomView();
    if (!roomType) {
      return [];
    }

    return [
      `Designed for up to ${roomType.capacity} guest${roomType.capacity > 1 ? 's' : ''}`,
      roomType.isPublic ? 'Currently listed for public booking' : 'Available by direct reservation request',
      `Starts from ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomType.basePrice)}`,
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

  private normalizeRoomType(raw: any): RoomTypeDetailView {
    return {
      id: raw?.id ?? '',
      name: raw?.name ?? 'Signature Room',
      description:
        raw?.description ??
        'A refined stay designed for comfort, privacy, and a seamless hotel experience.',
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
