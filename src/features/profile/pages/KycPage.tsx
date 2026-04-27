import { useRef } from 'react';
import { ShieldCheck, CreditCard, Camera, Clock } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function KycPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.kyc-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      duration: 0.6
    });
  }, { scope: containerRef });

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader 
        title="Verificación" 
        subtitle="Identidad y Seguridad" 
      />

      <div className="p-5 flex flex-col gap-6">
        {/* Status Card */}
        <section className="kyc-item">
          <div className="bg-manises-blue rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-manises-gold/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Clock className="w-6 h-6 text-manises-gold" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Estado actual</p>
                <h3 className="text-xl font-black text-white">Demo pendiente</h3>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-white/60 leading-relaxed font-medium">
              Demo · verificación pendiente de integración. Este flujo no valida identidad ni habilita retiradas o límites reales.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-4 kyc-item">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest">Pasos Requeridos</h3>
            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">0 / 3</span>
          </div>

          <div className="grid gap-3">
            <PremiumSectionCard
              title="DNI / NIE"
              eyebrow="Paso 1"
              description="Vista previa del futuro flujo documental. No permite subir DNI/NIE real en esta fase."
              tone="blue"
            >
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={() => toast.info('Demo · No se puede subir el frontal en esta fase')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                >
                  <CreditCard className="w-6 h-6 text-slate-300 group-hover:text-manises-blue transition-colors mb-2" />
                  <p className="text-[9px] font-black text-slate-400 uppercase">Frontal</p>
                </button>
                <button 
                  onClick={() => toast.info('Demo · No se puede subir el reverso en esta fase')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                >
                  <CreditCard className="w-6 h-6 text-slate-300 group-hover:text-manises-blue transition-colors mb-2" />
                  <p className="text-[9px] font-black text-slate-400 uppercase">Reverso</p>
                </button>
              </div>
            </PremiumSectionCard>

            <PremiumSectionCard
              title="Verificación Facial"
              eyebrow="Paso 2"
              description="Vista previa del futuro control facial. No abre cámara ni procesa selfies reales."
              tone="gold"
            >
              <button 
                onClick={() => toast.info('Demo · Acceso a cámara desactivado')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-manises-gold/10 border border-manises-gold/20 hover:bg-manises-gold/20 transition-all group mt-2"
              >
                <Camera className="w-5 h-5 text-manises-blue" />
                <p className="text-[11px] font-black text-manises-blue uppercase tracking-widest">Selfie demo</p>
              </button>
            </PremiumSectionCard>
          </div>
        </section>

        {/* Info / Compliance */}
        <section className="space-y-4 kyc-item">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Privacidad en demo</p>
              <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
                No se envían documentos, selfies ni datos KYC a ningún servicio externo desde esta pantalla mock.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 opacity-40">
            <p className="text-[9px] font-black text-manises-blue uppercase tracking-widest">
              Demo · Verificación pendiente de integración
            </p>
            <p className="text-[8px] font-bold text-manises-blue uppercase tracking-[0.2em] text-center">
              No subas documentos reales en esta versión de pruebas
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
