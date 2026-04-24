export enum ReportType {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
}

export interface ReportQueryDto {
  startDate?: string;
  endDate?: string;
  type?: ReportType;
  month?: number;
  year?: number;
}

export interface RoomStatsSummary {
  totalBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  activeBookings: number;
}

export interface RoomTypeStat {
  roomTypeName: string;
  totalBooked: number;
}

export interface RoomStats {
  summary: RoomStatsSummary;
  byRoomType: RoomTypeStat[];
}

export interface RevenueTimeline {
  period: string;
  totalRevenue: string | number;
  roomRevenue: string | number;
  serviceRevenue: string | number;
  totalDiscount: string | number;
}

export interface RevenueSummary {
  totalRevenue: string | number;
  roomRevenue: string | number;
  serviceRevenue: string | number;
  totalInvoices: number;
}

export interface RevenueStats {
  summary: RevenueSummary;
  timeline: RevenueTimeline[];
}

export interface TopCustomer {
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: string | number;
}

export interface CustomerStats {
  activeCustomers: number;
  newCustomers: number;
  topCustomers: TopCustomer[];
}

export interface ReportSummary {
  rooms: RoomStatsSummary;
  revenue: RevenueSummary;
  customers: {
    active: number;
    new: number;
  };
}
