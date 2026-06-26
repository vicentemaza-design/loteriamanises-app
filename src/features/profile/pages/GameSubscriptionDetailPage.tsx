import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { useGameSubscriptions } from '../hooks/useGameSubscriptions';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { SubscriptionBet } from '../types/profile.types';

function formatBet(bet: SubscriptionBet) {
  const numbers = bet.numbers.map((value) => String(value).padStart(2, '0')).join('  ');
  const extras = [];
  if (bet.stars?.length) {
    extras.push(bet.stars.map((value) => String(value).padStart(2, '0')).join('  '));
  }
  if (typeof bet.complementario === 'number') {
    extras.push(`C ${String(bet.complementario).padStart(2, '0')}`);
  }
  if (typeof bet.reintegro === 'number') {
    extras.push(`R ${String(bet.reintegro).padStart(2, '0')}`);
  }
  return extras.length > 0 ? `${numbers}  ·  ${extras.join('  ·  ')}` : numbers;
}

export function GameSubscriptionDetailPage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getSubscriptionById, cancelSubscription } = useGameSubscriptions();
  const subscription = getSubscriptionById(subscriptionId);

  const subtitle = useMemo(() => {
    if (!subscription) {
      return 'Abono no encontrado';
    }
    return subscription.status === 'active' ? 'Abono activo' : 'Baja solicitada';
  }, [subscription]);

  if (!subscription) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Abono de juego" subtitle={subtitle} backTo="/profile/game-subscriptions" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title={subscription.gameName} subtitle={subtitle} backTo="/profile/game-subscriptions" />

      <div className="flex flex-col gap-4 p-4">
        <PremiumSectionCard
          title="Resumen del abono"
          eyebrow="Información esencial"
          description={`${subscription.betsCount} ${subscription.betsCount === 1 ? 'apuesta' : 'apuestas'} activas`}
          tone="blue"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Próximo cargo</p>
              <p className="mt-2 flex items-center gap-1 text-sm font-black text-manises-blue">
                <CalendarDays className="h-4 w-4" />
                {formatDate(subscription.nextChargeDate)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Importe</p>
              <p className="mt-2 text-sm font-black text-manises-blue">{formatCurrency(subscription.amount)}</p>
            </div>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Tus apuestas" eyebrow="Detalle" description="Las combinaciones se mantienen hasta que des de baja el abono." tone="default">
          <div className="space-y-3">
            {subscription.combinations.map((bet, index) => (
              <div key={`${subscription.id}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Apuesta {index + 1}</p>
                <p className="mt-2 font-mono text-sm font-black tracking-[0.16em] text-manises-blue">
                  {formatBet(bet)}
                </p>
              </div>
            ))}
          </div>
        </PremiumSectionCard>

        <section className="rounded-[1.45rem] border border-red-100 bg-red-50/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">Dar de baja el abono</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-red-700/80">
            El abono dejará de renovarse automáticamente. No se modificarán apuestas ya jugadas y podrás volver a crear uno nuevo cuando quieras.
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              cancelSubscription(subscription.id);
              toast.success('Solicitud de baja preparada en demo.');
              navigate('/profile/game-subscriptions');
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Dar de baja
          </Button>
        </section>
      </div>
    </div>
  );
}
