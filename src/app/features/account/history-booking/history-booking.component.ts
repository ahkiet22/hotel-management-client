import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, Calendar, CreditCard, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-angular';
import { BookingService, Booking } from '@core/services/booking.service';

@Component({
  selector: 'app-history-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Search & Filters -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="relative w-full md:w-96">
          <lucide-icon [name]="SearchIcon" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            placeholder="Search by Booking ID..."
          />
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
          <lucide-icon [name]="FilterIcon" class="w-4 h-4 text-slate-500"></lucide-icon>
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

      <!-- Booking List -->
      <div class="space-y-4">
        <div *ngIf="filteredBookings.length === 0" class="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm py-20">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <lucide-icon [name]="HistoryIcon" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-900">No bookings found</h3>
          <p class="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          <button (click)="resetFilters()" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Clear Filters</button>
        </div>

        <div
          *ngFor="let booking of filteredBookings"
          class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer"
        >
          <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <!-- Icon/Status Indicator -->
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-300" 
                 [ngClass]="getStatusStyles(booking.status)">
              <lucide-icon [name]="getStatusIcon(booking.status)" class="w-6 h-6"></lucide-icon>
            </div>

            <!-- Details -->
            <div class="flex-1 space-y-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">ID: {{booking.short_id}}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" [ngClass]="getStatusBadgeStyles(booking.status)">
                  {{booking.status}}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 truncate flex items-center gap-2">
                Booking from {{booking.check_in_date | date:'mediumDate'}}
                <lucide-icon [name]="ArrowRightIcon" class="w-3.5 h-3.5 text-slate-300"></lucide-icon>
                {{booking.check_out_date | date:'mediumDate'}}
              </h4>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span class="flex items-center gap-1.5 font-medium">
                  <lucide-icon [name]="CalendarIcon" class="w-3.5 h-3.5"></lucide-icon>
                  Created on {{booking.created_at | date:'medium'}}
                </span>
                <span class="flex items-center gap-1.5 font-bold text-slate-700">
                  <lucide-icon [name]="CreditCardIcon" class="w-3.5 h-3.5 text-blue-500"></lucide-icon>
                  {{booking.grand_total | currency}}
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <button class="shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
              <lucide-icon [name]="ChevronRightIcon" class="w-5 h-5"></lucide-icon>
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
  // Lucide Icons
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly HistoryIcon = Calendar;
  readonly CreditCardIcon = CreditCard;
  readonly CalendarIcon = Calendar;
  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowRightIcon = ChevronRight;

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchQuery = '';
  statusFilter = 'All';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getAll().subscribe(data => {
      this.bookings = data.result;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredBookings = this.bookings.filter(b => {
      const matchesSearch = b.short_id.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || b.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.applyFilters();
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
}
