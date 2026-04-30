import { useRef } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { Plus, CreditCard, Wallet, Shield } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';

import visaLogo from '@/assets/games/visa.svg';
import mastercardLogo from '@/assets/games/mastercard.svg';

export function PaymentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const cards = [
    { id: 1, brand: 'Visa', last4: '4242', expires: '12/28', logo: visaLogo, isDefault: true, gradient: 'from-blue-900 to-indigo-900' },
    { id: 2, brand: 'Mastercard', last4: '5511', expires: '09/25', logo: mastercardLogo, isDefault: false, gradient: 'from-stone-800 to-stone-900' },
  ];

  useGSAP(() => {
    gsap.from('.card-item', {
      x: -30,
      opacity: 0,
      stagger: 0.15,
      ease: 'power4.out',
      duration: 0.8,
      clearProps: 'all'
    });
    
    gsap.from('.fade-in', {
      opacity: 0,
      y: 20,
      delay: 0.4,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, { scope: containerRef });

  return (
    <div className="flex min-h-full flex-col bg-background" ref={containerRef}>
      <ProfileSubHeader title="Métodos de Pago" />
      
      <div className="p-5 flex flex-col gap-6">
        
        {/* BLOQUE: TARJETAS GUARDADAS */}
        <section className="card-item">
          <PremiumSectionCard 
            title="Mis Tarjetas" 
            eyebrow="Métodos de Pago"
            description="Tarjetas vinculadas para recargas rápidas."
            tone="blue"
          >
            <div className="space-y-4">
              {cards.map(card => (
                <PremiumTouchInteraction key={card.id} scale={0.98}>
                  <div className={`relative h-32 rounded-2xl p-5 overflow-hidden shadow-lg bg-gradient-to-br ${card.gradient} group active:scale-[0.99] transition-transform`}>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-7 bg-white/10 backdrop-blur-md rounded border border-white/20 p-1 flex items-center justify-center">
                           <img src={card.logo} alt={card.brand} className="w-full h-full object-contain brightness-0 invert opacity-80" />
                        </div>
                        {card.isDefault && (
                          <span className="bg-manises-gold text-manises-blue text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg">
                            Principal
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold tracking-[0.2em] text-sm">•••• {card.last4}</p>
                        <p className="text-white/40 text-[9px] font-medium mt-1">CADUCA: {card.expires}</p>
                      </div>
                    </div>
                  </div>
                </PremiumTouchInteraction>
              ))}

              <Button
                variant="outline"
                className="w-full h-12 border-dashed border-2 border-slate-200 text-manises-blue hover:border-manises-gold hover:text-manises-blue hover:bg-manises-gold/5 rounded-xl gap-2 font-black text-xs transition-all"
                onClick={() => toast.info('Añadir tarjeta: Demo · Pendiente de integración')}
              >
                <Plus className="w-4 h-4" /> Añadir Nueva Tarjeta
              </Button>
            </div>
          </PremiumSectionCard>
        </section>

        {/* BLOQUE: OTROS MÉTODOS (DEMO) */}
        <section className="fade-in">
          <PremiumSectionCard 
            title="Otros Métodos" 
            eyebrow="Alternativas"
            description="Opciones de pago adicionales en fase de pruebas."
            tone="gold"
          >
            <div className="divide-y divide-slate-50 -mx-1">
              <PremiumActionRow
                icon={Wallet}
                title="Apple Pay / Google Pay"
                description="Pago rápido con biometría"
                tone="gold"
                badge="Demo"
                onClick={() => toast.info('Demo · Próximamente disponible')}
              />
              <PremiumActionRow
                icon={CreditCard}
                title="Transferencia Bancaria"
                description="Ingreso directo a cuenta de referencia"
                tone="blue"
                onClick={() => toast.info('Demo · Próximamente disponible')}
              />
            </div>
          </PremiumSectionCard>
        </section>

        <div className="flex flex-col gap-4 mt-2 fade-in">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Seguridad Garantizada</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                No se realizará ningún cargo real. Los datos mostrados son ejemplos visuales para simulación visual de métodos de pago.
              </p>
            </div>
          </div>
          <p className="text-[9px] font-black text-center text-manises-blue/20 uppercase tracking-widest">
            Demo · No se almacenan datos bancarios
          </p>
        </div>
      </div>
    </div>
  );
}
