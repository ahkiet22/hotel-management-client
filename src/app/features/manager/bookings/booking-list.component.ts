import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '@core/services/booking.service';
import {
  LucideAngularModule, Search, Filter, Plus, Calendar,
  CheckCircle, Clock, Eye, X, RefreshCw, QrCode, Ticket, Check, LogOut
} from 'lucide-angular';
import { Meta } from '@core/interfaces/api';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiConfirmComponent],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);

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
    this.bookingService.getAll().subscribe({
      next: (res) => {
        this.bookings.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /** Confirm a Pending booking → Confirmed */
  confirmBooking(booking: Booking) {
    this.bookingService.confirmBooking(booking.id).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Error confirming booking:', err)
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
    this.bookingService.update(booking.id, { status: 'Cancelled' }).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.bookingToCancel.set(null);
        this.loadBookings();
      },
      error: (err) => console.error('Error cancelling booking:', err)
    });
  }

  onCancelDismissed() {
    this.isConfirmOpen.set(false);
    this.bookingToCancel.set(null);
  }

  /** QR Payment */
  openQrModal(booking: Booking) {
    this.bookingService.getPaymentQr(booking.grandTotal, `Payment for ${booking.shortId}`).subscribe({
      next: (res) => {
        this.qrImageUrl.set(res.qrDataURL || res.qrCode || res); // Depends on exact server response
        this.isQrModalOpen.set(true);
      },
      error: (err) => console.error('Error fetching QR:', err)
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

    this.bookingService.applyCoupon(booking.id, code).subscribe({
      next: () => {
        this.closeCouponModal();
        this.loadBookings();
      },
      error: (err) => console.error('Error applying coupon:', err)
    });
  }

  /** Status Transitions */
  checkIn(booking: Booking) {
    this.bookingService.update(booking.id, { status: 'Checked-in' }).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Error checking in:', err)
    });
  }

  checkOut(booking: Booking) {
    this.bookingService.update(booking.id, { status: 'Checked-out' }).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Error checking out:', err)
    });
  }

  canConfirm(booking: Booking) {
    return booking.status === 'Pending';
  }

  canCheckIn(booking: Booking) {
    return booking.status === 'Confirmed';
  }

  canCheckOut(booking: Booking) {
    return booking.status === 'Checked-in';
  }

  canCancel(booking: Booking) {
    return booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Confirmed':   return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Checked-in':  return 'bg-green-100 text-green-700 border-green-200';
      case 'Checked-out': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':   return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending':     return 'bg-amber-100 text-amber-700 border-amber-200';
      default:            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
