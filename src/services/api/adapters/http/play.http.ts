import type { CreateBetRequestDto, CreateBetResponseDto } from '../../contracts/play.contracts';

/**
 * HTTP Play Adapter (Stub)
 */

export async function placeBetHttp(dto: CreateBetRequestDto): Promise<CreateBetResponseDto> {
  console.warn('placeBetHttp: Not implemented yet.');
  return {
    success: false,
    error: 'La integración con API REST no está disponible todavía.'
  };
}
