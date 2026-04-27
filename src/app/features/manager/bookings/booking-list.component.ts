import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService, getBookingPayableTotal } from '@core/services/booking.service';
import { Booking, BookingStatus } from '@core/interfaces/booking.dto';
import {
  LucideAngularModule, Search, Filter, Plus, Calendar,
  CheckCircle, Clock, Eye, X, RefreshCw, QrCode, Ticket, Check, LogOut
} from 'lucide-angular';
import { Meta } from '@core/interfaces';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiConfirmComponent, PaginationComponent],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  bookings = signal<Booking[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // QR & Coupon state
  isQrModalOpen = signal(false);
  qrImageUrl = signal<string | null>(null);
  
  isCouponModalOpen = signal(false);
  couponCode = signal('');
  activeBooking = signal<Booking | null>(null);
  
  // Cancel confirm state
  isConfirmOpen = signal(false);
  bookingToCancel = signal<Booking | null>(null);

  icons = { Search, Filter, Plus, Calendar, CheckCircle, Clock, Eye, X, RefreshCw, QrCode, Ticket, Check, LogOut };

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading.set(true);
    this.bookingService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res) => {
        this.bookings.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadBookings();
  }

  /** Confirm a Pending booking → Confirmed */
  confirmBooking(booking: Booking) {
    this.bookingService.confirm(booking.id).subscribe({
      next: () => {
        this.loadBookings();
        this.toastService.success(`Booking ${booking.shortId} confirmed`);
      },
      error: (err) => this.toastService.error('Failed to confirm booking', err?.message)
    });
  }

  /** Open cancel confirm dialog */
  openCancelConfirm(booking: Booking) {
    this.bookingToCancel.set(booking);
    this.isConfirmOpen.set(true);
  }

  onCancelConfirmed() {
    const booking = this.bookingToCancel();
    if (!booking) return;
    this.bookingService.update(booking.id, { status: BookingStatus.CANCELLED }).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.bookingToCancel.set(null);
        this.loadBookings();
        this.toastService.success('Booking cancelled successfully');
      },
      error: (err) => this.toastService.error('Failed to cancel booking', err?.message)
    });
  }

  onCancelDismissed() {
    this.isConfirmOpen.set(false);
    this.bookingToCancel.set(null);
  }

  /** QR Payment */
  openQrModal(booking: Booking) {
    this.bookingService.getPaymentQr(this.getPayableTotal(booking), `Payment for ${booking.shortId}`).subscribe({
      next: (res) => {
        this.qrImageUrl.set(res); 
        this.isQrModalOpen.set(true);
      },
      error: (err) => this.toastService.error('Failed to load payment QR', err?.message)
    });
  }

  closeQrModal() {
    this.isQrModalOpen.set(false);
    this.qrImageUrl.set(null);
  }

  /** Coupon Application */
  openCouponModal(booking: Booking) {
    this.activeBooking.set(booking);
    this.isCouponModalOpen.set(true);
  }

  closeCouponModal() {
    this.isCouponModalOpen.set(false);
    this.couponCode.set('');
    this.activeBooking.set(null);
  }

  applyCoupon() {
    const booking = this.activeBooking();
    const code = this.couponCode();
    if (!booking || !code) return;

    this.bookingService.applyCoupon({ bookingId: booking.id, couponCode: code }).subscribe({
      next: () => {
        this.closeCouponModal();
        this.loadBookings();
        this.toastService.success('Coupon applied successfully');
      },
      error: (err) => this.toastService.error('Failed to apply coupon', err?.message)
    });
  }

  /** Status Transitions */
  checkIn(booking: Booking) {
    this.bookingService.checkIn(booking.id).subscribe({
      next: () => {
        this.loadBookings();
        this.toastService.success(`Checked in ${booking.shortId}`);
      },
      error: (err) => this.toastService.error('Failed to check in', err?.message)
    });
  }

  checkOut(booking: Booking) {
    this.bookingService.checkOut(booking.id).subscribe({
      next: () => {
        this.loadBookings();
        this.toastService.success(`Checked out ${booking.shortId}`);
      },
      error: (err) => this.toastService.error('Failed to check out', err?.message)
    });
  }

  canConfirm(booking: Booking) {
    return booking.status === 'Pending';
  }

  canCheckIn(booking: Booking) {
    return booking.status === 'Confirmed' || booking.status === 'Paid';
  }

  canCheckOut(booking: Booking) {
    return booking.status === 'Checked-in';
  }

  canCancel(booking: Booking) {
    return booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Paid':        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Confirmed':   return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Checked-in':  return 'bg-green-100 text-green-700 border-green-200';
      case 'Checked-out': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':   return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending':     return 'bg-amber-100 text-amber-700 border-amber-200';
      default:            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getPayableTotal(booking: Booking | null | undefined): number {
    return getBookingPayableTotal(booking);
  }
}
