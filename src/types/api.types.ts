export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    request_id: string;
  };
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  requestId?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedA<T, K extends string = "items"> = { [P in K]: T[] } & PaginationMeta;

export interface PaginatedB<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedOffset<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type ApiListResponse<T, K extends string = "items"> = PaginatedA<T, K> | T[];
