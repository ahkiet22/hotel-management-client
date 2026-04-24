export enum RoomStatus {
  VACANT = 'Vacant',
  RESERVED = 'Reserved',
  OCCUPIED = 'Occupied',
  OUT_OF_ORDER = 'Out_of_Order',
}

export interface Room {
  id: string;
  room_number: string;
  description?: string;
  is_public: boolean;
  room_type_id: string;
  status: RoomStatus;
  room_type_name?: string;
  base_price?: number;
  price_per_night?: number;
  capacity?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomDto {
  room_number: string;
  description?: string;
  is_public?: boolean;
  room_type_id: string;
  status?: RoomStatus;
}

export interface UpdateRoomDto {
  room_number?: string;
  description?: string;
  is_public?: boolean;
  room_type_id?: string;
  status?: RoomStatus;
}

export interface QueryRoomDto {
  room_type_id?: string;
  status?: RoomStatus;
  page?: number;
  limit?: number;
}
