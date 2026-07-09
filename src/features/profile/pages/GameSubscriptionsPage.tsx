import { useNavigate } from 'react-router-dom';
import { Star, FileText, Dice5, Target, Eye, ChevronRight, CalendarDays } from 'lucide-react';
import type { ComponentType } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { useGameSubscriptions } from '../hooks/useGameSubscriptions';
import { formatCurrency } from '@/shared/lib/utils';
import { BallSelection } from '@/features/tickets/components/BallSelection';

interface GameMeta {
  Icon: ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const GAME_META: Record<string, GameMeta> = {
  euromillones: { Icon: Star,     iconColor: 'text-blue-500',   iconBg: 'bg-blue-50'   },
  primitiva:    { Icon: FileText, iconColor: 'text-green-600',  iconBg: 'bg-green-50'  },
  bonoloto:     { Icon: Dice5,    iconColor: 'text-teal-600',   iconBg: 'bg-teal-50'   },
  gordo:        { Icon: Target,   iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
};

const FALLBACK_META = GAME_META.bonoloto;

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function GameSubscriptionsPage() {
  const navigate = useNavigate();
  const { subscriptions } = useGameSubscriptions();

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Mis abonos" subtitle={`${subscriptions.length} activos`} />

      <div className="flex flex-col gap-3 p-4">
        {subscriptions.map((sub) => {
          const { Icon, iconColor, iconBg } = GAME_META[sub.gameId] ?? FALLBACK_META;
          const firstBet = sub.combinations[0];
          const extraBets = sub.combinations.length - 1;
          const isActive = sub.status === 'active';

          return (
            <div key={sub.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              {/* Cabecera: icono + nombre + importe/estado */}
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-manises-blue leading-none tracking-tight">
                    {sub.gameName.toUpperCase()}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    Próximo cargo: {formatDateLong(sub.nextChargeDate)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-[15px] font-black text-manises-blue leading-none">
                    {formatCurrency(sub.amount)}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isActive ? 'Activo' : 'Baja pedida'}
                  </span>
                </div>
              </div>

              {/* Primera apuesta */}
              {firstBet && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Primera apuesta
                  </p>
                  <BallSelection numbers={firstBet.numbers} stars={firstBet.stars} type={sub.gameId} />
                  {extraBets > 0 && (
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                      + {extraBets} {extraBets === 1 ? 'apuesta' : 'apuestas'} más
                    </p>
                  )}
                </div>
              )}

              {/* Acceso al detalle */}
              <button
                type="button"
                onClick={() => navigate(`/profile/game-subscriptions/${sub.id}`)}
                className="mt-3 flex w-full items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left transition-all hover:border-manises-blue/15 active:scale-[0.99]"
              >
                <Eye className="h-3.5 w-3.5 shrink-0 text-manises-blue/50" />
                <span className="flex-1 text-[11px] font-semibold text-manises-blue">Ver detalle de la jugada</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
