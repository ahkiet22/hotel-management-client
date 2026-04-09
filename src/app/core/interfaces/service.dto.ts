export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  status: string;
  type: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}
