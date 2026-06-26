import { MOCK_PROFILE_MOVEMENTS } from '../../../../features/profile/data/profile.mock';
import type { WalletBalanceDto, WalletMovementDto } from '../../contracts/wallet.contracts';

export async function getBalanceMock(userId: string): Promise<WalletBalanceDto> {
  return new Promise(resolve => setTimeout(() => resolve({ balance: 47.50, userId }), 400));
}

export async function getMovementsMock(userId: string): Promise<WalletMovementDto[]> {
  return new Promise(resolve => {
    const list: WalletMovementDto[] = MOCK_PROFILE_MOVEMENTS.map(m => ({
      ...m,
      userId,
    }));
    setTimeout(() => resolve(list), 600);
  });
}

export async function topUpMock(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, newBalance: 124.50 + amount });
    }, 1500);
  });
}
