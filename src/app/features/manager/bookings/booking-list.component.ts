import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '@core/services/booking.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, Plus, Calendar, User, CheckCircle, Clock } from 'lucide-angular';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Calendar,
    User,
    CheckCircle,
    Clock
  };

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading.set(true);
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Checked-in': return 'bg-green-100 text-green-700 border-green-200';
      case 'Checked-out': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
