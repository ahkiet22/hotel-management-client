export interface RoomType {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  base_price: number;
  price_per_night: number;
  capacity: number;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

export interface CreateRoomTypeDto {
  name: string;
  description?: string;
  images?: string[];
  base_price: number;
  price_per_night: number;
  capacity: number;
  is_public?: boolean;
}

export interface UpdateRoomTypeDto {
  name?: string;
  description?: string;
  images?: string[];
  base_price?: number;
  price_per_night?: number;
  capacity?: number;
  is_public?: boolean;
}

export interface QueryRoomTypeDto {
  page?: number;
  limit?: number;
}
