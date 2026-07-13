export type BetMode = 'simple' | 'multiple' | 'reduced' | 'nacional' | 'multiple_direct' | 'reduced_official';

/**
 * SELAE internal game codes — used to route bets and transmissions to the correct
 * SELAE subsystem (terminal, CRAPI, or authorized reseller API).
 * Must be included in every bet request so the backend does not need to derive it.
 */
export type SelaeGameCode =
  | 'LNAC'  // Lotería Nacional (Jueves + Sábado)
  | 'LNNA'  // Lotería de Navidad
  | 'LNNI'  // Lotería del Niño
  | 'PRIM'  // La Primitiva
  | 'ELGR'  // El Gordo de la Primitiva
  | 'BONO'  // Bonoloto
  | 'EURO'  // Euromillones
  | 'QUNI'  // La Quiniela
  | 'EDRE'; // EuroDreams

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

export interface QuinielaFixtureItem {
  id: number;
  home: string;
  away: string;
}

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
  /** Serie del décimo — needed for CRAPI transmission to SELAE (Nacional). */
  nationalSerie?: string;
  /** Fracción del décimo — needed for CRAPI transmission to SELAE (Nacional). */
  nationalFraccion?: string;
  playStatus?: 'pending' | 'processing' | 'confirmed' | 'scrutinized' | 'rejected';
  rejectionReason?: string;
  confirmedAt?: string;
  holderName?: string;
  holderNif?: string;
  deliveryMode?: 'custody' | 'shipping';
  shippingAddress?: {
    name: string;
    surnames: string;
    address: string;
    postalCode: string;
    municipality: string;
    province: string;
    phone: string;
  };
  shippingStatus?: string;
  seriesFractions?: Array<{ serie: string; fraccion: string }>;
  betsCount?: number;
  dayPrizes?: Record<string, number>;
  // Quiniela
  picks?: string[];
  quinielaFixtures?: QuinielaFixtureItem[];
  quinielaSystem?: string;
  quinielaModalidad?: string;
  /** Columnas expandidas por el sistema de reducción (una por apuesta). Cada array tiene 15 picks (14 partidos + P15). */
  generatedColumns?: string[][];
  /** Premio por columna (mismo índice que generatedColumns). 0 = sin premio. */
  columnPrizes?: number[];
  // Primitiva — Joker side-bet
  jokerEnabled?: boolean;
  jokerBoletos?: Array<{ jokerNumber: string }>;
  // Euromillones — El Millón code ranges
  millonBoletos?: Array<{ codeFrom: string; codeTo: string }>;
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
  technicalMode?: BetMode;
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
  bets?: number[][];
  betStars?: number[][];
  betReintegros?: number[];
  drawDate: string;
  status: 'pending' | 'won' | 'lost';
  prize?: number;
  price: number;
  hasInsurance?: boolean; // Laguinda feature: Recubera el 20% de impuestos
  isSubscription?: boolean; // Recurring bet
  orderId?: string;
  metadata?: TicketMetadata;
  createdAt: string;
  /** ID oficial SELAE — CRAPI transmission ID (Nacional) o resguardo ID (otros juegos). */
  selaeTicketId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  photoURL?: string;
  createdAt?: string;
  address?: string;
  postalCode?: string;
  municipality?: string;
  province?: string;
}

export interface WalletMovement {
  id: string;
  userId: string;
  type: 'deposit' | 'bet' | 'prize' | 'withdrawal' | 'adjustment' | 'cancellation';
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
  balanceAfter?: number;
  details?: {
    gameId?: string;
    gameLabel?: string;
    combinations?: string[];
    number?: string;
    quantity?: number;
    shippingCost?: number;
    deliveryMode?: 'custody' | 'shipping';
    iban?: string;
    bankName?: string;
    recipientName?: string;
  };
}

