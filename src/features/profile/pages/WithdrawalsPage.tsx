import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Landmark, ShieldAlert, ShieldCheck, Trophy, WalletCards, Shield } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { toast } from 'sonner';

export function WithdrawalsPage() {
  const navigate = useNavigate();
  const withdrawals = premiumDemoData.withdrawals;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Cobrar Premios" subtitle="Retiradas de saldo" />
      <div className="flex flex-col gap-5 p-4">
        
        {/* Subtle Header Premium */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-manises-blue/40 uppercase tracking-[0.2em]">Saldo premiado</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-emerald-600 tracking-tight tabular-nums">
                128,00 €
              </p>
              <span className="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest animate-pulse">Disponible</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
            <Trophy className="w-5 h-5 text-emerald-600/60" />
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
                  <div className="flex flex-col bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 mt-2">
                    <PremiumActionRow
                      icon={isReady ? WalletCards : ShieldAlert}
                      title="Método de cobro"
                      description={withdrawal.methodLabel}
                      tone={isReady ? 'emerald' : 'gold'}
                    />
                    <div className="h-px bg-slate-100 mx-3" />
                    <PremiumActionRow
                      icon={isReady ? Landmark : BadgeCheck}
                      title={isReady ? 'Solicitar transferencia' : 'Estado de verificación'}
                      description={isReady ? 'Se procesará en menos de 24h' : 'Tu documentación está siendo validada'}
                      tone={isReady ? 'blue' : 'emerald'}
                      badge={isReady ? 'Acción' : 'Info'}
                      onClick={() => toast.info(isReady ? 'Solicitud de cobro: Demo · Pendiente de integración' : 'Estado de revisión: Demo Mode')}
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
              <p className="text-[10px] text-muted-foreground font-medium">Plazos, fiscalidad y seguridad informativa</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-manises-blue group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Security / Compliance Note Premium */}
        <div className="px-1 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-manises-blue/5 border border-manises-blue/10">
            <Shield className="w-5 h-5 text-manises-blue shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest leading-none">Seguridad Informativa</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                Cobro de premios pendiente de integración en fase real. No se realizará ninguna retirada de fondos en esta demo. Contenido orientativo.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-30">
            <p className="text-[9px] font-black text-manises-blue uppercase tracking-widest">
              Demo · No se procesará pago real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
