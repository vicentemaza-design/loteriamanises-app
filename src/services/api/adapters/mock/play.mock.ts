import type { CreateBetRequestDto, CreateBetResponseDto } from '../../contracts/play.contracts';

/**
 * Mock Play Adapter
 */

export async function placeBetMock(dto: CreateBetRequestDto): Promise<CreateBetResponseDto> {
  return new Promise((resolve) => {
    console.log('[MockAdapter] Placing bet:', dto);
    
    // Simulate network delay
    setTimeout(() => {
      resolve({
        success: true,
        ticketId: `mock-ticket-${Math.random().toString(36).substr(2, 9)}`,
      });
    }, 1500);
  });
}
