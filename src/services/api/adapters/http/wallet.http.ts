import type { WalletMovementDto } from '../../contracts/wallet.contracts';

/**
 * HTTP Wallet Adapter (Stub)
 */

export async function getBalanceHttp(userId: string): Promise<number> {
  return 0;
}

export async function getMovementsHttp(userId: string): Promise<WalletMovementDto[]> {
  return [];
}

export async function topUpHttp(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  return { success: false, newBalance: 0 };
}
