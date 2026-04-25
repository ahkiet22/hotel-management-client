import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  LucideAngularModule,
  Search,
  XCircle,
} from 'lucide-angular';
import { BookingService, Booking } from '@core/services/booking.service';

@Component({
  selector: 'app-history-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="relative w-full md:w-96">
          <lucide-icon [img]="SearchIcon" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            placeholder="Search by Booking ID..."
          />
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <lucide-icon [img]="FilterIcon" class="w-4 h-4 text-slate-500"></lucide-icon>
          <select
            [(ngModel)]="statusFilter"
            (change)="applyFilters()"
            class="grow md:w-44 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium bg-white"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div *ngIf="isLoading()" class="bg-white rounded-3xl border border-slate-100 text-center shadow-sm py-20 space-y-4">
        <div class="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 font-medium">Loading your booking history...</p>
      </div>

      <div *ngIf="!isLoading()" class="space-y-4">
        <div *ngIf="filteredBookings().length === 0" class="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm py-20">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <lucide-icon [img]="HistoryIcon" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-900">No bookings found</h3>
          <p class="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          <button (click)="resetFilters()" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Clear Filters</button>
        </div>

        <div
          *ngFor="let booking of filteredBookings()"
          (click)="openBookingDetail(booking.id)"
          class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer"
        >
          <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-300" 
                 [ngClass]="getStatusStyles(booking.status)">
              <lucide-icon [img]="getStatusIcon(booking.status)" class="w-6 h-6"></lucide-icon>
            </div>

            <div class="flex-1 space-y-1.5 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100">ID: {{ booking.shortId }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" [ngClass]="getStatusBadgeStyles(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 truncate">
                Hotel Booking Reservation
              </h4>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 mt-1">
                <ng-container *ngIf="booking.checkInDate && booking.checkOutDate">
                  <span class="flex items-center gap-1.5 font-medium bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-600">
                    <lucide-icon [img]="CalendarIcon" class="w-3.5 h-3.5 text-blue-500"></lucide-icon>
                    {{ booking.checkInDate | date:'mediumDate' }}
                    <lucide-icon [img]="ArrowRightIcon" class="w-3 h-3 text-slate-400"></lucide-icon>
                    {{ booking.checkOutDate | date:'mediumDate' }}
                  </span>
                </ng-container>

                <span class="flex items-center gap-1.5 font-medium">
                  <lucide-icon [img]="ClockIcon" class="w-3.5 h-3.5 text-slate-400"></lucide-icon>
                  Created: {{ booking.createdAt | date:'medium' }}
                </span>

                <span class="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <lucide-icon [img]="CreditCardIcon" class="w-4 h-4 text-emerald-500"></lucide-icon>
                  {{ booking.grandTotal | currency:'VND' }}
                </span>
              </div>
            </div>

            <button type="button" class="shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
              <lucide-icon [img]="ChevronRightIcon" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HistoryBookingComponent implements OnInit {
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly HistoryIcon = Calendar;
  readonly CreditCardIcon = CreditCard;
  readonly CalendarIcon = Calendar;
  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowRightIcon = ChevronRight;
  readonly ClockIcon = Clock;

  private bookingService = inject(BookingService);
  private router = inject(Router);

  bookings = signal<Booking[]>([]);
  filteredBookings = signal<Booking[]>([]);
  isLoading = signal(true);
  searchQuery = '';
  statusFilter = 'All';

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (data: any) => {
        const rawBookings = Array.isArray(data) ? data : Array.isArray(data?.result) ? data.result : [];
        const bookings = rawBookings.map((item: any) => this.normalizeBooking(item));
        this.bookings.set(bookings);
        this.filteredBookings.set(bookings);
        this.isLoading.set(false);
        this.applyFilters();
      },
      error: () => {
        this.bookings.set([]);
        this.filteredBookings.set([]);
        this.isLoading.set(false);
      },
    });
  }

  applyFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    const status = this.statusFilter;

    this.filteredBookings.set(
      this.bookings().filter((booking) => {
        const bookingId = (booking.shortId || '').toLowerCase();
        const matchesSearch = !query || bookingId.includes(query);
        const matchesStatus = status === 'All' || booking.status === status;
        return matchesSearch && matchesStatus;
      }),
    );
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.filteredBookings.set(this.bookings());
    this.applyFilters();
  }

  openBookingDetail(id: string) {
    this.router.navigate(['/account/history-booking', id]);
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'Confirmed': return CheckCircle;
      case 'Checked-in': return Clock;
      case 'Checked-out': return CheckCircle;
      case 'Cancelled': return XCircle;
      default: return Clock;
    }
  }

  getStatusStyles(status: string) {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-600';
      case 'Checked-in': return 'bg-blue-50 text-blue-600';
      case 'Checked-out': return 'bg-indigo-50 text-indigo-600';
      case 'Cancelled': return 'bg-rose-50 text-rose-600';
      default: return 'bg-amber-50 text-amber-600';
    }
  }

  getStatusBadgeStyles(status: string) {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'Checked-in': return 'bg-blue-100 text-blue-700';
      case 'Checked-out': return 'bg-indigo-100 text-indigo-700';
      case 'Cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  private normalizeBooking(item: any): Booking {
    return {
      id: item?.id ?? '',
      shortId: item?.shortId ?? item?.short_id ?? '',
      customerId: item?.customerId ?? item?.customer_id ?? '',
      customerName: item?.customerName ?? item?.customer_name,
      customerEmail: item?.customerEmail ?? item?.customer_email,
      customerPhone: item?.customerPhone ?? item?.customer_phone,
      staffId: item?.staffId ?? item?.staff_id,
      staffName: item?.staffName ?? item?.staff_name,
      checkInDate: item?.checkInDate ?? item?.check_in_date ?? '',
      checkOutDate: item?.checkOutDate ?? item?.check_out_date ?? '',
      actualCheckIn: item?.actualCheckIn ?? item?.actual_check_in,
      actualCheckOut: item?.actualCheckOut ?? item?.actual_check_out,
      totalRoomPrice: Number(item?.totalRoomPrice ?? item?.total_room_price ?? 0),
      totalServicePrice: Number(item?.totalServicePrice ?? item?.total_service_price ?? 0),
      discount: Number(item?.discount ?? 0),
      grandTotal: Number(item?.grandTotal ?? item?.grand_total ?? 0),
      deposit: Number(item?.deposit ?? 0),
      status: item?.status ?? 'Pending',
      createdAt: item?.createdAt ?? item?.created_at ?? '',
      updatedAt: item?.updatedAt ?? item?.updated_at ?? '',
    };
  }
}
