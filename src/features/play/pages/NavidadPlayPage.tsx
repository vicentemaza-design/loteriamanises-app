import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { NavidadCheckoutFlow } from '../national/components/NavidadCheckoutFlow';
import { NationalPreFlow, type NationalMethod } from '../national/components/NationalPreFlow';
import { useNationalShowcase } from '../national/hooks/useNationalShowcase';
import { getGameHelpContent } from '../lib/game-help';
import type { DeliveryMode } from '../national/components/NationalDeliverySelector';
import type { LotteryGame } from '@/shared/types/domain';

interface NavidadPlayPageProps { game: LotteryGame }

export function NavidadPlayPage({ game }: NavidadPlayPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { topUp } = useWallet();
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

  return (
    <div
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <GamePlayHeader
        game={game}
        drawTime={game.nextDraw}
        onBack={preFlowDone ? () => setPreFlowDone(false) : () => navigate(-1)}
        onInfo={() => setIsInfoOpen(true)}
      />

      <GameInfoSheet game={game} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} content={helpContent} />

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-2.5 p-4 pt-2">
        {!preFlowDone ? (
          <NationalPreFlow onConfirm={handlePreFlowConfirm} />
        ) : (
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
