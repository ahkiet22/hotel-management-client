import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { RoomType } from '@core/services/room-type.service';
import { CreateRoomTypeDto } from '@core/interfaces/room-type.dto';

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
  form: FormGroup;
  isEdit = signal(false);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      images: [[]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roomType'] && this.roomType) {
      this.isEdit.set(true);
      this.form.patchValue({
        name: this.roomType.name,
        description: this.roomType.description,
        basePrice: this.roomType.base_price,
        capacity: this.roomType.capacity,
        images: [], // Images would need handling if present
      });
    } else if (changes['roomType'] && !this.roomType) {
      this.isEdit.set(false);
      this.form.reset({
        name: '',
        description: '',
        basePrice: 0,
        capacity: 1,
        images: [],
      });
    }
  }

  onImagesChange(value: string) {
    const images = value.split(',').map(s => s.trim()).filter(s => !!s);
    this.form.get('images')?.setValue(images);
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    } else {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
