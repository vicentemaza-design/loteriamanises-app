import { MOCK_PROFILE_MOVEMENTS } from '../../../../features/profile/data/profile.mock';
import type { WalletBalanceDto, WalletMovementDto } from '../../contracts/wallet.contracts';

// Movimientos generados en vivo durante la sesión demo (p.ej. al confirmar una
// compra) — MOCK_PROFILE_MOVEMENTS es el histórico estático de ejemplo, este
// store acumula lo que el propio usuario va generando. Solo en memoria: no
// sobrevive a un refresh, igual que mockTicketsStore en tickets.mock.ts.
const dynamicMovementsStore: WalletMovementDto[] = [];

export function appendMockMovement(movement: WalletMovementDto) {
  dynamicMovementsStore.unshift(movement);
}

// Saldo demo — única fuente de verdad para el wallet mock. A diferencia de
// tickets/movimientos, el saldo SÍ debe sobrevivir a un refresh (comportamiento
// esperado de un wallet real), así que usa localStorage con una key
// claramente namespaced. Nunca se lee/escribe fuera de este archivo mock:
// firebase/http adapters no la conocen — ver wallet.firebase.ts/wallet.http.ts.
const DEMO_WALLET_STORAGE_KEY = 'manises_demo_wallet_balance_v1';
const DEMO_WALLET_INITIAL_BALANCE = 47.50;

function readDemoWalletBalance(): number {
  if (typeof window === 'undefined') return DEMO_WALLET_INITIAL_BALANCE;
  const raw = window.localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
  if (raw === null) return DEMO_WALLET_INITIAL_BALANCE;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEMO_WALLET_INITIAL_BALANCE;
}

function writeDemoWalletBalance(balance: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_WALLET_STORAGE_KEY, String(balance));
}

/**
 * Descuenta `amount` del saldo demo de forma atómica (lectura+escritura
 * síncrona, sin await en medio) y devuelve el nuevo saldo — usado por
 * play.mock.ts al confirmar un pedido, UNA sola vez por sesión/pedido.
 * Nunca deja el saldo en negativo (defensa adicional: la validación
 * "Saldo insuficiente" ya la hace el propio caller antes de llegar aquí).
 */
export function deductDemoWalletBalance(amount: number): number {
  const newBalance = Math.max(0, readDemoWalletBalance() - amount);
  writeDemoWalletBalance(newBalance);
  return newBalance;
}

export function getDemoWalletBalanceSync(): number {
  return readDemoWalletBalance();
}

export async function getBalanceMock(userId: string): Promise<WalletBalanceDto> {
  return new Promise(resolve => setTimeout(() => resolve({ balance: readDemoWalletBalance(), userId }), 400));
}

export async function getMovementsMock(userId: string): Promise<WalletMovementDto[]> {
  return new Promise(resolve => {
    const list: WalletMovementDto[] = [
      ...dynamicMovementsStore.filter(m => m.userId === userId),
      ...MOCK_PROFILE_MOVEMENTS.map(m => ({
        ...m,
        userId,
      })),
    ];
    setTimeout(() => resolve(list), 600);
  });
}

export async function topUpMock(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const newBalance = readDemoWalletBalance() + amount;
      writeDemoWalletBalance(newBalance);
      appendMockMovement({
        id: `mock-topup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        type: 'deposit',
        amount,
        description: 'Recarga de saldo',
        createdAt: new Date().toISOString(),
        balanceAfter: newBalance,
      });
      resolve({ success: true, newBalance });
    }, 1500);
  });
}
