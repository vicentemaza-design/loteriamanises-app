import type { WalletMovementDto } from '../contracts/wallet.contracts';
import type { WalletMovement } from '@/shared/types/domain';

/**
 * Wallet Mapper
 * Translates Wallet DTOs to Domain models.
 */
export const walletMapper = {
  /**
   * Maps a WalletMovementDto to the domain model.
   */
  toDomain(dto: WalletMovementDto): WalletMovement {
    return {
      id: dto.id,
      userId: dto.userId,
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      createdAt: dto.createdAt,
    };
  },

  /**
   * Maps a list of DTOs to domain models.
   */
  toDomainList(dtos: WalletMovementDto[]): WalletMovement[] {
    return dtos.map(this.toDomain);
  }
};
