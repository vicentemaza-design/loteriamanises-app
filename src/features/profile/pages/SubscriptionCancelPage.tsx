import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Info, XCircle } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { formatDate } from '@/shared/lib/utils';

export function SubscriptionCancelPage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getNumberById, getReservationsForNumber, cancelSubscription } = useSubscriptions();
  const subscription = getNumberById(subscriptionId);
  const reservations = useMemo(
    () => getReservationsForNumber(subscriptionId).sort((a, b) => a.drawDate.localeCompare(b.drawDate)),
    [getReservationsForNumber, subscriptionId]
  );

  if (!subscription) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Dar de baja este abono" subtitle="Abono no encontrado" backTo="/profile/subscriptions?tab=numbers" />
        <div className="p-4">
          <Button className="w-full rounded-xl bg-manises-blue text-white" onClick={() => navigate('/profile/subscriptions?tab=numbers')}>
            Volver a mis números abonados
          </Button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    cancelSubscription(subscription.id);
    navigate(`/profile/subscriptions/${subscription.id}/cancelled`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-8">
      <ProfileSubHeader title="Dar de baja este abono" subtitle={`Número ${subscription.number}`} backTo={`/profile/subscriptions/${subscription.id}`} />

      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-[1.45rem] border border-red-100 bg-red-50 p-3.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h2 className="text-lg font-black text-red-700">¿Dar de baja este abono?</h2>
              <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-red-700/80">
                A partir de este momento, este número dejará de estar reservado en todos sus sorteos.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Detalles del abono</p>
          <h3 className="mt-2 font-mono text-[1.9rem] font-black tracking-[0.16em] text-manises-blue">{subscription.number}</h3>
          <p className="mt-1 text-[10px] font-semibold text-slate-500">
            {subscription.quantity} {subscription.quantity === 1 ? 'décimo por sorteo' : 'décimos por sorteo'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subscription.drawTypes.map((drawType) => (
              <span key={drawType} className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-manises-blue/70">
                {drawType}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <p className="text-sm font-black text-manises-blue">¿Qué ocurrirá al dar de baja este abono?</p>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                Este número dejará de estar reservado en todos los sorteos, incluidos los que ya estaban pendientes de pago.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                El número desaparecerá del apartado “Pendientes de pago” y dejará de participar en futuros sorteos.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/70" />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                Si más adelante quieres volver a disponer de este número, tendrás que solicitar un nuevo abono sujeto a disponibilidad.
              </p>
            </div>
          </div>
        </section>

        {reservations.length > 0 && (
          <section className="rounded-[1.45rem] border border-amber-100 bg-amber-50 p-3.5">
            <p className="text-[10px] font-black text-amber-700">También se darán de baja los sorteos ya reservados</p>
            <div className="mt-2 space-y-1">
              {reservations.map((reservation) => (
                <p key={reservation.id} className="text-[9px] font-semibold text-amber-700/80">
                  {reservation.drawLabel} · {formatDate(reservation.drawDate)}
                </p>
              ))}
            </div>
          </section>
        )}

        <Button
          className="h-12 w-full rounded-xl bg-red-600 text-[11px] font-black uppercase tracking-wider text-white"
          onClick={handleCancel}
        >
          Sí, dar de baja este abono
        </Button>

        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border-manises-blue/20 text-[11px] font-black uppercase tracking-wider text-manises-blue"
          onClick={() => navigate(`/profile/subscriptions/${subscription.id}`)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
