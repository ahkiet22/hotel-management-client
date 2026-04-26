import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Coupon, CreateCouponDto } from '@core/interfaces/booking.dto';
import { BookingService } from '@core/services/booking.service';
import { ToastService } from '@core/services/toast.service';
import { LucideAngularModule, Edit, Plus, RefreshCw, Ticket, Trash2 } from 'lucide-angular';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { CouponFormComponent } from './coupon-form.component';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiConfirmComponent, CouponFormComponent],
  templateUrl: './coupon-list.component.html',
})
export class CouponListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  coupons = signal<Coupon[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  isFormOpen = signal(false);
  selectedCoupon = signal<Coupon | null>(null);

  isConfirmOpen = signal(false);
  couponToDelete = signal<Coupon | null>(null);

  icons = { Edit, Plus, RefreshCw, Ticket, Trash2 };

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.isLoading.set(true);
    this.bookingService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set((coupons ?? []).map((coupon) => this.normalizeCoupon(coupon)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load coupons', err?.message);
      },
    });
  }

  openCreateForm() {
    this.selectedCoupon.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(coupon: Coupon) {
    this.selectedCoupon.set(this.normalizeCoupon(coupon));
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedCoupon.set(null);
  }

  onSave(form: CreateCouponDto) {
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

    const current = this.selectedCoupon();
    const request$ = current
      ? this.bookingService.updateCoupon(current.id, payload)
      : this.bookingService.createCoupon(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeForm();
        this.loadCoupons();
        this.toastService.success(current ? 'Coupon updated successfully' : 'Coupon created successfully');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error(current ? 'Failed to update coupon' : 'Failed to create coupon', err?.message);
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

  getCouponStatusClass(coupon: Coupon) {
    const status = coupon.coupon_status ?? this.deriveStatus(coupon);
    if (status === 'Expired') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'Inactive') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-green-100 text-green-700 border-green-200';
  }

  getDiscountLabel(coupon: Coupon): string {
    const value = this.normalizeNumber(coupon.discount_value);
    return coupon.discount_type === 'Percentage'
      ? `${value}%`
      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getDateRangeLabel(coupon: Coupon): string {
    const start = coupon.start_date ?? coupon.created_at;
    const end = coupon.end_date ?? coupon.expired_at;
    if (!start && !end) return 'No date range';
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  private normalizeCoupon(coupon: Coupon): Coupon {
    const normalized: Coupon = {
      ...coupon,
      discount_value: this.normalizeNumber(coupon.discount_value),
      min_booking_amount: this.toOptionalNumber(coupon.min_booking_amount),
      max_discount_amount: this.toOptionalNumber(coupon.max_discount_amount),
      usage_limit: this.toOptionalNumber(coupon.usage_limit),
      used_count: this.normalizeNumber(coupon.used_count),
      start_date: coupon.start_date ?? coupon.created_at?.slice(0, 10),
      end_date: coupon.end_date ?? coupon.expired_at?.slice(0, 10),
      coupon_status: coupon.coupon_status ?? this.deriveStatus(coupon),
    };

    return normalized;
  }

  private deriveStatus(coupon: Coupon): string {
    const expiredAt = coupon.end_date ?? coupon.expired_at;
    if (expiredAt && new Date(expiredAt).getTime() < Date.now()) return 'Expired';
    return 'Active';
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

  private formatDate(value?: string): string {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('vi-VN').format(date);
  }
}
