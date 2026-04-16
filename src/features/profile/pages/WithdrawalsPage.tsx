import type { ElementType } from 'react';
import { BadgeCheck, CheckCircle2, Landmark, ShieldAlert, ShieldCheck, WalletCards } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function WithdrawalsPage() {
  const withdrawals = premiumDemoData.withdrawals;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Cobrar Premios" subtitle="Retiradas de saldo" />
      <div className="flex flex-col gap-5 p-4">
        
        {/* Subtle Header */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo premiado</p>
            <p className="text-[1.2rem] font-black text-manises-blue tracking-tight">
              128,00 €
              <span className="ml-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Disponible</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600/60" />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <PremiumMetricPill label="Verificación" value="Completa" tone="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />} />
          <PremiumMetricPill label="Última solicitud" value="Hace 2 días" tone="blue" />
        </div>

        <section className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Retiradas recientes</p>
          <div className="flex flex-col gap-4">
            {withdrawals.map((withdrawal) => {
              const isReady = withdrawal.status === 'ready';
              const isPending = withdrawal.status === 'pending-review';
              
              return (
                <PremiumSectionCard
                  key={withdrawal.id}
                  eyebrow={isReady ? 'Disponible' : isPending ? 'En revisión' : 'Procesado'}
                  title={withdrawal.amountLabel}
                  description={withdrawal.note}
                  tone={isReady ? 'emerald' : isPending ? 'gold' : 'blue'}
                >
                  <div className="flex flex-col bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                    <PremiumActionRow
                      icon={isReady ? WalletCards : ShieldAlert}
                      title="Método de cobro"
                      description={withdrawal.methodLabel}
                      tone={isReady ? 'emerald' : 'gold'}
                    />
                    <div className="h-px bg-border/40 mx-3" />
                    <PremiumActionRow
                      icon={isReady ? Landmark : BadgeCheck}
                      title={isReady ? 'Solicitar transferencia' : 'Estado de verificación'}
                      description={isReady ? 'Se procesará en menos de 24h' : 'Tu documentación está siendo validada'}
                      tone={isReady ? 'blue' : 'emerald'}
                      badge={isReady ? 'Acción' : 'Info'}
                      onClick={() => undefined}
                    />
                  </div>
                </PremiumSectionCard>
              );
            })}
          </div>
        </section>

        {/* Security / Compliance Note */}
        <div className="px-1 flex items-start gap-2.5 opacity-60">
          <ShieldCheck className="w-4 h-4 text-manises-blue mt-0.5" />
          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
            Todas las operaciones se realizan bajo protocolos de seguridad SSL y cumplimiento de la normativa DGOJ.
          </p>
        </div>
      </div>
    </div>
  );
}
