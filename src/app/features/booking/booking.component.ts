import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomTypeService } from '@core/services/room-type.service';
import {
  LucideAngularModule,
  Calendar,
  Users,
  Briefcase,
  ChevronRight,
  Info,
  CheckCircle2,
  Minus,
  Plus,
  X,
  Ticket,
  Clock3,
  Eye,
  ArrowLeft,
} from 'lucide-angular';
import { Meta, Title } from '@angular/platform-browser';
import { AuthStore } from '@core/stores/auth.store';
import { BookingService, getBookingPayableTotal, isBookingPaid } from '@core/services/booking.service';
import { AvailableRoom, BookingServiceItemDto, Coupon, CreateBookingDto } from '@core/interfaces/booking.dto';
import { RoomType } from '@core/interfaces/room-type.dto';
import { HotelService, ServiceStatus } from '@core/interfaces/service.dto';
import { HotelServiceService } from '@core/services/hotel-service.service';
import { ToastService } from '@core/services/toast.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type EnrichedRoom = AvailableRoom & {
  roomTypeName: string;
  basePrice: number;
  pricePerNight: number;
  images: string[];
  typeDescription: string;
};

type BookingServiceView = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  status: string;
  quantity: number;
};

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  templateUrl: './booking.component.html',
})
export class BookingPageComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  private roomTypeService = inject(RoomTypeService);
  private bookingService = inject(BookingService);
  private hotelServiceService = inject(HotelServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private toastService = inject(ToastService);

  step = signal<'selection' | 'services' | 'payment' | 'success'>('selection');

  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);
  selectedRoomTypeId = signal<string>('');
  roomTypes = signal<RoomType[]>([]);

  rooms = signal<AvailableRoom[]>([]);
  selectedRoomIds = signal<string[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  servicesLoading = signal(true);

  hotelServices = signal<BookingServiceView[]>([]);
  selectedServiceQuantities = signal<Record<string, number>>({});
  servicesPage = signal(1);
  readonly servicesPerPage = 4;
  coupons = signal<Coupon[]>([]);
  isCouponModalOpen = signal(false);

  paymentQr = signal<string | null>(null);
  bookingResult = signal<any>(null);
  pollingInterval: ReturnType<typeof setInterval> | null = null;

  couponCode = signal<string>('');
  couponError = signal<string>('');
  couponSuccess = signal<string>('');
  isApplyingCoupon = signal(false);

  enrichedRooms = computed<EnrichedRoom[]>(() => {
    const types = this.roomTypes();
    return this.rooms().map((room: any) => {
      const type = types.find((t) => t.id === room.roomTypeId);
      return {
        ...room,
        roomTypeName: type?.name || room.roomTypeName || 'Standard Room',
        basePrice: Number(type?.base_price || room.basePrice || 0),
        pricePerNight: Number(type?.price_per_night || room.pricePerNight || type?.base_price || room.basePrice || 0),
        images: type?.images || room.images || [],
        typeDescription: type?.description || room.description || '',
      };
    });
  });

  selectedRooms = computed(() => {
    const ids = new Set(this.selectedRoomIds());
    return this.enrichedRooms().filter((room) => ids.has(room.id));
  });

  totalGuests = computed(() => Number(this.adults()) + Number(this.children()));

  totalHours = computed(() => {
    const start = this.toDate(this.checkIn());
    const end = this.toDate(this.checkOut());
    if (!start || !end) return 0;
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60));
  });

  totalRoomPrice = computed(() => {
    const hours = this.totalHours();
    if (hours <= 0) return 0;

    return this.selectedRooms().reduce((sum, room) => sum + this.calculateRoomPrice(room, hours), 0);
  });

  selectedServices = computed(() => {
    const quantities = this.selectedServiceQuantities();
    return this.hotelServices()
      .filter((service) => (quantities[service.id] ?? 0) > 0)
      .map((service) => ({
        ...service,
        selectedQuantity: quantities[service.id] ?? 0,
        lineTotal: service.price * (quantities[service.id] ?? 0),
      }));
  });

  totalServicePrice = computed(() => {
    return this.selectedServices().reduce((sum, service) => sum + service.lineTotal, 0);
  });

  totalServicePages = computed(() => {
    const total = this.hotelServices().length;
    return Math.max(1, Math.ceil(total / this.servicesPerPage));
  });

  paginatedHotelServices = computed(() => {
    const currentPage = Math.min(this.servicesPage(), this.totalServicePages());
    const start = (currentPage - 1) * this.servicesPerPage;
    return this.hotelServices().slice(start, start + this.servicesPerPage);
  });

  visibleServicePages = computed(() => {
    const totalPages = this.totalServicePages();
    const currentPage = this.servicesPage();
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = endPage - maxVisible + 1;
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  });

  estimatedTotal = computed(() => {
    return Math.max(this.totalRoomPrice() + this.totalServicePrice(), 0);
  });

  canProceedToServices = computed(() => {
    return this.selectedRoomIds().length > 0 && this.totalHours() > 0 && !this.isSubmitting();
  });

  canSubmit = computed(() => {
    return this.canProceedToServices() && !this.isSubmitting();
  });

  availableCoupons = computed(() => {
    const now = Date.now();
    return this.coupons().filter((coupon) => {
      const status = `${coupon.coupon_status ?? ''}`.toLowerCase();
      const expiredAt = coupon.end_date ?? coupon.expired_at;
      const isExpired = expiredAt ? this.getCouponExpiryTime(expiredAt) < now : false;
      return status !== 'inactive' && status !== 'expired' && !isExpired;
    });
  });

  displayedCoupons = computed(() => {
    const activeCoupons = this.availableCoupons();
    return activeCoupons.length > 0 ? activeCoupons : this.coupons();
  });

  icons = {
    Calendar,
    Users,
    Briefcase,
    ChevronRight,
    Info,
    CheckCircle2,
    Minus,
    Plus,
    X,
    Ticket,
    Clock3,
    Eye,
    ArrowLeft,
  };

  ngOnInit() {
    this.title.setTitle('Book Your Stay | Paradise Hotel');
    this.meta.updateTag({
      name: 'description',
      content:
        'Complete your booking at Paradise Hotel. Secure your stay with the best rooms and services.',
    });

    this.route.queryParams.subscribe((params) => {
      if (params['roomId']) {
        this.selectedRoomIds.set([params['roomId']]);
      }
      if (params['checkIn']) {
        this.checkIn.set(this.normalizeIncomingDateTime(params['checkIn'], '14:00'));
      }
      if (params['checkOut']) {
        this.checkOut.set(this.normalizeIncomingDateTime(params['checkOut'], '12:00'));
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

      this.ensureDefaultDates();
      this.loadRooms();
    });

    this.loadRoomTypes();
    this.loadServices();
    this.loadCoupons();
    this.resetCheckoutState();
  }

  ngOnDestroy() {
    this.stopPaymentPolling();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.couponError.set('');
    this.couponSuccess.set('');

    const capacity = this.totalGuests();
    const typeId = this.selectedRoomTypeId() || undefined;
    const checkIn = this.toApiDateTime(this.checkIn());
    const checkOut = this.toApiDateTime(this.checkOut());

    if (!checkIn || !checkOut || this.totalHours() <= 0) {
      this.rooms.set([]);
      this.selectedRoomIds.set([]);
      this.isLoading.set(false);
      return;
    }

    this.bookingService.getAvailableRoomTypes({ roomTypeId: typeId, checkIn, checkOut, capacity }).subscribe({
      next: (data: any) => {
        const result = Array.isArray(data) ? data : (data?.result || []);
        this.rooms.set(result);
        this.keepOnlyAvailableSelectedRooms(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load rooms', err?.message);
        this.rooms.set([]);
        this.selectedRoomIds.set([]);
        this.isLoading.set(false);
      },
    });
  }

  loadRoomTypes() {
    this.roomTypeService.getAllPublic().subscribe({
      next: (res) => {
        this.roomTypes.set(Array.isArray(res?.result) ? res.result : []);
      },
    });
  }

  loadServices() {
    this.servicesLoading.set(true);
    this.hotelServiceService.getAll({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const result = Array.isArray(res?.result) ? res.result : [];
        this.hotelServices.set(result.map((service) => this.normalizeService(service)));
        this.servicesPage.set(1);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.hotelServices.set([]);
        this.servicesPage.set(1);
        this.servicesLoading.set(false);
      },
    });
  }

  onCheckInChange(value: string) {
    this.checkIn.set(value);
    this.loadRooms();
  }

  onCheckOutChange(value: string) {
    this.checkOut.set(value);
    this.loadRooms();
  }

  onAdultsChange(value: number) {
    this.adults.set(Number(value));
    this.loadRooms();
  }

  onChildrenChange(value: number) {
    this.children.set(Number(value));
    this.loadRooms();
  }

  onRoomTypeChange(value: string) {
    this.selectedRoomTypeId.set(value);
    this.loadRooms();
  }

  loadCoupons() {
    this.bookingService.getCoupons().subscribe({
      next: (coupons) => {
        const normalizedCoupons = Array.isArray(coupons) ? coupons.map((coupon) => this.normalizeCoupon(coupon)) : [];
        this.coupons.set(normalizedCoupons);
      },
      error: () => {
        this.coupons.set([]);
      },
    });
  }

  toggleRoomSelection(roomId: string) {
    const room = this.enrichedRooms().find((item) => item.id === roomId);
    if (!room) return;

    const current = this.selectedRoomIds();
    if (current.includes(roomId)) {
      this.selectedRoomIds.set(current.filter((id) => id !== roomId));
      return;
    }

    const selectedRooms = this.selectedRooms();
    if (selectedRooms.length > 0 && selectedRooms.some((item) => item.roomTypeId !== room.roomTypeId)) {
      this.toastService.error('Multiple room types are not supported', 'Please choose rooms from the same room type for one booking.');
      return;
    }

    this.selectedRoomIds.set([...current, roomId]);
    if (!this.selectedRoomTypeId()) {
      this.selectedRoomTypeId.set(room.roomTypeId);
    }
  }

  removeSelectedRoom(roomId: string) {
    this.selectedRoomIds.update((ids) => ids.filter((id) => id !== roomId));
  }

  getSelectedServiceQuantity(serviceId: string): number {
    return this.selectedServiceQuantities()[serviceId] ?? 0;
  }

  increaseServiceQuantity(service: BookingServiceView) {
    if (service.quantity === 0) {
      return;
    }

    const current = this.getSelectedServiceQuantity(service.id);
    if (service.quantity !== -1 && current >= service.quantity) {
      return;
    }

    this.selectedServiceQuantities.update((state) => ({
      ...state,
      [service.id]: current + 1,
    }));
  }

  decreaseServiceQuantity(serviceId: string) {
    const current = this.getSelectedServiceQuantity(serviceId);
    const next = Math.max(current - 1, 0);

    this.selectedServiceQuantities.update((state) => {
      const updated = { ...state };
      if (next === 0) {
        delete updated[serviceId];
      } else {
        updated[serviceId] = next;
      }
      return updated;
    });
  }

  removeSelectedService(serviceId: string) {
    this.selectedServiceQuantities.update((state) => {
      const updated = { ...state };
      delete updated[serviceId];
      return updated;
    });
  }

  onProcessCheckout() {
    if (!this.authStore.user()) {
      this.toastService.error('Login required', 'Please login before creating a booking.');
      this.router.navigate(['/login']);
      return;
    }

    this.createBooking();
  }

  goToServicesStep() {
    if (!this.canProceedToServices()) {
      return;
    }

    this.step.set('services');
  }

  goBackToSelection() {
    this.step.set('selection');
  }

  goToServicesPage(page: number) {
    const nextPage = Math.max(1, Math.min(page, this.totalServicePages()));
    this.servicesPage.set(nextPage);
  }

  openCouponModal() {
    this.loadCoupons();
    this.isCouponModalOpen.set(true);
  }

  closeCouponModal() {
    this.isCouponModalOpen.set(false);
  }

  selectCoupon(code: string) {
    this.couponCode.set(code);
    this.isCouponModalOpen.set(false);
  }

  createBooking() {
    const user = this.authStore.user();
    const selectedRooms = this.selectedRooms();
    if (!user || selectedRooms.length === 0) {
      return;
    }

    const roomTypeId = selectedRooms[0]?.roomTypeId || selectedRooms[0]?.id;
    const services = this.buildSelectedServicesPayload();

    const bookingData: CreateBookingDto = {
      customerId: user.id,
      roomTypeId,
      roomIds: selectedRooms.map((room) => room.id),
      checkInDate: this.toApiDateTime(this.checkIn()),
      checkOutDate: this.toApiDateTime(this.checkOut()),
      services: services.length > 0 ? services : undefined,
    };

    this.isSubmitting.set(true);
    this.couponError.set('');
    this.couponSuccess.set('');

    this.bookingService.create(bookingData).pipe(
      switchMap((created) => this.applyDraftCoupon(created.id).pipe(
        switchMap(() => this.bookingService.getById(created.id)),
      )),
    ).subscribe({
      next: (booking) => {
        this.openPaymentStep(booking);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toastService.error('Booking failed', err?.message || 'Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  applyCoupon() {
    const booking = this.bookingResult();
    if (!booking?.id || !this.couponCode() || this.isApplyingCoupon()) return;

    this.isApplyingCoupon.set(true);
    this.couponError.set('');
    this.couponSuccess.set('');

    this.bookingService.applyCoupon({ bookingId: booking.id, couponCode: this.couponCode().trim() }).subscribe({
      next: (res: any) => {
        this.bookingResult.set(res);
        this.couponSuccess.set('Coupon applied successfully.');
        this.isApplyingCoupon.set(false);
        this.getPaymentQr(res);
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
          if (isBookingPaid(booking)) {
            this.stopPaymentPolling();
            this.bookingResult.set(booking);
            this.step.set('success');
          }
        }
      });
    }, 3000);
  }

  stopPaymentPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getPaymentQr(booking: any) {
    this.paymentQr.set(null);
    const amount = getBookingPayableTotal(booking);
    const description = `BOOKING_${booking.id}`;

    if (!amount || !booking?.id) {
      return;
    }

    this.bookingService.getPaymentQr(amount, description).subscribe({
      next: (res: string) => {
        this.paymentQr.set(res);
      }
    });
  }

  resetForAnotherBooking() {
    this.resetCheckoutState();
    this.step.set('selection');
    this.bookingResult.set(null);
    this.paymentQr.set(null);
    this.stopPaymentPolling();
    this.loadRooms();
  }

  getRoomImage(room: EnrichedRoom): string {
    if (room?.images && Array.isArray(room.images) && room.images.length > 0) {
      return room.images[0];
    }
    return 'assets/images/pic-1.jpg';
  }

  getRoomPriceLabel(room: EnrichedRoom): string {
    const hours = this.totalHours();
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      this.calculateRoomPrice(room, hours),
    );
  }

  getServiceCapacityLabel(service: BookingServiceView): string {
    if (service.quantity === -1) return 'Unlimited';
    if (service.quantity === 0) return 'Unavailable';
    return `${service.quantity} available`;
  }

  canIncreaseService(service: BookingServiceView): boolean {
    if (service.quantity === -1) return true;
    if (service.quantity === 0) return false;
    return this.getSelectedServiceQuantity(service.id) < service.quantity;
  }

  getCouponDiscountLabel(coupon: Coupon): string {
    const discountValue = Number(coupon.discount_value ?? 0);
    if (coupon.discount_type === 'Percentage') {
      return `${discountValue}%`;
    }

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountValue);
  }

  getCouponExpiryLabel(coupon: Coupon): string {
    const value = coupon.end_date ?? coupon.expired_at;
    if (!value) return '--';
    const date = this.parseCouponDate(value, true);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
  }

  isCouponSelectable(coupon: Coupon): boolean {
    const status = `${coupon.coupon_status ?? this.deriveCouponStatus(coupon)}`.toLowerCase();
    if (status === 'inactive' || status === 'expired') {
      return false;
    }

    const expiredAt = coupon.end_date ?? coupon.expired_at;
    return expiredAt ? this.getCouponExpiryTime(expiredAt) >= Date.now() : true;
  }

  getBookingDiscount(booking: any): number {
    return Number(booking?.discount ?? 0);
  }

  getBookingPayableTotal(booking: any): number {
    return getBookingPayableTotal({
      grandTotal: Number(booking?.grandTotal ?? booking?.totalRoomPrice ?? 0),
      discount: this.getBookingDiscount(booking),
    } as any);
  }

  private normalizeCoupon(coupon: Coupon): Coupon {
    return {
      ...coupon,
      discount_value: this.normalizeNumber(coupon.discount_value),
      min_booking_amount: this.toOptionalNumber(coupon.min_booking_amount),
      max_discount_amount: this.toOptionalNumber(coupon.max_discount_amount),
      usage_limit: this.toOptionalNumber(coupon.usage_limit),
      used_count: this.normalizeNumber(coupon.used_count),
      coupon_status: coupon.coupon_status ?? this.deriveCouponStatus(coupon),
    };
  }

  private deriveCouponStatus(coupon: Coupon): string {
    const expiredAt = coupon.end_date ?? coupon.expired_at;
    if (expiredAt && this.getCouponExpiryTime(expiredAt) < Date.now()) return 'Expired';
    return 'Active';
  }

  private getCouponExpiryTime(value: string): number {
    return this.parseCouponDate(value, true).getTime();
  }

  private parseCouponDate(value: string, endOfDay = false): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return endOfDay
        ? new Date(year, month - 1, day, 23, 59, 59, 999)
        : new Date(year, month - 1, day);
    }

    return new Date(value);
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

  private applyDraftCoupon(bookingId: string): Observable<unknown> {
    const code = this.couponCode().trim();
    if (!code) {
      return of(null);
    }

    return this.bookingService.applyCoupon({ bookingId, couponCode: code }).pipe(
      switchMap(() => {
        this.couponSuccess.set('Coupon applied successfully.');
        return of(null);
      }),
    );
  }

  private openPaymentStep(booking: any) {
    this.bookingResult.set(booking);
    this.getPaymentQr(booking);
    this.step.set('payment');
    this.startPaymentPolling(booking.id);
  }

  private ensureDefaultDates() {
    if (!this.checkIn()) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      this.checkIn.set(this.toDateTimeLocalValue(now));
    }

    if (!this.checkOut()) {
      const end = this.toDate(this.checkIn()) ?? new Date();
      end.setHours(end.getHours() + 8);
      this.checkOut.set(this.toDateTimeLocalValue(end));
    }
  }

  private keepOnlyAvailableSelectedRooms(availableRooms: any[]) {
    const availableIds = new Set((availableRooms ?? []).map((room: any) => room.id));
    this.selectedRoomIds.update((ids) => ids.filter((id) => availableIds.has(id)));
  }

  private calculateRoomPrice(room: EnrichedRoom, hours: number): number {
    const normalizedHours = Math.max(hours, 0);
    if (normalizedHours <= 8) {
      return normalizedHours * Number(room.basePrice || 0);
    }

    const fullBlocks = Math.floor(normalizedHours / 8);
    const remainder = normalizedHours % 8;
    return (fullBlocks * Number(room.pricePerNight || 0)) + (remainder * Number(room.basePrice || 0));
  }

  private toApiDateTime(value: string): string {
    const date = this.toDate(value);
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private toDate(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateTimeLocalValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private normalizeIncomingDateTime(value: string, fallbackTime: string): string {
    if (!value) return '';
    if (value.includes('T')) {
      return value.slice(0, 16);
    }
    return `${value}T${fallbackTime}`;
  }

  private normalizeService(item: HotelService & Record<string, any>): BookingServiceView {
    const rawQuantity: unknown = item?.quantity;
    const quantity =
      rawQuantity === null ||
      rawQuantity === undefined ||
      (typeof rawQuantity === 'string' && rawQuantity.trim() === '')
        ? -1
        : Number(rawQuantity);

    return {
      id: item?.id ?? '',
      name: item?.name ?? 'Hotel service',
      description: item?.description ?? 'Enhance your stay with a curated hotel service.',
      price: Number(item?.price ?? 0),
      type: item?.type ?? 'Other',
      status: item?.status ?? ServiceStatus.INACTIVE,
      quantity: Number.isFinite(quantity) ? quantity : -1,
    };
  }

  private buildSelectedServicesPayload(): BookingServiceItemDto[] {
    const availableServices = new Set(this.hotelServices().map((service) => service.id));

    return Object.entries(this.selectedServiceQuantities())
      .map(([serviceId, quantity]) => ({
        serviceId,
        quantity: Number(quantity ?? 0),
      }))
      .filter((item) => availableServices.has(item.serviceId) && item.quantity > 0);
  }

  private resetCheckoutState() {
    this.paymentQr.set(null);
    this.bookingResult.set(null);
    this.couponError.set('');
    this.couponSuccess.set('');
    this.isApplyingCoupon.set(false);
  }
}
