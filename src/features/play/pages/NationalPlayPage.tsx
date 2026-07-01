import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBusinessDate } from '@/shared/lib/timezone';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { NationalAdvancedFlow } from '../national/components/NationalAdvancedFlow';
import type { DeliveryMode } from '../national/components/NationalDeliverySelector';
import {
  NATIONAL_DRAW_CONFIG,
  DEFAULT_NATIONAL_SEARCH_STATE,
} from '../national/mocks/national-showcase.mock';
import type { NationalDrawId } from '../national/contracts/national-play.contract';
import { useNationalShowcase } from '../national/hooks/useNationalShowcase';
import { useNationalCart } from '../national/hooks/useNationalCart';
import { buildNationalCartDraftIntent } from '../national/application/build-national-cart-intent';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import {
  getAvailableNationalDrawDates,
  getNextWeekdayIso,
  resolveDrawDates,
} from '../application/resolve-draw-dates';
import { resolveDrawStatus } from '../draw-status/application/resolve-draw-status';
import { getGameHelpContent } from '../lib/game-help';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayDraft } from '@/features/session/types/session.types';

interface GamePlayLocationState { playDraftId?: string; }

const DEFAULT_CUSTOM_WEEKS = 2;

interface NationalPlayPageProps {
  game: LotteryGame;
}

