export type GameType =
  | 'primitiva'
  | 'bonoloto'
  | 'euromillones'
  | 'gordo'
  | 'loteria-nacional'
  | 'navidad'
  | 'nino'
  | 'eurodreams'
  | 'quiniela';

export interface TicketMetadata {
  technicalMode?: string;
  systemFamily?: string;
  drawsCount?: number;
  scheduleMode?: string;
  weeksCount?: number;
  drawIndex?: number;
  orderDrawDates?: string[];
  orderTotalPrice?: number;
  nationalNumber?: string;
  nationalQuantity?: number;
  nationalDrawLabel?: string;
  [key: string]: unknown;
}

export interface LotteryGame {
  id: string;
  name: string;
  type: GameType;
  jackpot: number;
  nextDraw: string; // ISO date
  color: string;
  colorEnd?: string; // For gradients
  icon: string;
  price: number; // Price per bet in €
  description?: string;
  frequency?: string; // "Mar y Vie", "Sábados", etc.
  isMonthly?: boolean; // For EuroDreams
  
  // Matriz Técnica (Fase 1)
  technicalMode?: 'simple' | 'multiple' | 'reduced' | 'multiple_direct' | 'reduced_official';
  systemFamily?: 'direct' | 'official' | 'manises';
  guaranteeType?: 'none' | 'direct_full_coverage' | 'conditional_minimum';
  guaranteeCondition?: string;
  selectionRange?: {
    numbers: { min: number; max: number; total: number };
    stars?: { min: number; max: number; total: number };
  };
  productLimit?: string;
  productionPhase1?: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  gameId: string;
  gameType: GameType;
  numbers: number[];
  stars?: number[];
  drawDate: string;
  status: 'pending' | 'won' | 'lost';
  prize?: number;
  price: number;
  hasInsurance?: boolean; // Laguinda feature: Recubera el 20% de impuestos
  isSubscription?: boolean; // Recurring bet
  orderId?: string;
  metadata?: TicketMetadata;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  photoURL?: string;
  createdAt?: string;
}

export interface WalletMovement {
  id: string;
  userId: string;
  type: 'deposit' | 'bet' | 'prize';
  amount: number;
  description: string;
  createdAt: string;
}
