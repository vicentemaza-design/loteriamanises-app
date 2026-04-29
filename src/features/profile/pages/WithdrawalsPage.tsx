import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Landmark, ShieldAlert, ShieldCheck, Trophy, WalletCards, Shield, Plus } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { premiumDemoData } from '@/features/profile/data/premium-demo';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';

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
              <p className="text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
                128,00 €
              </p>
              <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest animate-pulse">Disponible</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
            <Trophy className="w-6 h-6 text-emerald-600/60" />
          </div>
        </section>

        {/* New Withdrawal Form Section */}
        <section className="space-y-4">
          <PremiumSectionCard
            title="Solicitar Retirada"
            eyebrow="Operativa demo"
            description="Transfiere tus premios a tu cuenta bancaria de forma sencilla."
            tone="emerald"
          >
            <div className="space-y-4 mt-2">
              {/* Importe a retirar */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Importe a retirar</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue font-black text-lg">€</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    defaultValue="128.00"
                    className="w-full h-14 pl-9 pr-4 rounded-2xl border-2 border-manises-blue/10 bg-slate-50 text-manises-blue font-black text-xl outline-none focus:border-manises-blue focus:bg-white transition-all tabular-nums"
                  />
                </div>
              </div>

              {/* Cuenta bancaria */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Cuenta de destino</p>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-manises-blue bg-blue-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-manises-blue text-white flex items-center justify-center">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-manises-blue">ES12 **** 7890</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Sabadell · Cuenta Principal</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-manises-blue flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-manises-blue" />
                    </div>
                  </button>

                  <button 
                    onClick={() => toast.info('Demo: Formulario de nueva cuenta')}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Añadir nueva cuenta</p>
                  </button>
                </div>
              </div>

              <div className="bg-manises-blue/5 rounded-2xl p-3 border border-manises-blue/10">
                <p className="text-[10px] font-bold text-manises-blue/60 uppercase tracking-widest text-center">
                  Demo · No se realizará ninguna retirada real
                </p>
              </div>

              <Button
                onClick={() => toast.success('Solicitud demo enviada con éxito')}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all"
              >
                Solicitar retirada demo
              </Button>
            </div>
          </PremiumSectionCard>
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
