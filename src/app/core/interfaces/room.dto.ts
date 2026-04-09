export interface CreateRoomDto {
  roomNumber: string;
  description?: string;
  isPublic?: boolean;
  roomTypeId: string;
  status: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}
