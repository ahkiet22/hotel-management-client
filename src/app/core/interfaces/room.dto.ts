export interface CreateRoomDto {
  roomNumber: string;
  roomTypeId: string;
  description?: string;
  isPublic: boolean;
  status: 'Vacant' | 'Reserved' | 'Occupied' | 'Out of Order';
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}
