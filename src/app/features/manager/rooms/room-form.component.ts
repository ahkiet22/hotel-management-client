import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { RoomTypeService } from '@core/services/room-type.service';
import { CreateRoomDto, Room, RoomStatus } from '@core/interfaces/room.dto';
import { RoomType } from '@core/interfaces/room-type.dto';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, HlmCheckbox, UiModalComponent],
  templateUrl: './room-form.component.html',
})
export class RoomFormComponent implements OnChanges, OnInit {
  @Input() room: Room | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateRoomDto>();

  private fb = inject(FormBuilder);
  private roomTypeService = inject(RoomTypeService);
  
  form: FormGroup;
  isEdit = signal(false);
  roomTypes = signal<RoomType[]>([]);

  statusOptions = [
    { label: 'Vacant', value: 'Vacant' },
    { label: 'Reserved', value: 'Reserved' },
    { label: 'Occupied', value: 'Occupied' },
    { label: 'Out of Order', value: 'Out_of_Order' }
  ];

  constructor() {
    this.form = this.fb.group({
      room_number: ['', [Validators.required, Validators.maxLength(10)]],
      description: [''],
      is_public: [true],
      room_type_id: ['', [Validators.required]],
      status: ['Vacant', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadRoomTypes();
  }
  
  loadRoomTypes() {
    this.roomTypeService.getAll().subscribe({
      next: (res) => this.roomTypes.set(res.result)
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['room'] && this.room) {
      this.isEdit.set(true);
      this.form.patchValue({
        room_number: this.room.room_number,
        description: this.room.description ?? '', 
        is_public: this.normalizeBoolean(this.room.is_public, true),
        room_type_id: this.room.room_type_id,
        status: this.room.status,
      });
    } else if (changes['room'] && !this.room) {
      this.isEdit.set(false);
      this.form.reset({
        room_number: '',
        description: '',
        is_public: true,
        room_type_id: '',
        status: 'Vacant',
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit({
        ...this.form.getRawValue(),
        is_public: this.normalizeBoolean(this.form.getRawValue().is_public, true),
      });
    } else {
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  private normalizeBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }

    return fallback;
  }
}
