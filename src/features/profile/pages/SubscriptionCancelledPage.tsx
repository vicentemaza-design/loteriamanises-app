import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Info, RefreshCcw } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';

export function SubscriptionCancelledPage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getNumberById, reactivateSubscription } = useSubscriptions();
  const subscription = getNumberById(subscriptionId);

  const handleReactivate = () => {
    if (!subscription) {
      return;
    }
    reactivateSubscription(subscription.id);
    navigate(`/profile/subscriptions/${subscription.id}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-8">
      <ProfileSubHeader title="Baja realizada" subtitle={subscription ? `Número ${subscription.number}` : 'Abono'} backTo="/profile/subscriptions?tab=numbers" />

      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-3 text-xl font-black text-manises-blue">Abono cancelado correctamente</h2>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
            {subscription
              ? `El número ${subscription.number} ha dejado de estar reservado para futuros sorteos.`
              : 'El abono ha dejado de estar reservado para futuros sorteos.'}
          </p>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <p className="text-sm font-black text-manises-blue">Resumen de la baja</p>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/70" />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                Los sorteos pendientes de este número han sido retirados del apartado “Pendientes de pago”.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/70" />
              <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                Si deseas volver a disponer de este número, deberás solicitar de nuevo el abono y dependerá de la disponibilidad de ese momento.
              </p>
            </div>
          </div>
        </section>

        <Button
          className="h-12 w-full rounded-xl bg-manises-blue text-[11px] font-black uppercase tracking-wider text-white"
          onClick={() => navigate('/profile/subscriptions?tab=numbers')}
        >
          Volver a mis números abonados
        </Button>

        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border-manises-blue/20 text-[11px] font-black uppercase tracking-wider text-manises-blue"
          onClick={() => navigate('/profile/subscriptions')}
        >
          Ir a pendientes de pago
        </Button>

        {subscription && (
          <Button
            variant="ghost"
            className="h-12 w-full rounded-xl text-[11px] font-black uppercase tracking-wider text-manises-blue"
            onClick={handleReactivate}
          >
            <RefreshCcw className="h-4 w-4" />
            Reactivar en demo
          </Button>
        )}
      </div>
    </div>
  );
}
