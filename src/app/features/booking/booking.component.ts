import { Component, OnInit, OnDestroy, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoomTypeService } from '@core/services/room-type.service';
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
import { AvailableRoom } from '@core/interfaces/booking.dto';
import { RoomType } from '@core/interfaces/room-type.dto';

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
  private platformId = inject(PLATFORM_ID);

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

  // Computed data — enrichedRooms MUST be declared before selectedRoom
  enrichedRooms = computed(() => {
    const types = this.roomTypes();
    const result = this.rooms().map((room: any) => {
      const type = types.find((t: any) => t.id === room.roomTypeId);
      return {
        ...room,
        roomTypeName: type?.name || room.roomTypeName || 'Standard Room',
        basePrice: Number(type?.base_price || room.basePrice || 0),
        pricePerNight: Number(type?.price_per_night || room.pricePerNight || type?.base_price || room.basePrice || 0),
        images: type?.images || room.images || [],
        typeDescription: type?.description || room.description || '',
      };
    });
    return result;
  });

  selectedRoom = computed(() => this.enrichedRooms().find((r) => r.id === this.selectedRoomId()) || null);

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
    if (!room) return 0;
    return Number(room.basePrice || 0) * this.totalNights();
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
    const pendingId = this.getPendingBookingId();
    if (pendingId) {
      this.bookingService.getById(pendingId).subscribe({
        next: (res: any) => {
          if (res.status === 'Confirmed') {
            this.bookingResult.set(res);
            this.onConfirmBooking(res.id);
          } else {
            this.bookingResult.set(res);
            this.getPaymentQr(res);
            this.step.set('payment');
            this.startPaymentPolling(res.id);
          }
        },
        error: () => this.clearPendingBookingId()
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
    const checkIn = this.checkIn() ? `${this.checkIn()}T14:00:00` : '';
    const checkOut = this.checkOut() ? `${this.checkOut()}T12:00:00` : '';

    if (!checkIn || !checkOut) {
       this.isLoading.set(false);
       return;
    }

    this.bookingService
      .getAvailableRoomTypes({ roomTypeId: typeId, checkIn, checkOut, capacity })
      .subscribe({
        next: (data: any) => {
          console.log("getAvailableRoomTypes", data);
          const result = Array.isArray(data) ? data : (data?.result || []);
          this.rooms.set(result);
          this.isLoading.set(false);
          
          // Reset selection if the current selected room is no longer in the list
          if (this.selectedRoomId() && !result.find((r: any) => r.id === this.selectedRoomId())) {
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
    this.roomTypeService.getAllPublic().subscribe({
      next: (res) => {
        console.log("getAllPublic", res)
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
      roomTypeId: selectedRoom.roomTypeId || selectedRoom.id,
      roomIds: [selectedRoom.id],
      checkInDate: `${this.checkIn()}T14:00:00`,
      checkOutDate: `${this.checkOut()}T12:00:00`,
    };

    this.bookingService.create(bookingData).subscribe({
      next: (res: any) => {
        this.bookingResult.set(res);
        this.setPendingBookingId(res.id);
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
    const amount = booking.grandTotal;
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
    
    this.bookingService.applyCoupon({ bookingId: this.bookingResult().id, couponCode: this.couponCode() }).subscribe({
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
          if (booking.status === 'Confirmed') {
            this.stopPaymentPolling();
            this.onConfirmBooking(bookingId);
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

  onConfirmBooking(bookingId: string) {
    this.bookingService.confirm(bookingId).subscribe({
      next: () => {
        this.clearPendingBookingId();
        this.step.set('success');
      }
    });
  }

  private getPendingBookingId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('pendingBookingId');
  }

  private setPendingBookingId(bookingId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('pendingBookingId', bookingId);
  }

  private clearPendingBookingId() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem('pendingBookingId');
  }

  goBack() {
    if (this.step() === 'personal') this.step.set('selection');
    if (this.step() === 'payment') this.step.set('personal');
  }

  getRoomImage(room: any): string {
    if (room?.images && Array.isArray(room.images) && room.images.length > 0) {
      return room.images[0];
    }
    return 'assets/images/pic-1.jpg';
  }
}
