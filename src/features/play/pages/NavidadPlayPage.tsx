import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { NationalBuyFlow } from '../national/components/NationalBuyFlow';
import { NATIONAL_DRAW_CONFIG } from '../national/mocks/national-showcase.mock';
import type { NationalCartLine } from '../national/contracts/national-play.contract';
import { buildNationalCartDraftIntent } from '../national/application/build-national-cart-intent';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import { getGameHelpContent } from '../lib/game-help';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayDraft } from '@/features/session/types/session.types';

interface NavidadPlayPageProps { game: LotteryGame }

export function NavidadPlayPage({ game }: NavidadPlayPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addDrafts, openLotteryReview } = usePlaySession();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const availableBalance = profile?.balance ?? 0;
  const helpContent = getGameHelpContent({ game, mode: 'simple', betsCount: 1, totalPrice: game.price });

  const handlePersistLines = (lines: NationalCartLine[]) => {
    if (lines.length === 0) return;
    const intent = buildNationalCartDraftIntent(game, lines);
    const allDrafts: PlayDraft[] = [];
    let hasError = false;

    intent.lines.forEach((line) => {
      const drawCfg = NATIONAL_DRAW_CONFIG.find((d) => d.id === line.drawId);
      const unitPrice = drawCfg?.decimoPrice ?? line.unitPrice;

      if (!drawCfg && line.drawId !== 'especial') {
        toast.error(`Error de configuración: sorteo ${line.drawId} no encontrado.`);
        hasError = true;
        return;
      }

      const draftSelection = buildGameSelection({
        game, isNationalLottery: true, isQuiniela: false, mode: 'simple',
        selectedNumbers: [], selectedStars: [], quinielaMatches: [],
        selectedReductionSystemId: '', selectedNationalNumber: line.number,
        selectedNationalDraw: { label: line.drawLabel },
      });
      if (!draftSelection) return;

      const lineDrafts = buildPlayDrafts({
        game, selection: draftSelection, drawDates: line.drawDates,
        totalPrice: line.quantity * unitPrice * line.drawDates.length,
        unitPrice, quantity: line.quantity, mode: 'simple', betsCount: 1,
        isSubscription: false, supportsTimeSelection: false, timeMode: 'specific_days',
        weeksCount: 1, selectedNationalNumber: line.number,
        selectedNationalQuantity: line.quantity,
        selectedNationalDraw: { label: line.drawLabel },
      });

      allDrafts.push(...lineDrafts);
    });

    if (allDrafts.length === 0) {
      if (hasError) toast.error('No se han podido añadir los décimos.');
      return;
    }

    const result = addDrafts(allDrafts);
    if (result.addedCount > 0) notifyAddedToCart(result, openLotteryReview, 'Décimo');
    if (result.duplicateCount > 0) toast.error('Algún décimo ya estaba en tu sesión (omitido).');
  };

  return (
    <div className="flex min-h-full flex-col">
      <GameInfoSheet game={game} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} content={helpContent} />
      <NationalBuyFlow
        game={game}
        drawId="especial"
        drawLabel={game.name}
        drawDates={[]}
        effectiveDrawDate={game.nextDraw}
        decimoPrice={game.price}
        availableBalance={availableBalance}
        onBack={() => navigate(-1)}
        onPersistLines={handlePersistLines}
      />
    </div>
  );
}
