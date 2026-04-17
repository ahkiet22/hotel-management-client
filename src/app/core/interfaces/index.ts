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
  role_id: string;
  full_name: string;
  email: string;
  password_hash?: string; // Optional on frontend
  refresh_token?: string;
  phone?: string;
  address?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  role?: Role;
}

// Room Type Interface
export type RoomTypeName = 'Standard' | 'Deluxe' | 'Suite';

export interface RoomType {
  id: string;
  name: RoomTypeName | string;
  description?: string;
  base_price: number;
  capacity: number;
}

// Room Interface
export type RoomStatus = 'Vacant' | 'Reserved' | 'Occupied' | 'Out of Order';

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  status: RoomStatus;
  created_at: string;
  room_type?: RoomType;
}

// Booking Interface
export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';

export interface Booking {
  id: string;
  short_id: string;
  customer_id: string;
  staff_id?: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string;
  actual_check_out?: string;
  total_room_price: number;
  total_service_price: number;
  grand_total: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  customer?: User;
  staff?: User;
  booking_rooms?: BookingRoom[];
  booking_services?: BookingService[];
  payments?: Payment[];
}

// Booking Room Interface (Join Table)
export interface BookingRoom {
  id: string;
  booking_id: string;
  room_id: string;
  price_per_night: number;
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
}

// Booking Service Interface (Join Table)
export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  quantity: number;
  price: number;
  used_at?: string;
  service?: Service;
}

// Payment Interface
export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod | string;
  payment_status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
}

// Invoice Interface (Receipt)
export interface Invoice {
  id: string;
  booking_id: string;
  invoice_number: string;
  total_amount: number;
  issued_date: string;
  issued_by: string;
  booking?: Booking;
  staff?: User;
}

// Alias for client consistency if needed
export type Receipt = Invoice;

// Notification Interface
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// System Log Interface
export interface SystemLog {
  id: string;
  user_id: string;
  action: string;
  description?: string;
  created_at: string;
  user?: User;
}
