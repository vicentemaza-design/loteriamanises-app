import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, FileText, Dice5, Target, CalendarDays, CreditCard, Clock, AlertCircle, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { toast } from 'sonner';
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

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function GameSubscriptionDetailPage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getSubscriptionById, cancelSubscription } = useGameSubscriptions();
  const subscription = getSubscriptionById(subscriptionId);

  const subtitle = useMemo(() => {
    if (!subscription) return 'Abono no encontrado';
    return subscription.status === 'active' ? 'Abono activo' : 'Baja solicitada';
  }, [subscription]);

  if (!subscription) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Detalle del abono" subtitle={subtitle} backTo="/profile/game-subscriptions" />
      </div>
    );
  }

  const { Icon, iconColor, iconBg } = GAME_META[subscription.gameId] ?? FALLBACK_META;
  const isActive = subscription.status === 'active';

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader
        title="Detalle del abono"
        subtitle={subscription.gameName}
        backTo="/profile/game-subscriptions"
      />

      <div className="flex flex-col gap-3 p-4">
        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-black text-manises-blue leading-none tracking-tight">
                {subscription.gameName.toUpperCase()}
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <CalendarDays className="h-3 w-3 shrink-0" />
                Próximo cargo: {formatDateLong(subscription.nextChargeDate)}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                Importe por cargo: {formatCurrency(subscription.amount)}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isActive ? 'Activo' : 'Baja'}
            </span>
          </div>

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50">
            {[
              { label: 'FRECUENCIA',              value: subscription.frequency ?? '—'              },
              { label: 'Nº APUESTAS',             value: String(subscription.betsCount)             },
              { label: 'IMPORTE TOTAL POR CARGO', value: formatCurrency(subscription.amount)        },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center px-1.5 py-2.5 text-center">
                <p className="text-[12px] font-black text-manises-blue leading-tight">{s.value}</p>
                <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.05em] text-slate-400 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Apuestas del abono ──────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-[11px] font-black text-slate-600">
              Apuestas del abono ({subscription.betsCount})
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {subscription.combinations.map((bet, index) => (
              <div key={index} className="px-4 py-3">
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                  Apuesta {index + 1}{index === 0 ? ' (Primera apuesta)' : ''}
                </p>
                <BallSelection numbers={bet.numbers} stars={bet.stars} type={subscription.gameId} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Info tabla ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
          {([
            {
              RowIcon: CalendarDays,
              label: 'Fecha de alta',
              value: subscription.registeredAt ? formatDateShort(subscription.registeredAt) : '—',
            },
            {
              RowIcon: CreditCard,
              label: 'Forma de pago',
              value: subscription.paymentMethod ?? '—',
            },
            {
              RowIcon: Clock,
              label: 'Método de cobro',
              value: subscription.chargeMethod ?? '—',
            },
          ] as const).map(({ RowIcon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <RowIcon className="h-4 w-4 shrink-0 text-slate-300" />
              <p className="flex-1 text-[12px] font-semibold text-slate-500">{label}</p>
              <p className="text-[12px] font-bold text-manises-blue">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Dar de baja ─────────────────────────────────────────── */}
        {isActive && (
          <>
            <button
              type="button"
              onClick={() => {
                cancelSubscription(subscription.id);
                toast.success('Solicitud de baja preparada en demo.');
                navigate('/profile/game-subscriptions');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-black text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" />
              Dar de baja el abono
            </button>

            <div className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3">
              <div className="flex gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-red-600">Aviso antes de dar de baja:</p>
                  <p className="mt-1 text-[10px] font-medium leading-relaxed text-red-500">
                    El abono se cancela y no se renovará automáticamente. Las apuestas ya compradas no se verán afectadas.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
