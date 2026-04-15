import { ArrowDownLeft, ArrowUpRight, Trophy, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function MovementsPage() {
  const movements = premiumDemoData.walletMovements;
  const deposits = movements.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
  const prizes = movements.filter((item) => item.type === 'prize').reduce((sum, item) => sum + item.amount, 0);

  const getIcon = (type: 'deposit' | 'bet' | 'prize') => {
    if (type === 'deposit') return ArrowDownLeft;
    if (type === 'prize') return Trophy;
    return ArrowUpRight;
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-nav-safe">
      <ProfileSubHeader title="Movimientos" />
      <div className="flex flex-col gap-4 p-5">
        <PremiumSectionCard
          eyebrow="Finanzas"
          title="Libro de movimientos del cliente"
          description="Vista pensada para backend de wallet, premios, compras y conciliacion."
        >
          <div className="grid grid-cols-2 gap-3">
            <PremiumMetricPill label="Ingresado" value={formatCurrency(deposits)} tone="blue" />
            <PremiumMetricPill label="Premios" value={formatCurrency(prizes)} tone="gold" />
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Timeline"
          title="Actividad reciente"
          description="Cada movimiento deberia enlazar con ticket, premio, recarga o retirada."
        >
          <div className="flex flex-col gap-3">
            {movements.map((movement) => {
              const Icon = getIcon(movement.type);
              return (
                <PremiumActionRow
                  key={movement.id}
                  icon={Icon}
                  title={movement.description}
                  description={`${formatDate(movement.createdAt)} · ${movement.type}`}
                  trailing={
                    <span className="text-sm font-black text-manises-blue">
                      {movement.amount > 0 ? '+' : ''}
                      {formatCurrency(movement.amount)}
                    </span>
                  }
                />
              );
            })}
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard
          eyebrow="Backend"
          title="Modelo recomendado"
          description="wallet_movement { type, amount, sourceId, sourceType, balanceAfter, createdAt }"
        >
          <PremiumActionRow
            icon={Wallet}
            title="Conciliacion y trazabilidad"
            description="Clave para soporte, devoluciones, cobros fallidos, premios y auditoria financiera."
          />
        </PremiumSectionCard>
      </div>
    </div>
  );
}
