import type { QuickPickDraftIntent } from '../contracts/quick-pick.contract';
import type { PlayDraft } from '@/features/session/types/session.types';
import { buildPlayDrafts } from '@/features/play/application/build-play-drafts';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';

export function buildQuickPickDrafts(intent: QuickPickDraftIntent): PlayDraft[] {
  const { game, combinations, drawDates, isSubscription } = intent;
  const allDrafts: PlayDraft[] = [];

  combinations.forEach((combo) => {
    // Resolve pricing for one single bet (simple mode always for quick pick)
    const pricing = resolvePlayPricing({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode: 'simple',
      selectedNumbersCount: combo.numbers.length,
      selectedStarsCount: combo.stars?.length ?? 0,
      selectedReductionSystemId: '',
      selectedNationalQuantity: 1,
      selectedNationalDraw: { decimoPrice: game.price },
      drawsCount: drawDates.length,
    });

    const drafts = buildPlayDrafts({
      game,
      selection: combo.selection,
      drawDates,
      totalPrice: pricing.totalPrice,
      unitPrice: pricing.drawPrice,
      quantity: 1,
      mode: 'simple',
      betsCount: 1,
      isSubscription,
      supportsTimeSelection: false,
      timeMode: 'next_draw',
      weeksCount: 1,
      selectedNationalNumber: null,
      selectedNationalQuantity: 1,
      selectedNationalDraw: { label: '' },
    });

    allDrafts.push(...drafts);
  });

  return allDrafts;
}
