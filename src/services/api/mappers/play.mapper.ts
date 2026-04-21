import type { CreateBetRequestDto } from '../contracts/play.contracts';

/**
 * Play Mapper
 * Translates UI selection and game state into a standardized Purchase DTO.
 */
export const playMapper = {
  /**
   * Maps the raw UI state to a CreateBetRequestDto.
   * This ensures the adapters receive a consistent structure regardless of the game.
   */
  toCreateBetDto(params: any): CreateBetRequestDto {
    return {
      gameId: params.gameId,
      gameType: params.gameType,
      numbers: params.numbers,
      stars: params.stars,
      selections: params.selections, // For Quiniela
      systemId: params.systemId,     // For Reduced
      
      mode: params.mode,
      price: params.price,
      drawDate: params.drawDate,
      drawDates: params.drawDates,
      scheduleMode: params.scheduleMode,
      weeksCount: params.weeksCount,
      betsCount: params.betsCount || 1,
      hasInsurance: params.hasInsurance || false,
      isSubscription: params.isSubscription || false,
      metadata: params.metadata || {},
    };
  }
};
