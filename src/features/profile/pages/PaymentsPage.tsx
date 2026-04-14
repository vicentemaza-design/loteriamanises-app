import { useRef } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { Plus, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
    <div className="flex flex-col min-h-dvh bg-background pb-28" ref={containerRef}>
      <ProfileSubHeader title="Métodos de Pago" />
      
      <div className="p-5 flex flex-col gap-6">
        
        <section className="space-y-4">
          <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest pl-1 fade-in">Tarjetas Guardadas</h3>
          
          <div className="flex flex-col gap-4">
            {cards.map(card => (
              <PremiumTouchInteraction key={card.id} scale={0.98} className="card-item">
                <div className={`relative h-28 rounded-2xl p-5 overflow-hidden shadow-xl bg-gradient-to-br ${card.gradient}`}>
                  {/* Decoraciones del banco */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-8 bg-white/10 backdrop-blur-md rounded border border-white/20 p-1.5 flex items-center justify-center shadow-inner">
                         <img src={card.logo} alt={card.brand} className="w-full h-full object-contain brightness-0 invert opacity-90" />
                      </div>
                      
                      {card.isDefault && (
                        <span className="bg-manises-gold text-manises-blue text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                          Principal
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex gap-4 items-center">
                        <span className="text-white/60 text-lg tracking-widest">••••</span>
                        <span className="text-white font-bold tracking-widest">{card.last4}</span>
                      </div>
                      <span className="text-white/50 text-[10px] font-medium tracking-wider">
                        {card.expires}
                      </span>
                    </div>
                  </div>
                </div>
              </PremiumTouchInteraction>
            ))}
          </div>
        </section>

        <PremiumTouchInteraction scale={0.98} className="fade-in">
          <Button
            variant="outline"
            className="w-full h-14 border-dashed border-2 border-gray-300 text-manises-blue hover:border-manises-gold hover:text-manises-blue hover:bg-manises-gold/10 rounded-2xl gap-2 font-bold transition-all shadow-sm group"
            onClick={() => toast.info('Integración de pasarela de pagos próximamente.')}
          >
            <div className="w-6 h-6 rounded-full bg-manises-blue/10 flex items-center justify-center transition-transform group-hover:scale-110">
              <Plus className="w-4 h-4 text-manises-blue" />
            </div>
            Añadir nueva tarjeta
          </Button>
        </PremiumTouchInteraction>

        <div className="flex items-start gap-2 px-2 mt-2 fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
             Tus datos de pago se procesan de forma segura mediante encriptación SSL de grado bancario. Lotería Manises no almacena el CVV.
          </p>
        </div>
      </div>
    </div>
  );
}
