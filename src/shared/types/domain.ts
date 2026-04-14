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
  isMonthly?: boolean; // For EuroDreams (jackpot is monthly)
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
