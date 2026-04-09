import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '@core/services/booking.service';
import {
  LucideAngularModule, Search, Filter, Plus, Calendar,
  CheckCircle, Clock, Eye, X, RefreshCw
} from 'lucide-angular';
import { Meta } from '@core/interfaces/api';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiConfirmComponent],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // Confirm state for cancel booking
  isConfirmOpen = signal(false);
  bookingToCancel = signal<Booking | null>(null);

  icons = { Search, Filter, Plus, Calendar, CheckCircle, Clock, Eye, X, RefreshCw };

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

  canConfirm(booking: Booking) {
    return booking.status === 'Pending';
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
