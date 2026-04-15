import { CalendarClock, PauseCircle, RefreshCcw, Rocket } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function SubscriptionsPage() {
  const subscriptions = premiumDemoData.subscriptions;
  const activeCount = subscriptions.filter((item) => item.status === 'active').length;

  return (
    <div className="flex min-h-full flex-col bg-background pb-nav-safe">
      <ProfileSubHeader title="Abonos" />
      <div className="flex flex-col gap-4 p-5">
        <PremiumSectionCard
          eyebrow="Recurrencia"
          title="Panel de abonos y renovaciones"
          description="Esta capa deja clara la estructura que backend necesita para renovaciones, pausas y proximo cobro."
        >
          <div className="grid grid-cols-2 gap-3">
            <PremiumMetricPill label="Activos" value={`${activeCount} abonos`} tone="gold" />
            <PremiumMetricPill label="MRR demo" value="22,00 EUR/sem" tone="blue" />
          </div>
        </PremiumSectionCard>

        {subscriptions.map((subscription) => (
          <PremiumSectionCard
            key={subscription.id}
            eyebrow={subscription.status === 'active' ? 'Activo' : 'Pausado'}
            title={subscription.title}
            description={subscription.cadence}
          >
            <div className="grid grid-cols-2 gap-3">
              <PremiumMetricPill label="Proximo cargo" value={subscription.nextChargeLabel} />
              <PremiumMetricPill label="Importe" value={subscription.amountLabel} tone="gold" />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <PremiumActionRow
                icon={RefreshCcw}
                title="Renovar configuracion"
                description="Editar cantidad, frecuencia, juego y metodo de pago asociado."
              />
              <PremiumActionRow
                icon={subscription.status === 'active' ? PauseCircle : Rocket}
                title={subscription.status === 'active' ? 'Pausar abono' : 'Reactivar abono'}
                description="Cambio de estado pensado para control manual o automatico desde backend."
              />
            </div>
          </PremiumSectionCard>
        ))}

        <PremiumSectionCard
          eyebrow="Backend"
          title="Modelo recomendado"
          description="subscription { status, cadence, nextChargeAt, paymentMethodId, picksSnapshot, amount }"
        >
          <PremiumActionRow
            icon={CalendarClock}
            title="Motor de renovacion"
            description="Necesitara cron, reintentos de cobro, historico de renovaciones y trazabilidad de errores."
          />
        </PremiumSectionCard>
      </div>
    </div>
  );
}
