import { useRef, useState } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Plus, Trophy } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TopUpModal } from '../components/TopUpModal';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

export function WalletPage() {
  const { user, profile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  const transactions = [
    { id: 1, type: 'prize', amount: 15.00, desc: 'Premio Bonoloto', date: 'Hoy, 10:30' },
    { id: 2, type: 'bet', amount: -2.50, desc: 'Apuesta Euromillones', date: 'Ayer, 18:45' },
    { id: 3, type: 'deposit', amount: 20.00, desc: 'Recarga Apple Pay', date: '12 Abr, 09:15' },
  ];

  useGSAP(() => {
    gsap.from('.wallet-hero', {
      scale: 0.95,
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    gsap.from('.tx-item', {
      x: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.2,
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const handleTopUpSuccess = async (amount: number) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      balance: increment(amount)
    });
    // Visualmente GSAP podría animar el número, pero al estar linkeado al context de React, reaccionará muy bien.
  };

  return (
    <div className="flex flex-col min-h-full bg-background pb-28" ref={containerRef}>
      <ProfileSubHeader title="Mi Saldo" />
      
      <div className="p-5 flex flex-col gap-6">
        
        {/* Wallet Hero */}
        <section className="bg-manises-blue rounded-3xl p-6 relative overflow-hidden shadow-2xl wallet-hero">
          <div className="absolute top-0 right-0 w-32 h-32 bg-manises-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 text-center">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Saldo Disponible</p>
            <h2 className="text-5xl font-black text-manises-gold tabular-nums tracking-tighter drop-shadow-md">
              {formatCurrency(profile?.balance ?? 0)}
            </h2>
            
            <div className="mt-8 flex gap-3">
              <PremiumTouchInteraction scale={0.96} className="flex-1">
                <Button 
                  onClick={() => setIsTopUpOpen(true)}
                  className="w-full bg-manises-gold text-manises-blue hover:bg-white font-bold rounded-xl h-12 shadow-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-1" /> Recargar
                </Button>
              </PremiumTouchInteraction>
              <PremiumTouchInteraction scale={0.96} className="flex-1">
                <Button 
                  variant="outline"
                  onClick={() => toast.info('Opciones de cobro próximamente')}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl h-12 transition-colors"
                >
                  Cobrar
                </Button>
              </PremiumTouchInteraction>
            </div>
          </div>
        </section>

        {/* Movimientos */}
        <section className="space-y-3 mt-2">
          <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest pl-1">Últimos Movimientos</h3>
          
          <div className="flex flex-col gap-2">
            {transactions.map(tx => (
              <PremiumTouchInteraction key={tx.id} scale={0.98} className="tx-item">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-manises-blue/20 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      tx.type === 'prize' ? 'bg-emerald-50 text-emerald-500' :
                      tx.type === 'deposit' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {tx.type === 'prize' ? <Trophy className="w-5 h-5" /> :
                       tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : 
                       <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-manises-blue text-sm">{tx.desc}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{tx.date}</p>
                    </div>
                  </div>
                  
                  <p className={`font-black tabular-nums tracking-tight ${
                    tx.type === 'bet' ? 'text-manises-blue' : 'text-emerald-600'
                  }`}>
                    {tx.type === 'bet' ? '' : '+'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              </PremiumTouchInteraction>
            ))}
          </div>
        </section>

      </div>

      <TopUpModal 
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={profile?.balance ?? 0}
      />
    </div>
  );
}
