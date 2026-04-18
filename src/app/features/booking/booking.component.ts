import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoomTypeService, AvailableRoom } from '@core/services/room-type.service';
import {
  LucideAngularModule,
  Calendar,
  Users,
  Briefcase,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-angular';
import { Meta, Title } from '@angular/platform-browser';
import { AuthStore } from '@core/stores/auth.store';
import { BookingService } from '@core/services/booking.service';
import { RoomType } from '@core/interfaces';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './booking.component.html',
})
export class BookingPageComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}
  private roomTypeService = inject(RoomTypeService);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);

  // Steps: 'selection' | 'personal' | 'payment' | 'success'
  step = signal<'selection' | 'personal' | 'payment' | 'success'>('selection');

  // Filters
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);
  selectedRoomTypeId = signal<string>('');
  roomTypes = signal<RoomType[]>([]);

  // Selection
  rooms = signal<AvailableRoom[]>([]);
  selectedRoomId = signal<string | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Personal Info form (simplified for demo)
  customerInfo = {
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  };

  // Payment info
  paymentQr = signal<string | null>(null);
  bookingResult = signal<any>(null);
  pollingInterval: any;

  // Coupon
  couponCode = signal<string>('');
  couponError = signal<string>('');
  couponSuccess = signal<string>('');
  isApplyingCoupon = signal(false);

  // Computed data
  selectedRoom = computed(() => this.rooms().find((r) => r.id === this.selectedRoomId()) || null);

  totalNights = computed(() => {
    if (!this.checkIn() || !this.checkOut()) return 1;
    const start = new Date(this.checkIn());
    const end = new Date(this.checkOut());
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 1;
  });

  totalPrice = computed(() => {
    const room = this.selectedRoom();
    if (!room || !room.pricePerNight) return 0;
    return Number(room.pricePerNight) * this.totalNights();
  });

  icons = {
    Calendar,
    Users,
    Briefcase,
    ChevronRight,
    Info,
    CheckCircle2,
  };

  ngOnInit() {
    this.title.setTitle('Book Your Stay | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content:
        'Complete your booking at Paradise Hotel. Secure your stay with the best rooms and services.',
    });

    // Read query params
    this.route.queryParams.subscribe((params) => {
      if (params['roomId']) {
        this.selectedRoomId.set(params['roomId']);
      }
      if (params['checkIn']) {
        this.checkIn.set(params['checkIn']);
      }
      if (params['checkOut']) {
        this.checkOut.set(params['checkOut']);
      }
      if (params['adults']) {
        this.adults.set(Number(params['adults']));
      }
      if (params['children']) {
        this.children.set(Number(params['children']));
      }
      if (params['typeId']) {
        this.selectedRoomTypeId.set(params['typeId']);
      }
      
      this.loadRooms();
    });

    this.loadRoomTypes();

    // Default dates (today and tomorrow) if not set
    if (!this.checkIn()) {
      const today = new Date();
      this.checkIn.set(today.toISOString().split('T')[0]);
    }
    if (!this.checkOut()) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      this.checkOut.set(tomorrow.toISOString().split('T')[0]);
    }

    // Check pending booking
    const pendingId = localStorage.getItem('pendingBookingId');
    if (pendingId) {
      this.bookingService.getById(pendingId).subscribe({
        next: (res: any) => {
          if (res.paymentStatus === 'PAID') {
            this.bookingResult.set(res);
            this.confirmBooking(res.id);
          } else {
            this.bookingResult.set(res);
            this.getPaymentQr(res);
            this.step.set('payment');
            this.startPaymentPolling(res.id);
          }
        },
        error: () => localStorage.removeItem('pendingBookingId')
      });
    }
  }

  ngOnDestroy() {
    this.stopPaymentPolling();
  }

  loadRooms() {
    this.isLoading.set(true);
    const capacity = Number(this.adults()) + Number(this.children());
    const typeId = this.selectedRoomTypeId() || undefined;

    // Format dates with time for API
    const checkInDate = this.checkIn() ? `${this.checkIn()}T14:00:00` : undefined;
    const checkOutDate = this.checkOut() ? `${this.checkOut()}T12:00:00` : undefined;

    this.roomTypeService
      .getAvailableRoomTypes(typeId, checkInDate, checkOutDate, capacity)
      .subscribe({
        next: (data) => {
          this.rooms.set(data.result);
          this.isLoading.set(false);
          
          // Reset selection if the current selected room is no longer in the list
          if (this.selectedRoomId() && !data.result.find(r => r.id === this.selectedRoomId())) {
            this.selectedRoomId.set(null);
          }
        },
        error: () => this.isLoading.set(false),
      });
  }

  onSelectRoom(id: string) {
    this.selectedRoomId.set(id);
  }

  loadRoomTypes() {
    this.roomTypeService.getAll().subscribe({
      next: (res) => {
        this.roomTypes.set(res.result);
      },
    });
  }

  onProcessCheckout() {
    console.log('Processing checkout with step:', this.step());
    if (this.step() === 'selection') {
      this.step.set('personal');
    } else if (this.step() === 'personal') {
      this.createBooking();
    }
  }

  createBooking() {
    const user = this.authStore.user();
    if (!user) {
      alert('Please login to book a room.');
      return;
    }

    this.isSubmitting.set(true);
    
    const selectedRoom = this.selectedRoom();
    if (!selectedRoom) return;

    const bookingData = {
      customerId: user.id,
      roomTypeId: selectedRoom.roomTypeId,
      roomIds: [selectedRoom.id],
      checkIn: `${this.checkIn()}T14:00:00`,
      checkOut: `${this.checkOut()}T12:00:00`,
      adults: Number(this.adults()),
      children: Number(this.children())
    };

    this.bookingService.createByCustomer(bookingData).subscribe({
      next: (res: any) => {
        this.bookingResult.set(res);
        localStorage.setItem('pendingBookingId', res.id);
        this.getPaymentQr(res);
        this.step.set('payment');
        this.isSubmitting.set(false);
        this.startPaymentPolling(res.id);
      },
      error: (err: any) => {
        console.error('Booking failed', err);
        this.isSubmitting.set(false);
        alert('Booking failed. Please try again.');
      }
    });
  }

  getPaymentQr(booking: any) {
    this.paymentQr.set(null); // Show loading
    const amount = booking.finalAmount || booking.grantTotal;
    const description = `BOOKING_${booking.id}`;
    this.bookingService.getPaymentQr(amount, description).subscribe({
      next: (res: string) => {
        this.paymentQr.set(res);
      }
    });
  }

  applyCoupon() {
    if (!this.couponCode() || this.isApplyingCoupon()) return;
    this.isApplyingCoupon.set(true);
    this.couponError.set('');
    this.couponSuccess.set('');
    
    this.bookingService.applyCoupon(this.bookingResult().id, this.couponCode()).subscribe({
      next: (res: any) => {
        this.bookingResult.set(res);
        this.couponSuccess.set('Coupon applied successfully!');
        this.isApplyingCoupon.set(false);
        this.getPaymentQr(res); // Regenerate QR for new amount
      },
      error: (err: any) => {
        this.couponError.set(err?.message || 'Invalid or expired coupon');
        this.isApplyingCoupon.set(false);
      }
    });
  }

  startPaymentPolling(bookingId: string) {
    this.stopPaymentPolling();
    this.pollingInterval = setInterval(() => {
      this.bookingService.getById(bookingId).subscribe({
        next: (booking: any) => {
          if (booking.paymentStatus === 'PAID') {
            this.stopPaymentPolling();
            this.confirmBooking(bookingId);
          }
        }
      });
    }, 3000);
  }

  stopPaymentPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  confirmBooking(bookingId: string) {
    this.bookingService.confirmBooking(bookingId).subscribe({
      next: () => {
        localStorage.removeItem('pendingBookingId');
        this.step.set('success');
      }
    });
  }

  goBack() {
    if (this.step() === 'personal') this.step.set('selection');
    if (this.step() === 'payment') this.step.set('personal');
  }
}
