import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { RoomTypeService, RoomType } from '@core/services/room-type.service';
import { CreateRoomDto } from '@core/interfaces/room.dto';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { Room } from '@core/interfaces';

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
    { label: 'Out of Order', value: 'Out of Order' }
  ];

  constructor() {
    this.form = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.maxLength(10)]],
      description: [''],
      isPublic: [true],
      roomTypeId: ['', [Validators.required]],
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
        roomNumber: this.room.room_number,
        description: '', 
        isPublic: true,
        roomTypeId: this.room.room_type_id,
        status: this.room.status,
      });
    } else if (changes['room'] && !this.room) {
      this.isEdit.set(false);
      this.form.reset({
        roomNumber: '',
        description: '',
        isPublic: true,
        roomTypeId: '',
        status: 'Vacant',
      });
    }
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
