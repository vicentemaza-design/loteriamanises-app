import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { NavidadCheckoutFlow } from '../national/components/NavidadCheckoutFlow';
import { NationalPreFlow, type NationalMethod } from '../national/components/NationalPreFlow';
import { NationalAleatorioFlow } from '../national/components/NationalAleatorioFlow';
import { NationalContextBar } from '../national/components/NationalContextBar';
import { useNationalShowcase } from '../national/hooks/useNationalShowcase';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import { getGameHelpContent } from '../lib/game-help';
import type { DeliveryMode } from '../national/components/NationalDeliverySelector';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayDraft } from '@/features/session/types/session.types';

type FlowScreen = 'config' | 'aleatorio' | 'manual';

interface NavidadPlayPageProps { game: LotteryGame }

export function NavidadPlayPage({ game }: NavidadPlayPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addDrafts, openLotteryReview } = usePlaySession();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [flowScreen, setFlowScreen] = useState<FlowScreen>('config');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMode>('custody');
  const [selectedMethod, setSelectedMethod] = useState<NationalMethod>('aleatorio');

  const { items: showcaseItems } = useNationalShowcase('especial');
  const availableBalance = profile?.balance ?? 0;

  const helpContent = getGameHelpContent({ game, mode: 'simple', betsCount: 1, totalPrice: game.price });

  const handlePreFlowConfirm = (delivery: DeliveryMode, method: NationalMethod) => {
    setSelectedDelivery(delivery);
    setSelectedMethod(method);
    if (method === 'aleatorio') {
      // Navidad: añade 1 décimo aleatorio directo a la sesión y muestra toast
      handleAleatorioConfirm(1, 0);
    } else {
      setFlowScreen('manual');
    }
  };

  const handleBack = () => {
    if (flowScreen !== 'config') {
      setFlowScreen('config');
    } else {
      navigate(-1);
    }
  };

  // Formato de fecha de sorteo para el pill informativo
  const formatSorteoLabel = () => {
    const d = new Date(game.nextDraw);
    const fecha = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${game.name} · ${fecha} · ${hora} h`;
  };

  const handleAleatorioConfirm = (sameCount: number, distinctCount: number) => {
    if (showcaseItems.length === 0) {
      toast.error('No hay décimos disponibles en el escaparate demo.');
      return;
    }

    const drawDates = [game.nextDraw];
    const allDrafts: PlayDraft[] = [];
    const usedNumbers = new Set<string>();

    const buildDraftFor = (number: string, quantity: number) => {
      const sel = buildGameSelection({
        game, isNationalLottery: true, isQuiniela: false, mode: 'simple',
        selectedNumbers: [], selectedStars: [], quinielaMatches: [],
        selectedReductionSystemId: '', selectedNationalNumber: number,
        selectedNationalDraw: { label: game.name },
      });
      if (!sel) return;
      const ds = buildPlayDrafts({
        game, selection: sel, drawDates,
        totalPrice: quantity * game.price,
        unitPrice: game.price, quantity,
        mode: 'simple', betsCount: 1, isSubscription: false,
        supportsTimeSelection: false, timeMode: 'specific_days', weeksCount: 1,
        selectedNationalNumber: number, selectedNationalQuantity: quantity,
        selectedNationalDraw: { label: game.name },
      });
      allDrafts.push(...ds);
    };

    // Décimo de la Suerte (mismo número, N copias)
    if (sameCount > 0) {
      const lucky = showcaseItems[0];
      if (lucky) { usedNumbers.add(lucky.number); buildDraftFor(lucky.number, sameCount); }
    }
    // Distintos
    for (let i = 0; i < distinctCount; i++) {
      const available = showcaseItems.filter((t) => !usedNumbers.has(t.number));
      if (available.length === 0) break;
      const ticket = available[Math.floor(Math.random() * available.length)];
      usedNumbers.add(ticket.number);
      buildDraftFor(ticket.number, 1);
    }

    if (allDrafts.length === 0) return;
    const result = addDrafts(allDrafts);
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openLotteryReview, 'Décimo');
      setFlowScreen('config');
    }
    if (result.duplicateCount > 0) {
      toast.error(result.duplicateCount === 1 ? '1 décimo ya estaba en tu sesión (omitido).' : `${result.duplicateCount} décimos ya estaban en tu sesión (omitidos).`);
    }
  };

  const handleNavidadManualConfirm = (items: Array<{ number: string; quantity: number }>) => {
    const drawDates = [game.nextDraw];
    const allDrafts: import('@/features/session/types/session.types').PlayDraft[] = [];

    for (const item of items) {
      const sel = buildGameSelection({
        game, isNationalLottery: true, isQuiniela: false, mode: 'simple',
        selectedNumbers: [], selectedStars: [], quinielaMatches: [],
        selectedReductionSystemId: '', selectedNationalNumber: item.number,
        selectedNationalDraw: { label: game.name },
      });
      if (!sel) continue;
      const ds = buildPlayDrafts({
        game, selection: sel, drawDates,
        totalPrice: item.quantity * game.price,
        unitPrice: game.price, quantity: item.quantity,
        mode: 'simple', betsCount: 1, isSubscription: false,
        supportsTimeSelection: false, timeMode: 'specific_days', weeksCount: 1,
        selectedNationalNumber: item.number, selectedNationalQuantity: item.quantity,
        selectedNationalDraw: { label: game.name },
      });
      allDrafts.push(...ds);
    }

    if (allDrafts.length === 0) return;
    const result = addDrafts(allDrafts);
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openLotteryReview, 'Décimo');
      setFlowScreen('config');
    }
    if (result.duplicateCount > 0) {
      toast.error(result.duplicateCount === 1 ? '1 décimo ya estaba en tu sesión (omitido).' : `${result.duplicateCount} décimos ya estaban en tu sesión (omitidos).`);
    }
  };

  return (
    <div
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <GamePlayHeader
        game={game}
        drawTime={game.nextDraw}
        onBack={handleBack}
        onInfo={() => setIsInfoOpen(true)}
      />

      <GameInfoSheet game={game} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} content={helpContent} />

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-2.5 p-4 pt-2">
        {/* PANTALLA 1: Configuración — sin selector de sorteo, sorteo es fijo */}
        {flowScreen === 'config' && (
          <NationalPreFlow
            fixedSorteoLabel={formatSorteoLabel()}
            availableBalance={availableBalance}
            onConfirm={handlePreFlowConfirm}
          />
        )}

        {/* PANTALLA 2: Aleatorio */}
        {flowScreen === 'aleatorio' && (
          <NationalAleatorioFlow
            drawDate={game.nextDraw}
            drawLabel={game.name}
            delivery={selectedDelivery}
            method={selectedMethod}
            unitPrice={game.price}
            availableBalance={availableBalance}
            showcase={showcaseItems}
            onEdit={() => setFlowScreen('config')}
            onConfirm={handleAleatorioConfirm}
          />
        )}

        {/* PANTALLA 3: Manual — NavidadCheckoutFlow existente */}
        {flowScreen === 'manual' && (
          <>
            {/* Barra de contexto sticky */}
            <div className="sticky top-14 z-10 -mx-4 px-4 pb-2 pt-0">
              <NationalContextBar
                drawDate={game.nextDraw}
                method={selectedMethod}
                onEdit={() => setFlowScreen('config')}
              />
            </div>

            <NavidadCheckoutFlow
              showcaseItems={showcaseItems}
              initialDeliveryMode={selectedDelivery}
              onConfirm={handleNavidadManualConfirm}
            />
          </>
        )}
      </div>
    </div>
  );
}
