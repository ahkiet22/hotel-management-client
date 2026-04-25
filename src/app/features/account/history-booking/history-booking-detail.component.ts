import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  LucideAngularModule,
  ReceiptText,
  User,
  BedDouble,
  QrCode,
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { BookingService, Booking } from '@core/services/booking.service';
import { RoomTypeService } from '@core/services/room-type.service';

type BookingRoomView = {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeDescription: string;
  images: string[];
  capacity: number;
  pricePerNight: number;
};

type BookingDetailView = Booking & {
  rooms: BookingRoomView[];
  services: any[];
};

@Component({
  selector: 'app-history-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <a
        routerLink="/account/history-booking"
        class="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
      >
        <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
        Back to booking history
      </a>

      <div *ngIf="isLoading()" class="bg-white rounded-3xl border border-slate-100 text-center shadow-sm py-20 space-y-4">
        <div class="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 font-medium">Loading booking details...</p>
      </div>

      <div *ngIf="!isLoading() && booking()" class="space-y-6">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div class="space-y-3">
              <span class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-600">
                {{ booking()?.status }}
              </span>
              <h1 class="text-3xl font-black text-slate-900">Booking {{ booking()?.shortId }}</h1>
              <p class="text-slate-500 font-medium">Created {{ booking()?.createdAt | date:'medium' }}</p>
            </div>

            <div class="rounded-2xl bg-slate-900 px-6 py-5 text-white min-w-60">
              <p class="text-xs font-black uppercase tracking-widest text-slate-400">Grand Total</p>
              <p class="mt-3 text-3xl font-black">{{ booking()?.grandTotal | currency:'VND' }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="booking()?.status === 'Pending'" class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <lucide-icon [img]="icons.QrCode" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">Complete Payment</h2>
              <p class="mt-2 text-slate-500 font-medium">
                This booking is still pending. Scan the QR code below to complete payment.
              </p>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center gap-8">
            <div class="w-64 h-64 bg-slate-50 rounded-3xl border border-slate-100 p-4 flex items-center justify-center">
              <img *ngIf="paymentQr()" [src]="paymentQr()" class="w-full h-full object-contain" alt="Payment QR">
              <div *ngIf="!paymentQr()" class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div class="space-y-3">
              <p class="text-xs font-black uppercase tracking-widest text-slate-400">Booking ID</p>
              <p class="text-lg font-black text-slate-900">{{ booking()?.shortId }}</p>
              <p class="text-xs font-black uppercase tracking-widest text-slate-400 pt-3">Amount</p>
              <p class="text-2xl font-black text-slate-900">{{ booking()?.grandTotal | currency:'VND' }}</p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-5">
            <h2 class="text-xl font-black text-slate-900">Stay Information</h2>

            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <lucide-icon [img]="icons.Calendar" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">Check-in</p>
                <p class="mt-1 font-bold text-slate-900">{{ booking()?.checkInDate | date:'medium' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <lucide-icon [img]="icons.CheckCircle2" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">Check-out</p>
                <p class="mt-1 font-bold text-slate-900">{{ booking()?.checkOutDate | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-5">
            <h2 class="text-xl font-black text-slate-900">Booking Summary</h2>

            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <lucide-icon [img]="icons.CreditCard" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">Room Total</p>
                <p class="mt-1 font-bold text-slate-900">{{ booking()?.totalRoomPrice | currency:'VND' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <lucide-icon [img]="icons.ReceiptText" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">Service Total</p>
                <p class="mt-1 font-bold text-slate-900">{{ booking()?.totalServicePrice | currency:'VND' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <lucide-icon [img]="icons.User" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-400">Customer</p>
                <p class="mt-1 font-bold text-slate-900">{{ booking()?.customerName || 'Current account' }}</p>
                <p class="text-sm text-slate-500">{{ booking()?.customerEmail || '' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6" *ngIf="booking()?.rooms?.length">
          <h2 class="text-xl font-black text-slate-900">Booked Rooms</h2>

          <div class="grid gap-5 md:grid-cols-2" >
            <article *ngFor="let room of booking()?.rooms" class="rounded-3xl border border-slate-100 overflow-hidden bg-slate-50">
              <img [src]="room.images[0] || 'assets/images/pic-1.jpg'" class="w-full h-48 object-cover" [alt]="room.roomTypeName">
              <div class="p-6 space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <lucide-icon [img]="icons.BedDouble" class="w-5 h-5"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-xs font-black uppercase tracking-widest text-slate-400">Room Number</p>
                    <p class="font-black text-slate-900">Room {{ room.roomNumber }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-black text-slate-900">{{ room.roomTypeName }}</p>
                  <p class="mt-1 text-sm leading-6 text-slate-500">{{ room.roomTypeDescription || 'Comfortable room prepared for your stay.' }}</p>
                </div>

                <div class="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span class="font-medium text-slate-500">Capacity {{ room.capacity }}</span>
                  <span class="font-black text-slate-900">{{ room.pricePerNight | currency:'VND' }}/night</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HistoryBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  private roomTypeService = inject(RoomTypeService);

  booking = signal<BookingDetailView | null>(null);
  paymentQr = signal<string | null>(null);
  isLoading = signal(true);

  icons = {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    CreditCard,
    ReceiptText,
    User,
    BedDouble,
    QrCode,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      return;
    }

    this.bookingService.getById(id).subscribe({
      next: (booking: any) => {
        this.loadBookingDetail(booking);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private loadBookingDetail(rawBooking: any) {
    const normalizedBooking = this.normalizeBooking(rawBooking);
    const roomTypeIds = [...new Set(normalizedBooking.rooms.map((room) => room.roomTypeId).filter(Boolean))];

    if (normalizedBooking.status === 'Pending') {
      this.loadPaymentQr(normalizedBooking);
    }

    if (roomTypeIds.length === 0) {
      this.booking.set(normalizedBooking);
      this.isLoading.set(false);
      return;
    }

    forkJoin(
      roomTypeIds.map((id) => this.roomTypeService.getById(id)),
    ).subscribe({
      next: (roomTypes: any[]) => {
        const roomTypeMap = new Map(
          roomTypes.map((roomType) => [roomType?.id, this.normalizeRoomType(roomType)]),
        );

        this.booking.set({
          ...normalizedBooking,
          rooms: normalizedBooking.rooms.map((room) => {
            const roomType = roomTypeMap.get(room.roomTypeId);
            return {
              ...room,
              roomTypeName: roomType?.name || room.roomTypeName,
              roomTypeDescription: roomType?.description || room.roomTypeDescription,
              images: roomType?.images?.length ? roomType.images : room.images,
              capacity: roomType?.capacity || room.capacity,
              pricePerNight: roomType?.pricePerNight || room.pricePerNight,
            };
          }),
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.booking.set(normalizedBooking);
        this.isLoading.set(false);
      },
    });
  }

  private loadPaymentQr(booking: BookingDetailView) {
    const amount = Number(booking?.grandTotal ?? 0);
    if (!amount || !booking?.id) {
      return;
    }

    this.paymentQr.set(null);
    this.bookingService.getPaymentQr(amount, `BOOKING_${booking.id}`).subscribe({
      next: (qr: string) => this.paymentQr.set(qr),
      error: () => this.paymentQr.set(null),
    });
  }

  private normalizeBooking(item: any): BookingDetailView {
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
      rooms: Array.isArray(item?.rooms) ? item.rooms.map((room: any) => this.normalizeRoom(room)) : [],
      services: Array.isArray(item?.services) ? item.services : [],
    };
  }

  private normalizeRoom(room: any): BookingRoomView {
    return {
      id: room?.id ?? '',
      roomNumber: room?.roomNumber ?? room?.room_number ?? 'N/A',
      roomTypeId: room?.roomTypeId ?? room?.room_type_id ?? '',
      roomTypeName: room?.roomTypeName ?? room?.room_type_name ?? 'Booked Room',
      roomTypeDescription: room?.description ?? '',
      images: Array.isArray(room?.images) ? room.images : [],
      capacity: Number(room?.capacity ?? 1),
      pricePerNight: Number(room?.pricePerNight ?? room?.price_per_night ?? 0),
    };
  }

  private normalizeRoomType(roomType: any) {
    return {
      id: roomType?.id ?? '',
      name: roomType?.name ?? 'Room Type',
      description: roomType?.description ?? '',
      images: Array.isArray(roomType?.images) ? roomType.images : [],
      capacity: Number(roomType?.capacity ?? 1),
      pricePerNight: Number(roomType?.pricePerNight ?? roomType?.price_per_night ?? 0),
    };
  }
}
