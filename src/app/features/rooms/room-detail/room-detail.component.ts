import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '@core/services/room.service';
import { LucideAngularModule, ArrowLeft, Star, Wifi, Coffee, Maximize, Users, CheckCircle2 } from 'lucide-angular';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './room-detail.component.html',
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  
  room = signal<any | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  stars = [1, 2, 3, 4, 5];

  private _activeImage: string = FALLBACK_IMAGE;

  icons = {
    ArrowLeft,
    Star,
    Wifi,
    Coffee,
    Maximize,
    Users,
    CheckCircle2
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRoom(id);
    } else {
      this.error.set('No room ID provided');
      this.isLoading.set(false);
    }
  }

  loadRoom(id: string) {
    this.isLoading.set(true);
    this.roomService.getById(id).subscribe({
      next: (data: any) => {
        this.room.set(data);
        // Set main image to first available image
        const images: string[] = data?.images || [];
        this._activeImage = images.length > 0 ? images[0] : FALLBACK_IMAGE;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Room not found or error loading data');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  getMainImage(): string {
    return this._activeImage;
  }

  setMainImage(url: string) {
    this._activeImage = url;
  }

  getGalleryImages(): string[] {
    const images: string[] = this.room()?.images || [];
    // Show up to 2 thumbs in gallery (the third slot may show +N)
    return images.slice(1, 3);
  }

  getRemainingCount(): number {
    const images: string[] = this.room()?.images || [];
    const remaining = images.length - 3; // main + 2 thumbs
    return remaining > 0 ? remaining : 0;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = FALLBACK_IMAGE;
  }
}
