import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Ban, 
  Timer, 
  AlertTriangle, 
  ChevronRight, 
  FileText,
  Search,
  ExternalLink as ExternalLinkIcon,
  LifeBuoy,
  Scale,
  PhoneCall,
  Mail
} from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
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
        {/* Mock Search Bar */}
        <div className="relative stagger-item">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-manises-blue/40" />
          </div>
          <input 
            type="text" 
            placeholder="¿En qué podemos ayudarte?"
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-manises-blue/10 text-sm font-medium"
            onChange={() => toast.info('Buscador: Demo · Pendiente de integración')}
          />
        </div>

        {/* Banner Hero Premium */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-manises-blue p-7 text-white shadow-xl stagger-item group">
          <img src={adminFacade} alt="Administración Manises" className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-br from-manises-blue/95 via-manises-blue/80 to-transparent" />
          
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <LifeBuoy className="w-5 h-5 text-manises-gold" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-manises-gold">Centro de Ayuda</h3>
            </div>
            <p className="text-[12px] font-medium text-white/80 leading-relaxed max-w-[80%]">
              Tu tranquilidad es nuestra prioridad. Consulta guías oficiales y herramientas de control.
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
                  onClick={() => navigate('/profile/gaming-control')}
                  trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
                />
                <PremiumActionRow
                  icon={Ban}
                  title="Autoexclusión"
                  description="Suspende tu cuenta temporalmente"
                  tone="violet"
                  onClick={() => navigate('/profile/gaming-control')}
                  trailing={<ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
                />
              </div>
            </section>

            <section className="stagger-item">
              <PremiumSectionCard
                title="Pautas de seguridad"
                eyebrow="Educación"
                description="El juego debe ser ocio. Márcate un presupuesto y pide ayuda si lo necesitas."
                tone="emerald"
              >
                <div className="mt-2 space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                    <p className="text-[10px] font-medium text-emerald-800 leading-relaxed italic">
                      "Juega por diversión, no por necesidad. El control es la clave de la victoria."
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-[10px] font-black text-emerald-700 uppercase tracking-widest gap-2 bg-emerald-50 hover:bg-emerald-100/50 rounded-xl transition-all"
                    onClick={() => openExternal(officialLinks.responsibleGaming)}
                  >
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    Guía oficial de seguridad
                  </Button>
                </div>
              </PremiumSectionCard>
            </section>
          </>
        )}

        {activeTab === 'legal' && (
            <section className="space-y-4 stagger-item">
              <PremiumSectionCard
                title="Legal y Privacidad"
                eyebrow="Compliance"
                description="LOTERÍA MANISES garantiza el tratamiento seguro según el RGPD."
                tone="blue"
              >
                <div className="divide-y divide-slate-100 -mx-1">
                  <PremiumActionRow
                    icon={Scale}
                    title="Aviso Legal"
                    description="Identificación y normas de uso"
                    onClick={() => openExternal(officialLinks.legalNotice)}
                  />
                  <PremiumActionRow
                    icon={ShieldCheck}
                    title="Política de Privacidad"
                    description="Gestión de tus datos personales"
                    onClick={() => openExternal(officialLinks.privacy)}
                  />
                  <PremiumActionRow
                    icon={FileText}
                    title="Condiciones de Gestión"
                    description="Custodia y cobro de premios"
                    onClick={() => openExternal(officialLinks.conditions)}
                  />
                </div>
              </PremiumSectionCard>
            </section>
        )}

        {activeTab === 'faq' && (
          <section className="space-y-4 stagger-item">
            <PremiumSectionCard
              title="Preguntas Frecuentes"
              eyebrow="FAQs"
              description="Respuestas rápidas a las dudas más comunes."
              tone="gold"
            >
              <div className="divide-y divide-slate-100 -mx-1">
                {[
                  { q: '¿Cómo sé si tengo premio?', a: 'Te avisamos por email tras el escrutinio.' },
                  { q: '¿Es seguro el pago?', a: 'Usamos pasarelas CES de alta seguridad.' },
                  { q: '¿Tengo que recoger el décimo?', a: 'No, queda custodiado en la administración.' }
                ].map((item, i) => (
                  <div key={i} className="py-3.5 px-3">
                    <p className="text-[11px] font-black text-manises-blue leading-tight mb-1">{item.q}</p>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full h-10 text-[9px] font-black uppercase tracking-widest mt-4 rounded-xl border-slate-200"
                onClick={() => openExternal(officialLinks.faq)}
              >
                Ver todas las dudas oficiales
              </Button>
            </PremiumSectionCard>
          </section>
        )}

        {/* Bloque de Contacto (Siempre visible al final) */}
        {/* Bloque de Contacto Premium */}
        <section className="stagger-item">
          <PremiumSectionCard
            title="Soporte Directo"
            eyebrow="Contacto"
            description="Atención personalizada de Lunes a Sábado."
            tone="violet"
          >
            <div className="grid grid-cols-2 gap-3 mt-1">
              <PremiumTouchInteraction scale={0.96}>
                <button 
                  onClick={() => window.open('tel:960992556')}
                  className="w-full flex flex-col items-center p-4 rounded-2xl border border-violet-100 bg-violet-50/50 hover:bg-violet-50 transition-colors shadow-sm"
                >
                  <div className="p-2.5 rounded-xl bg-white shadow-sm mb-3">
                    <PhoneCall className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-[11px] font-black text-violet-900 uppercase">Llamar</p>
                  <p className="text-[9px] text-violet-600/70 font-bold mt-0.5">960 992 556</p>
                </button>
              </PremiumTouchInteraction>
              <PremiumTouchInteraction scale={0.96}>
                <button 
                  onClick={() => window.open('mailto:info@loteriamanises.com')}
                  className="w-full flex flex-col items-center p-4 rounded-2xl border border-violet-100 bg-violet-50/50 hover:bg-violet-50 transition-colors shadow-sm"
                >
                  <div className="p-2.5 rounded-xl bg-white shadow-sm mb-3">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-[11px] font-black text-violet-900 uppercase">Email</p>
                  <p className="text-[9px] text-violet-600/70 font-bold mt-0.5">Soporte 24h</p>
                </button>
              </PremiumTouchInteraction>
            </div>
            <p className="mt-4 text-[9px] font-black text-center text-violet-600/30 uppercase tracking-widest">
              Demo · Horario de 9:00 a 20:00
            </p>
          </PremiumSectionCard>
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
