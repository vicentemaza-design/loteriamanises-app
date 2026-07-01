import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { NationalBuyFlow } from '../national/components/NationalBuyFlow';
import { NATIONAL_DRAW_CONFIG } from '../national/mocks/national-showcase.mock';
import type { NationalCartLine, NationalDrawId } from '../national/contracts/national-play.contract';
import { buildNationalCartDraftIntent } from '../national/application/build-national-cart-intent';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import {
  getAvailableNationalDrawDates,
  getNextWeekdayIso,
  resolveDrawDates,
} from '../application/resolve-draw-dates';
import { getGameHelpContent } from '../lib/game-help';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayDraft } from '@/features/session/types/session.types';

interface NationalPlayPageProps { game: LotteryGame }

export function NationalPlayPage({ game }: NationalPlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { addDrafts, openLotteryReview } = usePlaySession();

  const isExplicitNationalProduct =
    game.id === 'loteria-nacional-jueves' || game.id === 'loteria-nacional-sabado';

  const [selectedNationalDrawId, setSelectedNationalDrawId] = useState<NationalDrawId>(
    game.id === 'loteria-nacional-sabado' ? 'sabado' : 'jueves'
  );
  const [selectedDrawDates, setSelectedDrawDates] = useState<string[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const availableNationalDates = useMemo(
    () => getAvailableNationalDrawDates(game.id, true, isExplicitNationalProduct),
    [game.id, isExplicitNationalProduct]
  );

  useEffect(() => {
    if (availableNationalDates.length > 0) {
      setSelectedDrawDates([availableNationalDates[0]]);
    }
  }, [availableNationalDates]);

  // Determine draws config
  const nationalDraws = isExplicitNationalProduct
    ? NATIONAL_DRAW_CONFIG.filter((d) => {
        if (game.id === 'loteria-nacional-jueves') return d.id === 'jueves';
        if (game.id === 'loteria-nacional-sabado') return d.id === 'sabado';
        return true;
      }).map((draw) => ({
        ...draw,
        nextDraw: getNextWeekdayIso(draw.weekday, draw.hour),
      }))
    : [
        {
          id: 'especial' as NationalDrawId,
          label: game.name,
          weekday: new Date(game.nextDraw).getDay(),
          hour: new Date(game.nextDraw).getHours(),
          decimoPrice: game.price,
          firstPrize: game.jackpot,
          secondPrize: game.jackpot * 0.2,
          nextDraw: game.nextDraw,
        },
      ];

  const selectedNationalDraw =
    nationalDraws.find((d) => d.id === selectedNationalDrawId) ?? nationalDraws[0];

  const drawDateResolution = useMemo(
    () =>
      resolveDrawDates({
        gameType: game.type,
        gameNextDraw: game.nextDraw,
        isNationalLottery: true,
        isExplicitNationalProduct,
        supportsTimeSelection: isExplicitNationalProduct,
        scheduleMode: 'specific_days',
        selectedDrawDates,
        selectedWeeksCount: 1,
        selectedNationalDrawNextDraw: selectedNationalDraw.nextDraw,
        availableNationalDates,
      }),
    [
      availableNationalDates,
      game.nextDraw,
      game.type,
      isExplicitNationalProduct,
      selectedDrawDates,
      selectedNationalDraw.nextDraw,
    ]
  );

  const effectiveSelectedDrawDates = drawDateResolution.drawDates;
  const highlightedDrawDate = useMemo(() => {
    const sorted = [...effectiveSelectedDrawDates].sort((a, b) => a.localeCompare(b));
    return sorted[0] ?? selectedNationalDraw.nextDraw;
  }, [effectiveSelectedDrawDates, selectedNationalDraw.nextDraw]);

  const availableBalance = profile?.balance ?? 0;
  const drawId = isExplicitNationalProduct ? selectedNationalDrawId : 'especial';

  const helpContent = getGameHelpContent({ game, mode: 'simple', betsCount: 1, totalPrice: 0 });

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
        game,
        isNationalLottery: true,
        isQuiniela: false,
        mode: 'simple',
        selectedNumbers: [],
        selectedStars: [],
        quinielaMatches: [],
        selectedReductionSystemId: '',
        selectedNationalNumber: line.number,
        selectedNationalDraw: { label: line.drawLabel },
      });

      if (!draftSelection) return;

      const lineDrafts = buildPlayDrafts({
        game,
        selection: draftSelection,
        drawDates: line.drawDates,
        totalPrice: line.quantity * unitPrice * line.drawDates.length,
        unitPrice,
        quantity: line.quantity,
        mode: 'simple',
        betsCount: 1,
        isSubscription: false,
        supportsTimeSelection: true,
        timeMode: 'specific_days',
        weeksCount: 1,
        selectedNationalNumber: line.number,
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
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openLotteryReview, 'Décimo');
    }
    if (result.duplicateCount > 0) {
      toast.error(
        result.duplicateCount === 1
          ? '1 décimo ya estaba en tu sesión (omitido).'
          : `${result.duplicateCount} décimos ya estaban en tu sesión (omitidos).`
      );
    }
  };

  // Ignore unused location import (kept for future editing-draft support)
  void location;

  return (
    <div className="flex min-h-full flex-col">
      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />
      <NationalBuyFlow
        game={game}
        drawId={drawId}
        drawLabel={selectedNationalDraw.label}
        drawDates={isExplicitNationalProduct ? availableNationalDates : []}
        effectiveDrawDate={highlightedDrawDate}
        decimoPrice={selectedNationalDraw.decimoPrice}
        availableBalance={availableBalance}
        onSelectDate={isExplicitNationalProduct ? (iso) => {
          setSelectedDrawDates([iso]);
          setSelectedNationalDrawId(
            iso.includes('jue') ? 'jueves' : iso.includes('sab') ? 'sabado' : selectedNationalDrawId
          );
        } : undefined}
        onBack={() => navigate(-1)}
        onPersistLines={handlePersistLines}
      />
    </div>
  );
}
