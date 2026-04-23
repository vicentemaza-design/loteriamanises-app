import type { TicketDto } from '../contracts/tickets.contracts';
import type { Ticket } from '@/shared/types/domain';

/**
 * Legacy game ID mapping for backwards compatibility.
 */
const LEGACY_GAME_ID_MAP: Record<string, string> = {
  'loteria-sabado': 'loteria-nacional-sabado',
};

function normalizeLegacyNationalGameId(dto: TicketDto): string {
  if (dto.gameId !== 'loteria-nacional') return LEGACY_GAME_ID_MAP[dto.gameId] ?? dto.gameId;

  const explicitLabel = typeof dto.metadata?.nationalDrawLabel === 'string'
    ? dto.metadata.nationalDrawLabel.toLowerCase()
    : '';

  if (explicitLabel.includes('jueves')) return 'loteria-nacional-jueves';
  if (explicitLabel.includes('sábado') || explicitLabel.includes('sabado')) return 'loteria-nacional-sabado';

  const weekday = new Date(dto.drawDate).getDay();
  if (weekday === 4) return 'loteria-nacional-jueves';
  if (weekday === 6) return 'loteria-nacional-sabado';

  return 'loteria-nacional-sabado';
}

/**
 * Tickets Mapper
 */
export const ticketsMapper = {
  /**
   * Maps a TicketDto to the domain model.
   * Handles legacy ID normalization and type conversion.
   */
  toDomain(dto: TicketDto): Ticket {
    const normalizedGameId = normalizeLegacyNationalGameId(dto);
    
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
      isSubscription: dto.isSubscription,
      orderId: dto.orderId,
      metadata: dto.metadata,
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
