import type { GameType } from '@/shared/types/domain';

export interface NationalSelection {
  type: 'national';
  number: string;
  drawLabel: string;
}

export interface PrimitivaSelection {
  type: 'primitiva';
  numbers: number[];
  reintegro: number;
}

export interface EuromillonesSelection {
  type: 'euromillones';
  numbers: number[];
  stars: number[];
}

export interface GordoSelection {
  type: 'gordo';
  numbers: number[];
  key: number;
}

export interface QuinielaMatchSelection {
  id: number;
  value: string | null;
}

export interface QuinielaSelection {
  type: 'quiniela';
  matches: QuinielaMatchSelection[];
  systemId?: string;
}

export interface EurodreamsSelection {
  type: 'eurodreams';
  numbers: number[];
  dream: number;
}

export interface BonolotoSelection {
  type: 'bonoloto';
  numbers: number[];
}

export type GameSelection =
  | NationalSelection
  | PrimitivaSelection
  | EuromillonesSelection
  | GordoSelection
  | QuinielaSelection
  | EurodreamsSelection
  | BonolotoSelection;

export type PlayDraftStatus = 'valid' | 'stale' | 'unavailable' | 'editing';

export type PlaySessionStatus =
  | 'idle'
  | 'building'
  | 'reviewing'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export interface PlayDraft {
  id: string;
  gameId: string;
  gameName: string;
  gameType: GameType;
  drawDate: string;
  selection: GameSelection;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
  status: PlayDraftStatus;
  mode: string;
  betsCount: number;
  hasInsurance: boolean;
  isSubscription: boolean;
  metadata?: Record<string, unknown>;
}

export type CartTarget = 'games' | 'lottery';

export interface PlaySession {
  id: string;
  drafts: PlayDraft[];
  status: PlaySessionStatus;
  createdAt: string;
  /** Qué panel de cesta está abierto, o null si ninguno. */
  reviewTarget: CartTarget | null;
}

export interface PlaySessionSummary {
  draftCount: number;
  validCount: number;
  staleCount: number;
  unavailableCount: number;
  totalAmount: number;
  canConfirm: boolean;
}
