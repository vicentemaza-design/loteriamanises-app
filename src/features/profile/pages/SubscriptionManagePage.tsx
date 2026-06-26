import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CalendarDays, ChevronRight, PencilLine, Power, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { cn, formatDate } from '@/shared/lib/utils';

export function SubscriptionManagePage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getNumberById, getReservationsForNumber, getUpcomingReservation, reactivateSubscription } = useSubscriptions();

  const subscription = getNumberById(subscriptionId);
  const reservations = useMemo(
    () => getReservationsForNumber(subscriptionId).sort((a, b) => a.drawDate.localeCompare(b.drawDate)),
    [getReservationsForNumber, subscriptionId]
  );
  const nextReservation = getUpcomingReservation(subscriptionId);
  const reservationsCount = reservations.length;

  if (!subscription) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Gestión del número" subtitle="Abono no encontrado" backTo="/profile/subscriptions?tab=numbers" />
        <div className="p-4">
          <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-black text-manises-blue">No hemos encontrado este abono.</p>
            <Button className="mt-4 w-full rounded-xl bg-manises-blue text-white" onClick={() => navigate('/profile/subscriptions?tab=numbers')}>
              Volver a mis números abonados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleReactivate = () => {
    reactivateSubscription(subscription.id);
    toast.success(`Reserva preferente del ${subscription.number} reactivada en demo.`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-8">
      <ProfileSubHeader title="Gestión del número" subtitle={`Número ${subscription.number}`} backTo="/profile/subscriptions?tab=numbers" />

      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-[1.9rem] font-black tracking-[0.16em] text-manises-blue">{subscription.number}</h2>
                <span className={cn(
                  'rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider',
                  subscription.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                {subscription.quantity} {subscription.quantity === 1 ? 'décimo por sorteo' : 'décimos por sorteo'}
              </p>

              <div className="mt-1.5 flex flex-wrap gap-1">
                {subscription.drawTypes.map((drawType) => (
                  <span key={drawType} className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-manises-blue/70">
                    {drawType}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Próximo sorteo</p>
              <p className="mt-1 text-[10px] font-semibold text-manises-blue">
                {nextReservation ? formatDate(nextReservation.drawDate) : 'Sin reservas'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Pendientes</p>
              <p className="mt-1 text-[10px] font-semibold text-manises-blue">
                {reservationsCount} {reservationsCount === 1 ? 'sorteo' : 'sorteos'}
              </p>
            </div>
          </div>
        </section>

        {subscription.status === 'inactive' ? (
          <section className="rounded-[1.45rem] border border-red-100 bg-red-50 p-3.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-[11px] font-black text-red-700">Este número ya no está reservado para futuros sorteos.</p>
                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-red-700/80">
                  Puedes volver a activarlo en esta demo si quieres recuperar nuevas reservas futuras.
                </p>
              </div>
            </div>

            <Button className="mt-3 h-11 w-full rounded-xl bg-manises-blue text-[10px] font-black uppercase tracking-wider text-white" onClick={handleReactivate}>
              <RefreshCcw className="h-4 w-4" />
              Volver a activar abono
            </Button>
          </section>
        ) : (
          <>
            <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Décimos por sorteo</p>
                  <p className="mt-1 text-2xl font-black text-manises-blue">{subscription.quantity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/profile/subscriptions/${subscription.id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-xl border border-manises-blue/10 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-wider text-manises-blue"
                >
                  <PencilLine className="h-4 w-4" />
                  Modificar
                </button>
              </div>
              <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-500">
                Los cambios se aplicarán a partir del próximo sorteo reservado.
              </p>
            </section>

            <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-manises-blue/70" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Sorteos en los que participa</p>
                  <p className="text-[10px] font-semibold text-slate-500">Reserva activa por modalidad</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {subscription.drawTypes.map((drawType) => {
                  const pendingForType = reservations.filter((item) => item.drawType === drawType).length;
                  return (
                    <div key={drawType} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-black text-manises-blue">{drawType}</p>
                        <p className="text-[10px] font-semibold text-slate-400">
                          {pendingForType} {pendingForType === 1 ? 'sorteo pendiente' : 'sorteos pendientes'}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                        Activo
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Próximos sorteos reservados</p>
              {reservations.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {reservations.slice(0, 4).map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <div>
                        <p className="text-[11px] font-black text-manises-blue">{reservation.drawLabel}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{formatDate(reservation.drawDate)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-semibold text-slate-500">Ahora mismo no hay sorteos reservados para este número.</p>
                </div>
              )}
            </section>
          </>
        )}

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/profile/subscriptions')}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-black text-manises-blue">Ver sorteos pendientes</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                {reservationsCount} {reservationsCount === 1 ? 'pendiente' : 'pendientes'} en este número
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </button>
        </section>

        {subscription.status === 'active' && (
          <button
            type="button"
            onClick={() => navigate(`/profile/subscriptions/${subscription.id}/cancel`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-red-700"
          >
            <Power className="h-4 w-4" />
            Dar de baja este abono
          </button>
        )}
      </div>
    </div>
  );
}
