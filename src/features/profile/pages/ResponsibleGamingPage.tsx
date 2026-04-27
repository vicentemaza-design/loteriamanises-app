import { useRef } from 'react';
import { ShieldCheck, Timer, Ban, Wallet, Info, AlertTriangle, ChevronRight, Scale } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function ResponsibleGamingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.gaming-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      duration: 0.6
    });
  }, { scope: containerRef });

  const handleAction = (title: string) => {
    toast.info(`${title}: Demo · Los límites no se aplican realmente en esta fase.`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader 
        title="Control de Juego" 
        subtitle="Juego Responsable y Límites" 
      />

      <div className="p-5 flex flex-col gap-6">
        {/* Banner Informativo */}
        <section className="gaming-item">
          <div className="bg-emerald-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-100">Compromiso Social</h3>
              </div>
              <h4 className="text-lg font-black leading-tight">Juega con responsabilidad</h4>
              <p className="mt-2 text-[11px] text-emerald-50/70 leading-relaxed font-medium">
                El juego debe ser una forma de entretenimiento. Ponemos a tu disposición herramientas para mantener el control en todo momento.
              </p>
            </div>
          </div>
        </section>

        {/* Límites de Gasto */}
        <section className="space-y-3 gaming-item">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Límites de actividad</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <PremiumMetricPill label="Límite Diario" value="600,00 €" tone="blue" />
            <PremiumMetricPill label="Límite Mensual" value="2.000,00 €" tone="gold" />
          </div>
          
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            <PremiumActionRow
              icon={Wallet}
              title="Modificar límites"
              description="Aumentar o disminuir topes de depósito"
              tone="blue"
              onClick={() => handleAction('Modificar límites')}
              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
            />
            <PremiumActionRow
              icon={Timer}
              title="Límite de Sesión"
              description="Tiempo máximo de conexión por día"
              tone="violet"
              onClick={() => handleAction('Límite de Sesión')}
              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
            />
          </div>
        </section>

        {/* Autoexclusión */}
        <section className="space-y-3 gaming-item">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Medidas de protección</p>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            <PremiumActionRow
              icon={Ban}
              title="Autoexclusión Temporal"
              description="Pausa tu cuenta de 24h a 3 meses"
              tone="violet"
              onClick={() => handleAction('Autoexclusión Temporal')}
              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
            />
            <PremiumActionRow
              icon={AlertTriangle}
              title="Autoexclusión Indefinida"
              description="Baja definitiva del servicio de juego"
              tone="default"
              onClick={() => handleAction('Autoexclusión Indefinida')}
              trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
            />
          </div>
        </section>

        {/* Footer Demo */}
        <section className="gaming-item space-y-4">
          <div className="flex flex-col items-center gap-1 opacity-40">
            <p className="text-[9px] font-black text-manises-blue uppercase tracking-widest text-center leading-relaxed">
              Demo · Funciones de control pendientes de integración
            </p>
            <p className="text-[8px] font-bold text-manises-blue uppercase tracking-[0.2em] text-center">
              Los límites configurados no afectarán a tu operativa real
            </p>
          </div>
          
          <div className="flex justify-center gap-4 opacity-50">
             <div className="w-8 h-8 rounded-full border border-manises-blue flex items-center justify-center text-[10px] font-black text-manises-blue">+18</div>
             <div className="px-3 h-8 rounded-full border border-manises-blue flex items-center justify-center text-[9px] font-black text-manises-blue uppercase tracking-widest">DGOJ</div>
          </div>
        </section>
      </div>
    </div>
  );
}
