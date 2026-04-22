import type { ResultDto } from '../contracts/results.contracts';

/**
 * Results Mapper
 * Translates Backend DTOs to UI Domain models.
 * This protects the UI from changes in the Backend API structure.
 */

export const resultsMapper = {
  /**
   * Maps a single ResultDto to the UI representation.
   */
  toDomain(dto: ResultDto) {
    return {
      gameId: dto.gameId,
      gameType: dto.gameType,
      date: dto.date,
      numbers: dto.numbers,
      stars: dto.stars,
      complementario: dto.complementario,
      reintegro: dto.reintegro,
      firstPrizeNumber: dto.firstPrizeNumber,
      secondPrizeNumber: dto.secondPrizeNumber,
      reintegros: dto.reintegros,
      decimoPrice: dto.decimoPrice,
      jackpotNext: dto.jackpotNext,
      drawId: dto.drawId,
      // Add any additional UI-specific computed fields here
    };
  },

  /**
   * Maps a list of ResultDto to the UI representation.
   */
  toDomainList(dtos: ResultDto[]) {
    return dtos.map(this.toDomain);
  }
};