export function NationalPlayPage({ game }: NationalPlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { drafts, addDrafts, openLotteryReview: openReview } = usePlaySession();

  const editingDraftId = (location.state as GamePlayLocationState | null)?.playDraftId;
  const editingDraft = useMemo(
    () => drafts.find((d) => d.id === editingDraftId),
    [drafts, editingDraftId]
  );

  const isExplicitNationalProduct =
    game.id === 'loteria-nacional-jueves' || game.id === 'loteria-nacional-sabado';

  const [selectedNationalDrawId, setSelectedNationalDrawId] = useState<NationalDrawId>(
    game.id === 'loteria-nacional-jueves' ? 'jueves' : 'sabado'
  );
  const [selectedDrawDates, setSelectedDrawDates] = useState<string[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const availableNationalDates = useMemo(
    () => getAvailableNationalDrawDates(game.id, true, isExplicitNationalProduct),
    [game.id, isExplicitNationalProduct]
  );

  const showcaseDrawId = game.id === 'loteria-nacional-sabado' ? 'sabado' : 'jueves';
  const {
    setDrawId: setNationalShowcaseDrawId,
    searchState: nationalSearchState,
    setSearchState: setNationalSearchState,
    items: nationalShowcase,
    totalItems: nationalShowcaseCount,
  } = useNationalShowcase(showcaseDrawId);

  const {
    lines: nationalCartLines,
    addOrUpdateLine: addOrUpdateNationalCartLine,
    removeLine: removeNationalCartLine,
    updateQuantity: updateNationalCartQuantity,
    updateDeliveryMode: updateNationalCartDeliveryMode,
    clearCart: clearNationalCart,
    breakdown: nationalCartBreakdown,
  } = useNationalCart();

  useEffect(() => {
    if (availableNationalDates.length > 0) {
      setSelectedDrawDates([availableNationalDates[0]]);
    }
  }, [availableNationalDates]);

  useEffect(() => {
    setNationalShowcaseDrawId(isExplicitNationalProduct ? selectedNationalDrawId : 'especial');
  }, [isExplicitNationalProduct, selectedNationalDrawId, setNationalShowcaseDrawId]);

  useEffect(() => {
    if (!editingDraft || editingDraft.gameId !== game.id) return;
    if (editingDraft.selection.type !== 'national') return;
    const draftDates = Array.isArray(editingDraft.metadata?.orderDrawDates)
      ? editingDraft.metadata.orderDrawDates.filter((d): d is string => typeof d === 'string')
      : [editingDraft.drawDate];
    setSelectedDrawDates(draftDates);
  }, [editingDraft, game.id]);

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
        scheduleMode: 'next_draw',
        selectedDrawDates,
        selectedWeeksCount: DEFAULT_CUSTOM_WEEKS,
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
  const drawsCount = Math.max(effectiveSelectedDrawDates.length, 1);

  const highlightedDrawDate = useMemo(() => {
    const sorted = [...effectiveSelectedDrawDates].sort((a, b) => a.localeCompare(b));
    return sorted[0] ?? getBusinessDate(selectedNationalDraw.nextDraw);
  }, [effectiveSelectedDrawDates, selectedNationalDraw.nextDraw]);

  const drawStatus = useMemo(
    () => resolveDrawStatus({ drawDate: highlightedDrawDate }),
    [highlightedDrawDate]
  );

  const availableBalance = profile?.balance ?? 0;

  const helpContent = getGameHelpContent({
    game,
    mode: 'simple',
    betsCount: nationalCartBreakdown.totalDecimos,
    totalPrice: nationalCartBreakdown.total,
  });

  const handleRandom = (deliveryMode: DeliveryMode = 'custody') => {
    const randomTicket = nationalShowcase[Math.floor(Math.random() * nationalShowcase.length)];
    if (!randomTicket) {
      toast.error('No hay décimos disponibles en el escaparate demo.');
      return;
    }
    addOrUpdateNationalCartLine({
      number: randomTicket.number,
      serie: randomTicket.serie,
      fraccion: randomTicket.fraccion,
      drawId: isExplicitNationalProduct ? selectedNationalDrawId : 'especial',
      drawLabel: selectedNationalDraw.label,
      drawDates: effectiveSelectedDrawDates,
      quantity: 1,
      unitPrice: selectedNationalDraw.decimoPrice,
      totalPrice: selectedNationalDraw.decimoPrice * drawsCount,
      deliveryMode,
      maxQuantity: randomTicket.available,
    });
  };

  const handleClear = () => {
    clearNationalCart();
    setNationalSearchState(DEFAULT_NATIONAL_SEARCH_STATE);
  };

  const handlePersistNationalCart = () => {
    if (nationalCartLines.length === 0) return;
    const intent = buildNationalCartDraftIntent(game, nationalCartLines);
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
      if (hasError) toast.error('No se han podido añadir borradores debido a errores técnicos.');
      return;
    }

    const result = addDrafts(allDrafts);

    if (result.addedCount > 0) {
      notifyAddedToCart(result, undefined, 'Décimo');
      clearNationalCart();
      openReview();
    }

    if (result.duplicateCount > 0) {
      toast.error(
        result.duplicateCount === 1
          ? '1 décimo ya estaba en tu sesión (omitido).'
          : `${result.duplicateCount} décimos ya estaban en tu sesión (omitidos).`
      );
    }
  };

  const drawId = isExplicitNationalProduct ? selectedNationalDrawId : 'especial';

  return (
    <div
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <GamePlayHeader
        game={game}
        drawTime={selectedNationalDraw.nextDraw}
        onBack={() => navigate(-1)}
        onInfo={() => setIsInfoOpen(true)}
      />

      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-2.5 p-4 pt-2">
        <NationalAdvancedFlow
          game={game}
          selectedNationalDraw={selectedNationalDraw}
          drawsCount={drawsCount}
          drawStatus={drawStatus}
          supportsTimeSelection={isExplicitNationalProduct}
          availableNationalDates={availableNationalDates}
          effectiveSelectedDrawDates={effectiveSelectedDrawDates}
          onSelectDate={(dateIso) => setSelectedDrawDates([dateIso])}
          nationalShowcase={{
            items: nationalShowcase,
            count: nationalShowcaseCount,
            searchState: nationalSearchState,
            setSearchState: setNationalSearchState,
          }}
          nationalCart={{
            lines: nationalCartLines,
            breakdown: nationalCartBreakdown,
            removeLine: removeNationalCartLine,
            updateQuantity: updateNationalCartQuantity,
            updateDeliveryMode: updateNationalCartDeliveryMode,
            clearCart: clearNationalCart,
            onPersistToSession: handlePersistNationalCart,
          }}
          availableBalance={availableBalance}
          onSelectNationalNumber={(ticket, deliveryMode) => {
            const existing = nationalCartLines.find(
              (l) => l.number === ticket.number && l.drawId === drawId
            );
            if (existing) {
              removeNationalCartLine(ticket.number, drawId);
            } else {
              addOrUpdateNationalCartLine({
                number: ticket.number,
                serie: ticket.serie,
                fraccion: ticket.fraccion,
                drawId,
                drawLabel: selectedNationalDraw.label,
                drawDates: effectiveSelectedDrawDates,
                quantity: 1,
                unitPrice: selectedNationalDraw.decimoPrice,
                totalPrice: selectedNationalDraw.decimoPrice * drawsCount,
                deliveryMode,
                maxQuantity: ticket.available,
              });
            }
          }}
          onRandomNationalNumber={handleRandom}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
