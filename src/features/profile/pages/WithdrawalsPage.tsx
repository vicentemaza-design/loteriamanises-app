import { BadgeCheck, Landmark, ShieldAlert, WalletCards } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function WithdrawalsPage() {
  const withdrawals = premiumDemoData.withdrawals;

  return (
    <div className="flex min-h-full flex-col bg-background pb-nav-safe">
      <ProfileSubHeader title="Cobrar Premios" />
      <div className="flex flex-col gap-4 p-5">
        <PremiumSectionCard
          eyebrow="Payout"
          title="Centro de retirada y verificacion"
          description="Una pieza premium clara: saldo premiado, estado KYC y metodo de cobro en un solo lugar."
        >
          <div className="grid grid-cols-2 gap-3">
            <PremiumMetricPill label="Disponible" value="128,00 EUR" tone="gold" />
            <PremiumMetricPill label="KYC" value="Parcialmente verificado" tone="blue" />
          </div>
        </PremiumSectionCard>

        {withdrawals.map((withdrawal) => (
          <PremiumSectionCard
            key={withdrawal.id}
            eyebrow={withdrawal.status}
            title={withdrawal.amountLabel}
            description={withdrawal.note}
          >
            <div className="flex flex-col gap-3">
              <PremiumActionRow
                icon={withdrawal.status === 'ready' ? WalletCards : ShieldAlert}
                title="Metodo de cobro"
                description={withdrawal.methodLabel}
              />
              <PremiumActionRow
                icon={withdrawal.status === 'verified' ? BadgeCheck : Landmark}
                title="Accion operativa"
                description={
                  withdrawal.status === 'ready'
                    ? 'Solicitar transferencia ahora'
                    : withdrawal.status === 'pending-review'
                      ? 'Completar documentacion y titularidad'
                      : 'Cuenta lista para pagos instantaneos'
                }
              />
            </div>
          </PremiumSectionCard>
        ))}
      </div>
    </div>
  );
}
