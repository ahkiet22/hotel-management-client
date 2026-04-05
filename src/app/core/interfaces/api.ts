export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  path: string;
  method: string;
  message: string;
  data: T;
  timestamp: string;
}
