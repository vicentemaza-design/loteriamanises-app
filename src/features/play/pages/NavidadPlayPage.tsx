import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { NavidadCheckoutFlow } from '../national/components/NavidadCheckoutFlow';
import { NationalPreFlow, type NationalMethod } from '../national/components/NationalPreFlow';
import { NationalAleatorioFlow } from '../national/components/NationalAleatorioFlow';
import { useNationalShowcase } from '../national/hooks/useNationalShowcase';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import { getGameHelpContent } from '../lib/game-help';
import type { DeliveryMode } from '../national/components/NationalDeliverySelector';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayDraft } from '@/features/session/types/session.types';

interface NavidadPlayPageProps { game: LotteryGame }

export function NavidadPlayPage({ game }: NavidadPlayPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { topUp } = useWallet();
  const { addDrafts, openLotteryReview } = usePlaySession();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [preFlowDone, setPreFlowDone] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMode>('custody');
  const [selectedMethod, setSelectedMethod] = useState<NationalMethod>('elegir');

  const { items: showcaseItems } = useNationalShowcase('especial');
  const availableBalance = profile?.balance ?? 0;

  const helpContent = getGameHelpContent({ game, mode: 'simple', betsCount: 1, totalPrice: game.price });

  const handlePreFlowConfirm = (delivery: DeliveryMode, method: NationalMethod) => {
    setSelectedDelivery(delivery);
    setSelectedMethod(method);
    setPreFlowDone(true);
  };

  const handleBack = () => {
    if (preFlowDone) {
      setPreFlowDone(false);
    } else {
      navigate(-1);
    }
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
      const drafts = buildPlayDrafts({
        game, selection: sel, drawDates,
        totalPrice: quantity * game.price,
        unitPrice: game.price, quantity,
        mode: 'simple', betsCount: 1, isSubscription: false,
        supportsTimeSelection: false, timeMode: 'specific_days', weeksCount: 1,
        selectedNationalNumber: number, selectedNationalQuantity: quantity,
        selectedNationalDraw: { label: game.name },
      });
      allDrafts.push(...drafts);
    };

    if (sameCount > 0) {
      const ticket = showcaseItems[Math.floor(Math.random() * showcaseItems.length)];
      if (ticket) {
        usedNumbers.add(ticket.number);
        buildDraftFor(ticket.number, sameCount);
      }
    }

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
      setPreFlowDone(false);
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
        {!preFlowDone && (
          // Para Navidad no se muestra sección de sorteo (fecha fija)
          <NationalPreFlow onConfirm={handlePreFlowConfirm} />
        )}

        {preFlowDone && selectedMethod === 'aleatorio' && (
          <NationalAleatorioFlow
            unitPrice={game.price}
            drawLabel={game.name}
            onConfirm={handleAleatorioConfirm}
            onBack={() => setPreFlowDone(false)}
          />
        )}

        {preFlowDone && selectedMethod === 'elegir' && (
          <NavidadCheckoutFlow
            game={game}
            showcaseItems={showcaseItems}
            availableBalance={availableBalance}
            drawDate={game.nextDraw}
            initialDeliveryMode={selectedDelivery}
            initialMethod={selectedMethod}
            onTopUp={async (amount) => {
              const result = await topUp(amount);
              if (!result?.success) throw new Error('Top-up failed');
            }}
            onGoToTickets={() => navigate('/tickets')}
          />
        )}
      </div>
    </div>
  );
}
