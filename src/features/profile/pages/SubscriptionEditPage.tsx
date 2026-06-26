import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { type SubscriptionDrawType } from '@/features/profile/data/subscriptionsDemo';
import { cn } from '@/shared/lib/utils';

const DRAW_TYPE_OPTIONS: SubscriptionDrawType[] = ['JUE', 'SÁB', 'NAV', 'NIÑ'];

export function SubscriptionEditPage() {
  const navigate = useNavigate();
  const { subscriptionId = '' } = useParams();
  const { getNumberById, saveNumberConfiguration } = useSubscriptions();
  const subscription = getNumberById(subscriptionId);
  const [quantity, setQuantity] = useState(1);
  const [drawTypes, setDrawTypes] = useState<SubscriptionDrawType[]>([]);

  useEffect(() => {
    if (!subscription) {
      return;
    }
    setQuantity(subscription.quantity);
    setDrawTypes(subscription.drawTypes);
  }, [subscription]);

  if (!subscription) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ProfileSubHeader title="Modificar abono" subtitle="Abono no encontrado" backTo="/profile/subscriptions?tab=numbers" />
        <div className="p-4">
          <Button className="w-full rounded-xl bg-manises-blue text-white" onClick={() => navigate('/profile/subscriptions?tab=numbers')}>
            Volver a mis números abonados
          </Button>
        </div>
      </div>
    );
  }

  const toggleDrawType = (drawType: SubscriptionDrawType) => {
    setDrawTypes((current) => (
      current.includes(drawType)
        ? current.filter((item) => item !== drawType)
        : [...current, drawType]
    ));
  };

  const handleSave = () => {
    saveNumberConfiguration(subscription.id, quantity, drawTypes);
    toast.success(`Configuración del ${subscription.number} actualizada en demo.`);
    navigate(`/profile/subscriptions/${subscription.id}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-8">
      <ProfileSubHeader title="Modificar abono" subtitle={`Número ${subscription.number}`} backTo={`/profile/subscriptions/${subscription.id}`} />

      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <h2 className="font-mono text-[1.9rem] font-black tracking-[0.16em] text-manises-blue">{subscription.number}</h2>
          <p className="mt-1 text-[10px] font-semibold text-slate-500">
            Los cambios se aplicarán a partir del próximo sorteo reservado.
          </p>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">1. Décimos por sorteo</p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="text-3xl font-black text-manises-blue">{quantity}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">décimos por sorteo</p>
            </div>

            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(20, current + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-manises-blue"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">2. Sorteos en los que participa</p>
          <div className="mt-3 space-y-2">
            {DRAW_TYPE_OPTIONS.map((drawType) => {
              const active = drawTypes.includes(drawType);
              return (
                <button
                  key={drawType}
                  type="button"
                  onClick={() => toggleDrawType(drawType)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all',
                    active ? 'border-manises-blue bg-manises-blue/[0.04]' : 'border-slate-100 bg-white'
                  )}
                >
                  <div>
                    <p className="text-sm font-black text-manises-blue">{drawType}</p>
                    <p className="text-[9px] font-semibold text-slate-400">
                      {active ? 'Participará en futuros sorteos' : 'No reservado en este momento'}
                    </p>
                  </div>
                  <span className={cn(
                    'rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider',
                    active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {active ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/70" />
            <div className="text-[10px] font-semibold leading-relaxed text-slate-500">
              Si desactivas un sorteo, sus reservas pendientes dejarán de aparecer en “Pendientes de pago”.
            </div>
          </div>
        </section>

        <Button
          className="h-12 w-full rounded-xl bg-manises-blue text-[11px] font-black uppercase tracking-wider text-white"
          onClick={handleSave}
        >
          Guardar cambios
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
