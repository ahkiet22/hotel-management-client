export enum ServiceStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum ServiceType {
  FNB = 'F&B',
  SPA = 'Spa',
  LAUNDRY = 'Laundry',
  TRANSPORTATION = 'Transportation',
  OTHER = 'Other',
}

export interface HotelService {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: ServiceStatus;
  type: ServiceType;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  status?: ServiceStatus | string;
  type?: ServiceType | string;
  quantity?: number;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface AddBookingServiceDto {
  service_id: string;
  quantity: number;
}

export interface QueryServiceDto {
  page?: number;
  limit?: number;
}
