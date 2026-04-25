import {
  Component, EventEmitter, Input, Output, signal,
  OnChanges, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { CreateServiceDto, HotelService, ServiceType } from '@core/interfaces/service.dto';
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
    { label: 'Food & Beverage', value: ServiceType.FNB },
    { label: 'Spa', value: ServiceType.SPA },
    { label: 'Laundry', value: ServiceType.LAUNDRY },
    { label: 'Transportation', value: ServiceType.TRANSPORTATION },
    { label: 'Other', value: ServiceType.OTHER },
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
        description: this.service.description ?? '',
        price: this.normalizePrice(this.service.price),
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
      const raw = this.form.getRawValue();
      this.save.emit({
        ...raw,
        description: raw.description?.trim() || '',
        price: this.normalizePrice(raw.price),
      } as CreateServiceDto);
    } else {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
    }
  }

  private normalizePrice(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '').trim();
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }
}
