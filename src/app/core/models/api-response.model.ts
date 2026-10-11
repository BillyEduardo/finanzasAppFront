export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  errorCode: string | null;
  data: T;
  errors: string[] | null;
}
