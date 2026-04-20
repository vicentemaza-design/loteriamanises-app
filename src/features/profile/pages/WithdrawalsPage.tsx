import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, ChevronRight, Landmark, ShieldAlert, ShieldCheck, Trophy, WalletCards } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';

export function WithdrawalsPage() {
  const navigate = useNavigate();
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

        {/* Info Contextual — Enlace a Ayuda */}
        <button
          onClick={() => navigate('/profile/help')}
          className="mt-2 group flex items-center justify-between p-4 rounded-2xl border border-manises-blue/10 bg-manises-blue/5 hover:bg-manises-blue/10 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-manises-blue/10 text-manises-blue">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-manises-blue">Guía de pago de premios</p>
              <p className="text-[10px] text-muted-foreground font-medium">Plazos, fiscalidad y seguridad oficial</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-manises-blue group-hover:translate-x-0.5 transition-transform" />
        </button>

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
