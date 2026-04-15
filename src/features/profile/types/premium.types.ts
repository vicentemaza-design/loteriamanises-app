import type { WalletMovement } from '@/shared/types/domain';

export interface FavoritePlayDemo {
  id: string;
  gameId: string;
  title: string;
  numbersLabel: string;
  frequency: string;
  budgetLabel: string;
}

export interface SubscriptionDemo {
  id: string;
  gameId: string;
  title: string;
  cadence: string;
  nextChargeLabel: string;
  amountLabel: string;
  status: 'active' | 'paused';
}

export interface WithdrawalRequestDemo {
  id: string;
  amountLabel: string;
  methodLabel: string;
  status: 'ready' | 'pending-review' | 'verified';
  note: string;
}

export interface HelpTopicDemo {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
}

export interface CompanyServiceDemo {
  id: string;
  title: string;
  description: string;
  detail: string;
}

export interface PremiumDemoData {
  favoritePlays: FavoritePlayDemo[];
  subscriptions: SubscriptionDemo[];
  walletMovements: WalletMovement[];
  withdrawals: WithdrawalRequestDemo[];
  helpTopics: HelpTopicDemo[];
  companyServices: CompanyServiceDemo[];
}
