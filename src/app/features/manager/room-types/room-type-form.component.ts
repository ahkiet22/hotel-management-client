import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { RoomType, CreateRoomTypeDto } from '@core/interfaces/room-type.dto';
import { UploadService } from '@core/services/upload.service';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-room-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, UiModalComponent],
  templateUrl: './room-type-form.component.html',
})
export class RoomTypeFormComponent implements OnChanges {
  @Input() roomType: RoomType | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateRoomTypeDto>();

  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);
  form: FormGroup;
  isEdit = signal(false);
  isUploading = signal(false);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      base_price: [0, [Validators.required, Validators.min(0)]],
      price_per_night: [0, [Validators.required, Validators.min(0)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      images: [[]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roomType'] && this.roomType) {
      this.isEdit.set(true);
      this.form.patchValue({
        name: this.roomType.name,
        description: this.roomType.description ?? '',
        base_price: this.normalizeNumber((this.roomType as any).base_price ?? (this.roomType as any).basePrice),
        price_per_night: this.normalizeNumber((this.roomType as any).price_per_night ?? (this.roomType as any).pricePerNight),
        capacity: this.normalizeNumber(this.roomType.capacity, 1),
        images: this.roomType.images || [],
      });
    } else if (changes['roomType'] && !this.roomType) {
      this.isEdit.set(false);
      this.form.reset({
        name: '',
        description: '',
        base_price: 0,
        price_per_night: 0,
        capacity: 1,
        images: [],
      });
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.isUploading.set(true);
      this.uploadService.uploadImages(files).subscribe({
        next: (urls) => {
          const currentImages = this.form.get('images')?.value || [];
          this.form.get('images')?.setValue([...currentImages, ...urls]);
          this.isUploading.set(false);
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading.set(false);
          alert('Failed to upload images.');
        }
      });
    }
  }

  removeImage(index: number) {
    const images = this.form.get('images')?.value || [];
    images.splice(index, 1);
    this.form.get('images')?.setValue([...images]);
  }

  onSubmit() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      this.save.emit({
        ...raw,
        description: raw.description?.trim() || '',
        base_price: this.normalizeNumber(raw.base_price),
        price_per_night: this.normalizeNumber(raw.price_per_night),
        capacity: this.normalizeNumber(raw.capacity, 1),
        images: Array.isArray(raw.images) ? raw.images : [],
      });
    } else {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  private normalizeNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
  }
}
