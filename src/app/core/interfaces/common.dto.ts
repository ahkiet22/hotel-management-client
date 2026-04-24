export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface Meta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedResponse<T> {
  meta: Meta;
  result: T[];
}

export interface QueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
