export type MovementType = 'deposit' | 'bet' | 'prize' | 'withdrawal' | 'adjustment' | 'cancellation';

export interface MovementDetails {
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
}

export interface ProfileMovement {
  id: string;
  createdAt: string; // ISO String
  type: MovementType;
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  details?: MovementDetails;
}

export interface SubscriptionBet {
  numbers: number[];
  stars?: number[];
  complementario?: number;
  reintegro?: number;
}

export interface GameSubscription {
  id: string;
  gameId: string;
  gameName: string;
  betsCount: number;
  nextChargeDate: string; // ISO String
  amount: number;
  status: 'active' | 'pending-cancel';
  combinations: SubscriptionBet[];
}

export interface FavoritePlay {
  id: string;
  gameId: string;
  title: string;
  numbersLabel: string;
  frequency: string;
  budgetLabel: string;
  betsCount: number;
  combinations: SubscriptionBet[];
}

export interface PaymentCard {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Maestro';
  last4: string;
  expires: string;
  isDefault: boolean;
}

export interface BankAccount {
  id: string;
  iban: string;
  bank: string;
  alias: string;
  holderName: string;
  isDefault: boolean;
}

export interface BiometricSettings {
  available: boolean;
  enabled: boolean;
}

export interface NotificationPreferences {
  push: {
    account: boolean;
    results: boolean;
    jackpots: boolean;
  };
  email: {
    account: boolean;
    marketing: boolean;
  };
  games: Record<string, boolean>; // Config independiente por juego
}

export interface SelfExclusionOption {
  key: string;
  label: string;
  durationDays?: number;
  isPermanent?: boolean;
}

export interface ResponsibleGamingSettings {
  monthlyPlayLimit: number;
  selfExclusion: {
    enabled: boolean;
    optionKey: string;
    expiryDate?: string;
  };
}

export interface DeliveredPrize {
  id: string;
  createdAt: string; // ISO String
  gameName: string;
  prizeAmount: number;
  location?: string;
  description: string;
  imageUrl?: string;
}
