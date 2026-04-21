import type { TicketDto } from '../contracts/tickets.contracts';
import type { Ticket } from '@/shared/types/domain';

/**
 * Legacy game ID mapping for backwards compatibility.
 */
const LEGACY_GAME_ID_MAP: Record<string, string> = {
  'loteria-sabado': 'loteria-nacional',
};

/**
 * Tickets Mapper
 */
export const ticketsMapper = {
  /**
   * Maps a TicketDto to the domain model.
   * Handles legacy ID normalization and type conversion.
   */
  toDomain(dto: TicketDto): Ticket {
    const normalizedGameId = LEGACY_GAME_ID_MAP[dto.gameId] ?? dto.gameId;
    
    return {
      id: dto.id,
      userId: dto.userId,
      gameId: normalizedGameId,
      gameType: dto.gameType,
      numbers: dto.numbers,
      stars: dto.stars,
      drawDate: dto.drawDate,
      status: dto.status,
      prize: dto.prize,
      price: dto.price,
      hasInsurance: dto.hasInsurance,
      createdAt: dto.createdAt,
      // Map other optional domain fields if present in DTO
    } as Ticket;
  },

  /**
   * Maps a list of Dto to domain list.
   */
  toDomainList(dtos: TicketDto[]): Ticket[] {
    return dtos.map(this.toDomain);
  }
};
