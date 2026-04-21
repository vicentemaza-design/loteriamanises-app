import type { WalletBalanceDto, WalletMovementDto } from '../../contracts/wallet.contracts';

/**
 * Mock Wallet Adapter
 */

export const MOCK_MOVEMENTS: WalletMovementDto[] = [
  { 
    id: 'tx-1', 
    userId: 'demo-user', 
    type: 'prize', 
    amount: 15.00, 
    description: 'Premio Bonoloto', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'tx-2', 
    userId: 'demo-user', 
    type: 'bet', 
    amount: -2.50, 
    description: 'Apuesta Euromillones', 
    createdAt: new Date(Date.now() - 86400000).toISOString() 
  },
  { 
    id: 'tx-3', 
    userId: 'demo-user', 
    type: 'deposit', 
    amount: 20.00, 
    description: 'Recarga Apple Pay', 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
  },
];

export async function getBalanceMock(userId: string): Promise<WalletBalanceDto> {
  return new Promise(resolve => setTimeout(() => resolve({ balance: 124.50, userId }), 400));
}

export async function getMovementsMock(userId: string): Promise<WalletMovementDto[]> {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_MOVEMENTS), 600));
}

export async function topUpMock(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, newBalance: 124.50 + amount });
    }, 1500);
  });
}
