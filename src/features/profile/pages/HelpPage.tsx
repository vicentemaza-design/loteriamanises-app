import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Ban, 
  Timer, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  Info,
  Scale,
  HelpCircle,
  PhoneCall,
  Mail,
  MapPin,
  Trophy,
  Users,
  FileText
} from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import adminFacade from '@/assets/images/administracion_manises.webp';

gsap.registerPlugin(useGSAP);

const officialLinks = {
  whoWeAre: 'https://www.loteriamanises.com/Web_2_0/quienes-somos/',
  prizes: 'https://www.loteriamanises.com/Web_2_0/premios-y-pagos/',
  faq: 'https://www.loteriamanises.com/Web_2_0/faqs/',
  responsibleGaming: 'https://www.loteriamanises.com/Web_2_0/juego-responsable/',
  legalNotice: 'https://www.loteriamanises.com/Web_2_0/aviso-legal/',
  privacy: 'https://www.loteriamanises.com/Web_2_0/Web/General/General_PoliticaPrivacidad.aspx',
  conditions: 'https://www.loteriamanises.com/Web_2_0/Web/General/General_Condiciones_Generales.aspx',
  maps: 'https://maps.google.com/?q=Avda.%20dels%20Tramvies%2012%2046940%20Manises%20Valencia',
} as const;

export function HelpPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'control' | 'legal' | 'faq'>('control');

  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>('.stagger-item');
    gsap.set(items, { y: 12, autoAlpha: 0 });
    gsap.to(items, {
      y: 0,
      autoAlpha: 1,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, { scope: containerRef, dependencies: [activeTab] });

  const handleAction = (title: string) => {
    toast.info(`${title}: Funcionalidad preparada. Contacte con soporte para procesar su solicitud.`);
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader 
        title="Ayuda y Compliance" 
        subtitle="Juego responsable y soporte oficial"
      />

      <div className="p-5 flex flex-col gap-5">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-manises-blue text-white shadow-xl stagger-item">
          <img src={adminFacade} alt="Administración Manises" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,25,47,0.9)_0%,rgba(10,25,47,0.6)_100%)]" />
          <div className="relative p-6 flex flex-col gap-2">
            <h3 className="text-lg font-black leading-tight uppercase tracking-tight">Compromiso con el usuario</h3>
            <p className="text-[12px] font-medium text-white/80 leading-relaxed">
              Resumen oficial adaptado para consultar trayectoria, premios, ayuda y herramientas de control.
            </p>
          </div>
        </section>

        {/* Tabs de navegación rápida */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl stagger-item">
          {(['control', 'legal', 'faq'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-manises-blue shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'control' ? 'Control' : tab === 'legal' ? 'Legal' : 'Ayuda'}
            </button>
          ))}
        </div>

        {activeTab === 'control' && (
          <>
            <section className="space-y-3 stagger-item">
              <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Herramientas de Juego Responsable</p>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
                <PremiumActionRow
                  icon={Timer}
                  title="Límite de Gasto"
                  description="Configura cuánto quieres gastar al mes"
                  tone="blue"
                  onClick={() => handleAction('Límite de Gasto')}
                  trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
                />
                <PremiumActionRow
                  icon={Ban}
                  title="Autoexclusión"
                  description="Suspende tu cuenta temporalmente"
                  tone="violet"
                  onClick={() => handleAction('Autoexclusión')}
                  trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
                />
              </div>
            </section>

            <section className="stagger-item">
              <PremiumSectionCard
                title="Pautas de seguridad"
                description="El juego debe ser ocio. Márcate un presupuesto, no intentes recuperar pérdidas y pide ayuda si lo necesitas."
                tone="emerald"
              >
                <Button 
                  variant="ghost" 
                  className="mt-2 h-9 px-0 text-[11px] font-black text-emerald-700 uppercase tracking-widest gap-2"
                  onClick={() => openExternal(officialLinks.responsibleGaming)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Guía oficial completa
                </Button>
              </PremiumSectionCard>
            </section>
          </>
        )}

        {activeTab === 'legal' && (
          <section className="space-y-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Documentación Legal</p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <Scale className="w-5 h-5 text-manises-blue/40" />
                  <span className="text-[9px] font-black bg-white px-2 py-1 rounded-full border border-border">Oficial</span>
                </div>
                <h4 className="text-[13px] font-black text-manises-blue">Aviso Legal y Privacidad</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  LOTERÍA MANISES, S.L. garantiza el tratamiento seguro de sus datos según el RGPD.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <PremiumActionRow
                    icon={ExternalLink}
                    title="Aviso Legal"
                    onClick={() => openExternal(officialLinks.legalNotice)}
                    className="px-0 h-10"
                  />
                  <PremiumActionRow
                    icon={ExternalLink}
                    title="Política de Privacidad"
                    onClick={() => openExternal(officialLinks.privacy)}
                    className="px-0 h-10"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-5 h-5 text-manises-blue/40" />
                </div>
                <h4 className="text-[13px] font-black text-manises-blue">Condiciones de Gestión</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Información sobre la custodia de décimos, plazos de cobro y fiscalidad de premios.
                </p>
                <PremiumActionRow
                  icon={Trophy}
                  title="Premios y Pagos"
                  onClick={() => openExternal(officialLinks.prizes)}
                  className="px-0 mt-3"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'faq' && (
          <section className="space-y-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Preguntas Frecuentes</p>
            <div className="flex flex-col gap-2">
              {[
                { q: '¿Cómo sé si tengo premio?', a: 'Te avisamos por email tras el escrutinio oficial.' },
                { q: '¿Es seguro el pago?', a: 'Usamos pasarelas CES (Comercio Electrónico Seguro).' },
                { q: '¿Tengo que recoger el décimo?', a: 'No, queda custodiado en la administración.' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border/60 bg-muted/20">
                  <p className="text-[12px] font-black text-manises-blue">{item.q}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.a}</p>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-[10px] font-black uppercase tracking-widest mt-2"
                onClick={() => openExternal(officialLinks.faq)}
              >
                Ver todas las dudas oficiales
              </Button>
            </div>
          </section>
        )}

        {/* Bloque de Contacto (Siempre visible al final) */}
        <section className="stagger-item space-y-3 mt-2">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Soporte Directo</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => window.open('tel:960992556')}
              className="flex flex-col items-center p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[11px] font-bold text-blue-900">Llamar</p>
              <p className="text-[9px] text-blue-600/70">960 992 556</p>
            </button>
            <button 
              onClick={() => window.open('mailto:info@loteriamanises.com')}
              className="flex flex-col items-center p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[11px] font-bold text-blue-900">Email</p>
              <p className="text-[9px] text-blue-600/70">Soporte 24/7</p>
            </button>
          </div>
        </section>

        <div className="stagger-item mt-4 opacity-50 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-manises-blue" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-manises-blue">+18 · JUEGO RESPONSABLE</p>
          </div>
          <p className="text-[8px] font-medium text-center max-w-[15rem]">
            Administración nº 3 de Manises · Receptor Oficial 81980
          </p>
        </div>
      </div>
    </div>
  );
}
