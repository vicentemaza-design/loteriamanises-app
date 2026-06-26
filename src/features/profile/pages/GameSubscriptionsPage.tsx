import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, Repeat2 } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { useGameSubscriptions } from '../hooks/useGameSubscriptions';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

export function GameSubscriptionsPage() {
  const navigate = useNavigate();
  const { subscriptions } = useGameSubscriptions();

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Mis abonos de juegos" subtitle={`${subscriptions.length} activos o pendientes`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Renovación automática</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
            Consulta tus abonos activos de juegos semanales. Aquí solo ves tus apuestas, su próximo cargo y la opción de dar de baja el abono.
          </p>
        </section>

        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <PremiumSectionCard
              key={subscription.id}
              title={subscription.gameName}
              eyebrow={subscription.status === 'active' ? 'Activo' : 'Baja solicitada'}
              description={`${subscription.betsCount} ${subscription.betsCount === 1 ? 'apuesta' : 'apuestas'}`}
              tone="blue"
            >
              <button
                type="button"
                onClick={() => navigate(`/profile/game-subscriptions/${subscription.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition-all hover:border-manises-blue/15"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-manises-blue/10 text-manises-blue">
                  <Repeat2 className="h-4.5 w-4.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-manises-blue">{formatCurrency(subscription.amount)}</p>
                    <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] ${subscription.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {subscription.status === 'active' ? 'Activo' : 'Baja pedida'}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Próximo cargo {formatDate(subscription.nextChargeDate)}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            </PremiumSectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
