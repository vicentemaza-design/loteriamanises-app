import { useState, useRef } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Bell, Mail, Smartphone, Moon, Sun, Monitor } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Pequeño componente interno para los switches mockeados
function ToggleSwitch({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <PremiumTouchInteraction scale={0.9}>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${checked ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}
      >
        <div className="w-5 h-5 bg-white rounded-full shadow-md" />
      </button>
    </PremiumTouchInteraction>
  );
}

export function SettingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState({
    pushResults: true,
    pushJackpots: false,
    emailMarketing: true,
    emailTickets: true,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useGSAP(() => {
    gsap.from('.settings-section', {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
      duration: 0.7,
      clearProps: 'all'
    });
  }, { scope: containerRef });

  return (
    <div className="flex flex-col min-h-dvh bg-background pb-28" ref={containerRef}>
      <ProfileSubHeader title="Preferencias" />
      
      <div className="p-5 flex flex-col gap-6">
        
        {/* Notificaciones Push */}
        <section className="space-y-3 settings-section">
          <div className="flex items-center gap-2 pl-1">
            <Smartphone className="w-4 h-4 text-manises-blue" />
            <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest">Notificaciones Push</h3>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-manises-blue text-sm">Resultados de sorteos</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aviso inmediato al publicarse escrutinio.</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.pushResults} onChange={() => toggle('pushResults')} />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-manises-gold/20 flex items-center justify-center text-orange-500">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-manises-blue text-sm">Grandes Botes</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Alertas cuando hay bote especial.</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.pushJackpots} onChange={() => toggle('pushJackpots')} />
            </div>
          </div>
        </section>

        {/* Email */}
        <section className="space-y-3 settings-section">
          <div className="flex items-center gap-2 pl-1">
            <Mail className="w-4 h-4 text-manises-blue" />
            <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest">Comunicaciones Email</h3>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="font-bold text-manises-blue text-sm">Resguardos Digitales</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Copia en PDF de tus compras.</p>
              </div>
              <ToggleSwitch checked={settings.emailTickets} onChange={() => toggle('emailTickets')} />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="font-bold text-manises-blue text-sm">Ofertas y Peñas</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Apertura de peñas e información.</p>
              </div>
              <ToggleSwitch checked={settings.emailMarketing} onChange={() => toggle('emailMarketing')} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
