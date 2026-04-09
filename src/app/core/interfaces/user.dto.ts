export interface CreateUserDto {
  roleId: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Locked';
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
}
