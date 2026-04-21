/**
 * Common API Contracts
 * Definitions for errors, status and shared DTOs.
 */

export interface ApiErrorDto {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponseDto<T> {
  data: T;
  meta?: Record<string, any>;
}
