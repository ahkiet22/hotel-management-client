export enum UserStatus {
  ACTIVE = 'Active',
  LOCKED = 'Locked',
}

export interface User {
  id: string;
  role_id: string;
  roleName?: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  password?: string;
  roleId?: string;
  phone?: string;
  address?: string;
}
