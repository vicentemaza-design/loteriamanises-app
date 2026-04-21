import type { ApiResponseDto } from './common.contracts';

/**
 * Auth API Contracts
 */

export interface AuthUserDto {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface UserProfileDto extends AuthUserDto {
  balance: number;
  createdAt: string;
}

export type GetProfileResponseDto = ApiResponseDto<UserProfileDto>;
