import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button';
import { formatCurrency, cn } from '@/shared/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus, Trophy } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TopUpModal } from '../components/TopUpModal';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useMovements } from '@/features/wallet/hooks/useMovements';
import { MovementRowSkeleton } from '@/shared/ui/Skeleton';

export function WalletPage() {
  const { profile } = useAuth();
  const { topUp, isProcessing: isTopUpProcessing } = useWallet();
  const { movements, isLoading: isLoadingMovements } = useMovements();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  const latestMovements = movements.slice(0, 3);

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
    const result = await topUp(amount);
    return result?.success ? Promise.resolve() : Promise.reject();
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-28" ref={containerRef}>
      <ProfileSubHeader title="Mi Saldo" />
      
      <div className="flex flex-col gap-4 p-4">
        
        {/* Wallet Hero Premium */}
        <section className="wallet-hero relative overflow-hidden rounded-[1.9rem] bg-manises-blue p-5 shadow-xl">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-manises-gold/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <span className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-white/50">
                Saldo Disponible
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-[2.6rem] font-black tracking-tighter text-manises-gold tabular-nums drop-shadow-xl">
                  {formatCurrency(profile?.balance ?? 0).split(',')[0]}
                </span>
                <span className="text-xl font-bold text-manises-gold/80">
                  ,{formatCurrency(profile?.balance ?? 0).split(',')[1]}
                </span>
              </div>
              
              <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Demo · Monedero Virtual</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <PremiumTouchInteraction scale={0.97}>
                <Button 
                  onClick={() => setIsTopUpOpen(true)}
                  className="h-11 w-full rounded-2xl border-none bg-manises-gold font-black text-manises-blue shadow-lg transition-all hover:bg-white"
                >
                  <Plus className="mr-1.5 h-5 w-5" /> Recargar
                </Button>
              </PremiumTouchInteraction>
              <PremiumTouchInteraction scale={0.97}>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/profile/withdrawals')}
                  className="h-11 w-full rounded-2xl border-white/20 bg-white/10 font-black text-white transition-all hover:bg-white/20"
                >
                  Cobrar
                </Button>
              </PremiumTouchInteraction>
            </div>
          </div>
        </section>

        {/* Movimientos Recientes Premium */}
        <section className="stagger-item">
          <PremiumSectionCard 
            title="Actividad Reciente" 
            eyebrow="Movimientos"
            description="Tus últimas operaciones de juego y recargas."
            tone="blue"
          >
            <div className="mt-1 divide-y divide-slate-50 -mx-1">
              {isLoadingMovements ? (
                Array.from({ length: 3 }).map((_, i) => <MovementRowSkeleton key={i} />)
              ) : latestMovements.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground font-medium italic">No hay movimientos registrados</p>
                </div>
              ) : (
                latestMovements.map(tx => (
                  <PremiumActionRow
                    key={tx.id}
                    icon={tx.type === 'prize' ? Trophy : tx.type === 'deposit' ? ArrowDownLeft : ArrowUpRight}
                    title={tx.description}
                    description={new Date(tx.createdAt).toLocaleDateString()}
                    tone={tx.type === 'prize' ? 'gold' : tx.type === 'deposit' ? 'blue' : 'default'}
                    trailing={
                      <span className={cn(
                        'text-sm font-black tabular-nums tracking-tight',
                        tx.type === 'bet' ? 'text-manises-blue' : 'text-emerald-600'
                      )}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    }
                  />
                ))
              )}
            </div>
            
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <p className="text-[9px] font-black text-manises-blue/20 uppercase tracking-widest text-center">
                Demo · No se realizará ningún cargo real
              </p>
              <Button 
                variant="link" 
                size="sm"
                className="text-[10px] font-black text-manises-blue/40 uppercase tracking-widest h-auto p-0"
                onClick={() => navigate('/profile/movements')}
              >
                Ver historial completo
              </Button>
            </div>
          </PremiumSectionCard>
        </section>

        <section className="space-y-2.5">
          <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest pl-1">Operativa premium</h3>
          <div className="flex flex-col gap-3">
            <PremiumActionRow
              icon={ArrowDownLeft}
              title="Ver todos los movimientos"
              description="Timeline completo de recargas, jugadas y premios."
              onClick={() => navigate('/profile/movements')}
            />
            <PremiumActionRow
              icon={Landmark}
              title="Gestionar cobro de premios"
              description="Estado documental, IBAN y retiradas disponibles."
              onClick={() => navigate('/profile/withdrawals')}
            />
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
