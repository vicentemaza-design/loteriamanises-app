import type { ScheduleMode } from '@/features/play/config/draw-schedule.config';
import type { PlayMode } from '@/features/play/lib/play-matrix';
import { distributeAmount } from '@/features/session/lib/session.utils';
import type { PlayDraft, GameSelection } from '@/features/session/types/session.types';
import type { LotteryGame } from '@/shared/types/domain';

interface EditableDraftRef {
  id: string;
  addedAt: string;
}

interface SelectedNationalDrawInput {
  label: string;
}

interface PlayDraftMetadataShape extends Record<string, unknown> {
  technicalMode?: LotteryGame['technicalMode'];
  systemFamily?: LotteryGame['systemFamily'];
  drawsCount: number;
  scheduleMode: ScheduleMode;
  weeksCount: number;
  orderDrawDates: string[];
  orderTotalPrice: number;
  nationalNumber: string | null;
  nationalQuantity: number;
  nationalDrawLabel: string;
}

export interface BuildPlayDraftsOptions {
  game: LotteryGame;
  selection: GameSelection;
  drawDates: string[];
  totalPrice: number;
  unitPrice: number;
  quantity: number;
  mode: PlayMode;
  betsCount: number;
  isSubscription: boolean;
  supportsTimeSelection: boolean;
  timeMode: ScheduleMode;
  weeksCount: number;
  selectedNationalNumber: string | null;
  selectedNationalQuantity: number;
  selectedNationalDraw: SelectedNationalDrawInput;
  editingDraft?: EditableDraftRef;
}

function buildDraftMetadata({
  game,
  drawDates,
  totalPrice,
  supportsTimeSelection,
  timeMode,
  weeksCount,
  selectedNationalNumber,
  selectedNationalQuantity,
  selectedNationalDraw,
}: Omit<BuildPlayDraftsOptions, 'selection' | 'unitPrice' | 'quantity' | 'mode' | 'betsCount' | 'isSubscription' | 'editingDraft'>): PlayDraftMetadataShape {
  return {
    technicalMode: game.technicalMode,
    systemFamily: game.systemFamily,
    drawsCount: drawDates.length,
    scheduleMode: supportsTimeSelection ? timeMode : 'next_draw',
    weeksCount: supportsTimeSelection ? weeksCount : 1,
    orderDrawDates: drawDates,
    orderTotalPrice: totalPrice,
    nationalNumber: selectedNationalNumber,
    nationalQuantity: selectedNationalQuantity,
    nationalDrawLabel: selectedNationalDraw.label,
  };
}

export function buildPlayDrafts(options: BuildPlayDraftsOptions): PlayDraft[] {
  const distributedTotals = distributeAmount(options.totalPrice, options.drawDates.length);
  const metadata = buildDraftMetadata(options);

  return options.drawDates.map((drawDate, index) => ({
    id: options.editingDraft && index === 0 ? options.editingDraft.id : crypto.randomUUID(),
    gameId: options.game.id,
    gameName: options.game.name,
    gameType: options.game.type,
    drawDate,
    selection: options.selection,
    quantity: options.quantity,
    unitPrice: options.unitPrice,
    totalPrice: distributedTotals[index] ?? distributedTotals[0] ?? options.totalPrice,
    addedAt: options.editingDraft && index === 0 ? options.editingDraft.addedAt : new Date().toISOString(),
    status: 'valid',
    mode: options.mode,
    betsCount: options.betsCount,
    hasInsurance: false,
    isSubscription: options.isSubscription,
    metadata,
  }));
}
