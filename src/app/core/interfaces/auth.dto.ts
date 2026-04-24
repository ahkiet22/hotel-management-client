export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserMe {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: {
    id: string;
    name: string; 
  };
}
