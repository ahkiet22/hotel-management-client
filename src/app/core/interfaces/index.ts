// Role Interface
export type RoleName = 'Admin' | 'Staff' | 'Customer';

export interface Role {
  id: string;
  name: RoleName;
}

// User Interface
export type UserStatus = 'Active' | 'Locked';

export interface User {
  id: string;
  role_id: string; // From JSON: role_id
  fullName: string; // From JSON: fullName
  email: string;
  phone?: string | null;
  address?: string | null;
  status: UserStatus;
  createdAt: string; // From JSON: createdAt
  updatedAt: string; // From JSON: updatedAt
  roleName?: RoleName; // From JSON: roleName
  role?: Role;
}

// Room Type Interface
export type RoomTypeName = 'Standard' | 'Deluxe' | 'Suite';

export interface RoomType {
  id: string;
  name: RoomTypeName | string;
  description?: string;
  basePrice: number;
  capacity: number;
  images?: string[];
}

// Room Interface
export type RoomStatus = 'Vacant' | 'Reserved' | 'Occupied' | 'Out of Order';

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  status: RoomStatus;
  createdAt: string;
  isPublic: boolean;
  roomType?: RoomType;
}

// Booking Interface
export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';

export interface Booking {
  id: string;
  shortId: string;
  customerId: string;
  staffId?: string;
  checkIn: string;
  checkOut: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  totalRoomPrice: number;
  totalServicePrice: number;
  grandTotal: number;
  status: BookingStatus;
  discount?: number;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  staff?: User;
  bookingRooms?: BookingRoom[];
  bookingServices?: BookingService[];
  payments?: Payment[];
}

// Booking Room Interface (Join Table)
export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  pricePerNight: number;
  room?: Room;
}

// Service Interface
export type ServiceStatus = 'Active' | 'Inactive';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: ServiceStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Booking Service Interface (Join Table)
export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number;
  usedAt?: string;
  service?: Service;
}

// Payment Interface
export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

// Invoice Interface (Receipt)
export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  totalAmount: number;
  issuedDate: string;
  issuedBy: string;
  booking?: Booking;
  staff?: User;
}

// Alias for client consistency if needed
export type Receipt = Invoice;

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// System Log Interface
export interface SystemLog {
  id: string;
  userId: string;
  action: string;
  description?: string;
  createdAt: string;
  user?: User;
}
