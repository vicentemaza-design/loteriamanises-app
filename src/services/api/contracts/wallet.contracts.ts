import type { ApiResponseDto } from './common.contracts';

/**
 * Wallet API Contracts
 */

export interface WalletMovementDto {
  id: string;
  userId: string;
  type: 'deposit' | 'bet' | 'prize' | 'withdrawal' | 'adjustment' | 'cancellation';
  amount: number;
  description: string;
  createdAt: string; // ISO Date
  orderId?: string;
  balanceAfter?: number;
  details?: {
    gameId?: string;
    gameLabel?: string;
    combinations?: string[];
    number?: string;
    quantity?: number;
    /**
     * Lotería Nacional: cuando un mismo pedido agrupa varios décimos/números,
     * uno por línea. `number`/`quantity` siguen cubriendo el caso de un único
     * décimo. `drawDate`/`drawLabel` son opcionales para no romper movimientos
     * antiguos que no los tenían — cuando existen, permiten agrupar el
     * desglose por sorteo real en vez de mostrar un único bloque de números.
     */
    numbers?: Array<{ number: string; quantity: number; drawDate?: string; drawLabel?: string }>;
    shippingCost?: number;
    deliveryMode?: 'custody' | 'shipping';
    iban?: string;
    bankName?: string;
    recipientName?: string;
  };
}

export interface WalletBalanceDto {
  balance: number;
  userId: string;
}

export type GetBalanceResponseDto = ApiResponseDto<WalletBalanceDto>;
export type GetMovementsResponseDto = ApiResponseDto<WalletMovementDto[]>;
export type TopUpResponseDto = ApiResponseDto<{ success: boolean; newBalance: number }>;
