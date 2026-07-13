import type { GameType, TicketMetadata } from '@/shared/types/domain';
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
  bets?: number[][];
  betStars?: number[][];
  betReintegros?: number[];
  drawDate: string; // ISO Date
  status: 'pending' | 'won' | 'lost';
  prize?: number;
  price: number;
  hasInsurance?: boolean;
  isSubscription?: boolean;
  orderId?: string;
  metadata?: TicketMetadata;
  createdAt: string;
  /**
   * ID oficial de SELAE para este ticket.
   * - Lotería Nacional: ID de transmisión CRAPI registrado en el sistema central de SELAE.
   * - Otros juegos (Primitiva, Euromillones…): ID del resguardo emitido por SELAE al registrar la apuesta.
   * Sin este campo, el ticket NO tiene validez legal ante SELAE.
   */
  selaeTicketId?: string;
}

export type GetTicketsResponseDto = ApiResponseDto<TicketDto[]>;
export type GetTicketByIdResponseDto = ApiResponseDto<TicketDto>;
