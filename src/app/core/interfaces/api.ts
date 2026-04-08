export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  path: string;
  method: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface Meta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface ListResponse<T> {
  meta: Meta;
  result: T[];
}
