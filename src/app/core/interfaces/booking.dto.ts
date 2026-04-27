export enum BookingStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'Checked-in',
  CHECKED_OUT = 'Checked-out',
  CANCELLED = 'Cancelled',
}

export interface BookingServiceItemDto {
  serviceId: string;
  quantity: number;
}

export interface CreateBookingDto {
  customerId: string;
  staffId?: string;
  checkInDate: string;
  checkOutDate: string;
  roomTypeId: string;
  roomIds: string[];
  services?: BookingServiceItemDto[];
  discount?: number;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  actualCheckIn?: string;
  actualCheckOut?: string;
  totalRoomPrice?: number;
  totalServicePrice?: number;
  grandTotal?: number;
}

export interface Booking {
  id: string;
  shortId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  staffId?: string;
  staffName?: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  totalRoomPrice: number;
  totalServicePrice: number;
  discount: number;
  grandTotal: number;
  deposit?: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueryBookingDto {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  customerId?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface CreateCouponDto {
  code: string;
  discount_type: 'Percentage' | 'Fixed';
  discount_value: number;
  coupon_status?: 'Active' | 'Inactive' | 'Expired';
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}

export interface ApplyCouponDto {
  bookingId: string;
  couponCode: string;
}

export interface Coupon {
  id: string;
  code: string;
  coupon_status?: string;
  discount_type: 'Percentage' | 'Fixed' | string;
  discount_value: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  expired_at?: string;
  usage_limit?: number;
  used_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableRoom {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  basePrice: number;
  pricePerNight?: number;
  capacity: number;
  status: string;
  description?: string;
  images?: string[];
}
