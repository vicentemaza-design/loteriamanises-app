import type { ElementType } from 'react';
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
      <ProfileSubHeader title="Mis Abonos" subtitle={`${activeCount} activos`} />
      <div className="flex flex-col gap-5 p-4">
        
        {/* Subtle Intro */}
        <div className="px-1 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suscripciones activas</p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Gestión de renovaciones automáticas y cargos programados.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {subscriptions.map((subscription) => (
            <PremiumSectionCard
              key={subscription.id}
              eyebrow={subscription.status === 'active' ? 'Activo' : 'En pausa'}
              title={subscription.title}
              description={subscription.cadence}
              tone={subscription.status === 'active' ? 'blue' : 'violet'}
            >
              <div className="grid grid-cols-2 gap-3 mb-3">
                <PremiumMetricPill label="Próximo cargo" value={subscription.nextChargeLabel} tone="blue" icon={<CalendarClock className="w-3.5 h-3.5" />} />
                <PremiumMetricPill label="Importe" value={subscription.amountLabel} tone="gold" />
              </div>

              <div className="flex flex-col bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                <PremiumActionRow
                  icon={RefreshCcw}
                  title="Modificar configuración"
                  description="Cantidades, frecuencia o juego"
                  tone="blue"
                  onClick={() => undefined}
                />
                <div className="h-px bg-border/40 mx-3" />
                <PremiumActionRow
                  icon={subscription.status === 'active' ? PauseCircle : Rocket}
                  title={subscription.status === 'active' ? 'Pausar abono' : 'Reactivar abono'}
                  description={subscription.status === 'active' ? 'Detener renovaciones temporalmente' : 'Retomar jugadas semanales'}
                  tone={subscription.status === 'active' ? 'violet' : 'gold'}
                  badge={subscription.status === 'active' ? 'Control' : 'Activar'}
                  onClick={() => undefined}
                />
              </div>
            </PremiumSectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
