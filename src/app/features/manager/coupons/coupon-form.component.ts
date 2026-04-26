import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { Coupon, CreateCouponDto } from '@core/interfaces/booking.dto';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, UiModalComponent],
  templateUrl: './coupon-form.component.html',
})
export class CouponFormComponent implements OnChanges {
  @Input() coupon: Coupon | null = null;
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateCouponDto>();

  private fb = inject(FormBuilder);

  isEdit = signal(false);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    discount_type: ['Percentage' as 'Percentage' | 'Fixed', [Validators.required]],
    discount_value: [0, [Validators.required, Validators.min(1)]],
    coupon_status: ['Active' as 'Active' | 'Inactive' | 'Expired'],
    min_booking_amount: [null as number | null],
    max_discount_amount: [null as number | null],
    start_date: ['', [Validators.required]],
    end_date: ['', [Validators.required]],
    usage_limit: [null as number | null],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coupon']) {
      if (this.coupon) {
        this.isEdit.set(true);
        this.form.reset({
          code: this.coupon.code ?? '',
          discount_type: (this.coupon.discount_type as 'Percentage' | 'Fixed') ?? 'Percentage',
          discount_value: this.normalizeNumber(this.coupon.discount_value),
          coupon_status: this.normalizeStatus(this.coupon.coupon_status),
          min_booking_amount: this.toNullableNumber(this.coupon.min_booking_amount),
          max_discount_amount: this.toNullableNumber(this.coupon.max_discount_amount),
          start_date: this.toDateInput(this.coupon.start_date ?? this.coupon.created_at),
          end_date: this.toDateInput(this.coupon.end_date ?? this.coupon.expired_at),
          usage_limit: this.toNullableNumber(this.coupon.usage_limit),
        });
      } else {
        this.isEdit.set(false);
        this.form.reset({
          code: '',
          discount_type: 'Percentage',
          discount_value: 0,
          coupon_status: 'Active',
          min_booking_amount: null,
          max_discount_amount: null,
          start_date: '',
          end_date: '',
          usage_limit: null,
        });
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    const raw = this.form.getRawValue();
    this.save.emit({
      code: (raw.code ?? '').trim().toUpperCase(),
      discount_type: raw.discount_type ?? 'Percentage',
      discount_value: this.normalizeNumber(raw.discount_value),
      coupon_status: raw.coupon_status ?? 'Active',
      min_booking_amount: this.toOptionalNumber(raw.min_booking_amount),
      max_discount_amount: this.toOptionalNumber(raw.max_discount_amount),
      start_date: raw.start_date ?? '',
      end_date: raw.end_date ?? '',
      usage_limit: this.toOptionalNumber(raw.usage_limit),
    });
  }

  private normalizeNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = this.normalizeNumber(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = this.normalizeNumber(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toDateInput(value?: string): string {
    return value ? value.slice(0, 10) : '';
  }

  private normalizeStatus(value?: string): 'Active' | 'Inactive' | 'Expired' {
    if (value === 'Inactive' || value === 'Expired') return value;
    return 'Active';
  }
}
