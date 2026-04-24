import {
  Component, EventEmitter, Input, Output, signal,
  OnChanges, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { CreateServiceDto, HotelService } from '@core/interfaces/service.dto';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, UiModalComponent],
  templateUrl: './service-form.component.html',
})
export class ServiceFormComponent implements OnChanges {
  @Input() service: HotelService | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateServiceDto>();

  private fb = inject(FormBuilder);

  isEdit = signal(false);
  form: FormGroup;

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  typeOptions = [
    { label: 'Room Service', value: 'Room Service' },
    { label: 'Spa & Wellness', value: 'Spa & Wellness' },
    { label: 'Food & Beverage', value: 'Food & Beverage' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Laundry', value: 'Laundry' },
    { label: 'Other', value: 'Other' },
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['Active', [Validators.required]],
      type: ['', [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['service'] && this.service) {
      this.isEdit.set(true);
      this.form.patchValue({
        name: this.service.name,
        description: this.service.description,
        price: this.service.price,
        status: this.service.status,
        type: this.service.type,
      });
    } else if (changes['service'] && !this.service) {
      this.isEdit.set(false);
      this.form.reset({ name: '', description: '', price: 0, status: 'Active', type: '' });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as CreateServiceDto);
    } else {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
    }
  }
}
