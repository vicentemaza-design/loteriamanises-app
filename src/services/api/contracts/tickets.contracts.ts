import type { GameType } from '@/shared/types/domain';
import type { ApiResponseDto } from './common.contracts';

/**
 * Tickets API Contracts
 */

export interface TicketDto {
  id: string;
  userId: string;
  gameId: string;
  gameType: GameType;
  numbers: number[];
  stars?: number[];
  drawDate: string; // ISO Date
  status: 'pending' | 'won' | 'lost';
  prize?: number;
  price: number;
  hasInsurance?: boolean;
  createdAt: string;
}

export type GetTicketsResponseDto = ApiResponseDto<TicketDto[]>;
export type GetTicketByIdResponseDto = ApiResponseDto<TicketDto>;
