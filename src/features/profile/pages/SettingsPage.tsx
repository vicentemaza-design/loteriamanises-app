import React, { useState, useRef } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Bell, Mail, Smartphone, ChevronDown, ShieldAlert, Award, Star, ToggleLeft } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { MOCK_NOTIFICATION_PREFS } from '../data/profile.mock';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <PremiumTouchInteraction scale={0.9}>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center border-none outline-none cursor-pointer ${
          checked ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
        }`}
      >
        <div className="w-5 h-5 bg-white rounded-full shadow-md" />
      </button>
    </PremiumTouchInteraction>
  );
}

interface AccordionSectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, subtitle, icon: Icon, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 active:bg-slate-50 transition-colors border-none text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isOpen ? 'bg-manises-blue text-white' : 'bg-slate-50 text-slate-500'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-manises-blue text-sm uppercase tracking-wider">{title}</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-manises-blue' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-slate-50/30 border-t border-slate-50"
          >
            <div className="p-4 space-y-3.5 divide-y divide-slate-100/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SettingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar preferencias persistidas
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('manises_notification_prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return MOCK_NOTIFICATION_PREFS;
  });

  const [openSection, setOpenSection] = useState<'push' | 'email' | 'games' | null>('push');

  const savePrefs = (newPrefs: typeof prefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('manises_notification_prefs', JSON.stringify(newPrefs));
  };

  const handlePushToggle = (key: keyof typeof prefs.push) => {
    const updated = {
      ...prefs,
      push: { ...prefs.push, [key]: !prefs.push[key] }
    };
    savePrefs(updated);
    toast.success('Preferencia push actualizada.');
  };

  const handleEmailToggle = (key: keyof typeof prefs.email) => {
    const updated = {
      ...prefs,
      email: { ...prefs.email, [key]: !prefs.email[key] }
    };
    savePrefs(updated);
    toast.success('Preferencia de correo actualizada.');
  };

  const handleGameToggle = (gameId: string) => {
    const updated = {
      ...prefs,
      games: { ...prefs.games, [gameId]: !prefs.games[gameId] }
    };
    savePrefs(updated);
    toast.success('Preferencia de sorteo actualizada.');
  };

  useGSAP(() => {
    gsap.from('.settings-section', {
      y: 15,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      duration: 0.5,
      clearProps: 'all'
    });
  }, { scope: containerRef });

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader title="Notificaciones y preferencias" subtitle="Push, email y resultados por juego" />

      <div className="p-5 flex flex-col gap-4">

        {/* Acordeón 1: Push */}
        <div className="settings-section">
          <AccordionSection
            title="Avisos en el Móvil (Push)"
            subtitle="Configura notificaciones directas en tu pantalla"
            icon={Smartphone}
            isOpen={openSection === 'push'}
            onToggle={() => setOpenSection(openSection === 'push' ? null : 'push')}
          >
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Actividad de cuenta</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Seguridad, accesos y estado de tus compras.</p>
              </div>
              <ToggleSwitch checked={prefs.push.account} onChange={() => handlePushToggle('account')} />
            </div>
            
            <div className="flex items-center justify-between pt-3 pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Resultados y escrutinios</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aviso al instante cuando se publiquen tus premios.</p>
              </div>
              <ToggleSwitch checked={prefs.push.results} onChange={() => handlePushToggle('results')} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Alertas de grandes botes</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Te avisamos cuando un bote supere los 10M €.</p>
              </div>
              <ToggleSwitch checked={prefs.push.jackpots} onChange={() => handlePushToggle('jackpots')} />
            </div>
          </AccordionSection>
        </div>

        {/* Acordeón 2: Email */}
        <div className="settings-section">
          <AccordionSection
            title="Comunicaciones por Email"
            subtitle="Recibe resguardos y avisos en tu bandeja de entrada"
            icon={Mail}
            isOpen={openSection === 'email'}
            onToggle={() => setOpenSection(openSection === 'email' ? null : 'email')}
          >
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Resguardos digitales de compra</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Copia oficial en PDF de cada décimo o apuesta adquirida.</p>
              </div>
              <ToggleSwitch checked={prefs.email.account} onChange={() => handleEmailToggle('account')} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Novedades y peñas especiales</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Apertura de peñas de empresa, promociones y botes.</p>
              </div>
              <ToggleSwitch checked={prefs.email.marketing} onChange={() => handleEmailToggle('marketing')} />
            </div>
          </AccordionSection>
        </div>

        {/* Acordeón 3: Configuración por Juego */}
        <div className="settings-section">
          <AccordionSection
            title="Resultados por Tipo de Juego"
            subtitle="Configura alertas de escrutinio de forma independiente"
            icon={Bell}
            isOpen={openSection === 'games'}
            onToggle={() => setOpenSection(openSection === 'games' ? null : 'games')}
          >
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Lotería Primitiva</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aviso de sorteos de Jueves y Sábados.</p>
              </div>
              <ToggleSwitch checked={prefs.games['primitiva']} onChange={() => handleGameToggle('primitiva')} />
            </div>

            <div className="flex items-center justify-between pt-3 pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Bonoloto</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aviso de escrutinios diarios de Bonoloto.</p>
              </div>
              <ToggleSwitch checked={prefs.games['bonoloto']} onChange={() => handleGameToggle('bonoloto')} />
            </div>

            <div className="flex items-center justify-between pt-3 pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Euromillones</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aviso de sorteos europeos de Martes y Viernes.</p>
              </div>
              <ToggleSwitch checked={prefs.games['euromillones']} onChange={() => handleGameToggle('euromillones')} />
            </div>

            <div className="flex items-center justify-between pt-3 pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">El Gordo de la Primitiva</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Aviso del sorteo de los Domingos.</p>
              </div>
              <ToggleSwitch checked={prefs.games['gordo']} onChange={() => handleGameToggle('gordo')} />
            </div>

            <div className="flex items-center justify-between pt-3 pb-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Lotería Nacional Jueves / Sábado</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Escrutinio completo de décimos ordinarios.</p>
              </div>
              <ToggleSwitch checked={prefs.games['loteria-nacional']} onChange={() => handleGameToggle('loteria-nacional')} />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-manises-blue text-sm">Sorteos Extraordinarios (Navidad y Niño)</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Resultados de los sorteos especiales de final de año.</p>
              </div>
              <ToggleSwitch checked={prefs.games['navidad-nino']} onChange={() => handleGameToggle('navidad-nino')} />
            </div>
          </AccordionSection>
        </div>

      </div>
    </div>
  );
}
