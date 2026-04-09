export interface CreateRoomTypeDto {
  name: string;
  description?: string;
  images?: string[];
  basePrice: number;
  capacity: number;
}

export interface UpdateRoomTypeDto extends Partial<CreateRoomTypeDto> {}
