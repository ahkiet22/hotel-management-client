import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateCouponDto, Coupon } from '@core/interfaces/booking.dto';
import { BookingService } from '@core/services/booking.service';
import { ToastService } from '@core/services/toast.service';
import { LucideAngularModule, Plus, RefreshCw, Ticket, Trash2 } from 'lucide-angular';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiConfirmComponent],
  templateUrl: './coupon-list.component.html',
})
export class CouponListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  coupons = signal<Coupon[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  isConfirmOpen = signal(false);
  couponToDelete = signal<Coupon | null>(null);

  form = signal<CreateCouponDto>({
    code: '',
    discount_type: 'Percentage',
    discount_value: 0,
    min_booking_amount: undefined,
    max_discount_amount: undefined,
    start_date: '',
    end_date: '',
    usage_limit: undefined,
  });

  icons = { Plus, RefreshCw, Ticket, Trash2 };

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.isLoading.set(true);
    this.bookingService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set(coupons ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load coupons', err?.message);
      },
    });
  }

  updateForm<K extends keyof CreateCouponDto>(key: K, value: CreateCouponDto[K]) {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  createCoupon() {
    const form = this.form();
    if (!form.code.trim() || !form.start_date || !form.end_date || form.discount_value <= 0) {
      this.toastService.error('Invalid coupon data', 'Please complete all required fields.');
      return;
    }

    const payload: CreateCouponDto = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discount_value: Number(form.discount_value),
      min_booking_amount: this.toOptionalNumber(form.min_booking_amount),
      max_discount_amount: this.toOptionalNumber(form.max_discount_amount),
      usage_limit: this.toOptionalNumber(form.usage_limit),
    };

    this.isSaving.set(true);
    this.bookingService.createCoupon(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.resetForm();
        this.loadCoupons();
        this.toastService.success('Coupon created successfully');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error('Failed to create coupon', err?.message);
      },
    });
  }

  openDeleteConfirm(coupon: Coupon) {
    this.couponToDelete.set(coupon);
    this.isConfirmOpen.set(true);
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.couponToDelete.set(null);
  }

  onDeleteConfirmed() {
    const coupon = this.couponToDelete();
    if (!coupon) return;

    this.bookingService.deleteCoupon(coupon.id).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.couponToDelete.set(null);
        this.loadCoupons();
        this.toastService.success('Coupon deleted successfully');
      },
      error: (err) => this.toastService.error('Failed to delete coupon', err?.message),
    });
  }

  getUsageStatus(coupon: Coupon) {
    if (!coupon.usage_limit) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (coupon.used_count >= coupon.usage_limit) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-green-100 text-green-700 border-green-200';
  }

  private resetForm() {
    this.form.set({
      code: '',
      discount_type: 'Percentage',
      discount_value: 0,
      min_booking_amount: undefined,
      max_discount_amount: undefined,
      start_date: '',
      end_date: '',
      usage_limit: undefined,
    });
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
