import type { ElementType } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trophy, Wallet } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { useMovements } from '@/features/wallet/hooks/useMovements';
import { MovementRowSkeleton } from '@/shared/ui/Skeleton';

export function MovementsPage() {
  const { movements, isLoading, error } = useMovements();
  
  const deposits = movements.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
  const prizes = movements.filter((item) => item.type === 'prize').reduce((sum, item) => sum + item.amount, 0);

  const getIcon = (type: 'deposit' | 'bet' | 'prize') => {
    if (type === 'deposit') return ArrowDownLeft;
    if (type === 'prize') return Trophy;
    return ArrowUpRight;
  };

  const getTone = (type: 'deposit' | 'bet' | 'prize') => {
    if (type === 'deposit') return 'blue';
    if (type === 'prize') return 'gold';
    return 'violet';
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Movimientos" subtitle="Historial financiero" />
      <div className="flex flex-col gap-5 p-4">
        
        {/* Subtle summary metric at the top instead of a loud hero */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance de actividad</p>
            <p className="text-[1.2rem] font-black text-manises-blue tracking-tight">
              {formatCurrency(deposits + prizes)}
              <span className="ml-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Histórico</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-manises-blue/5 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-manises-blue/40" />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <PremiumMetricPill label="Total Ingresado" value={formatCurrency(deposits)} tone="blue" />
          <PremiumMetricPill label="Total Premios" value={formatCurrency(prizes)} tone="gold" />
        </div>

        <section className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Actividad reciente</p>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            {error ? (
              <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs text-red-600 font-bold">{error}</p>
              </div>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <MovementRowSkeleton key={i} />)
            ) : movements.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-sm font-bold text-manises-blue">Sin movimientos</p>
                <p className="text-xs text-muted-foreground">Tu actividad financiera aparecerá aquí.</p>
              </div>
            ) : (
              movements.map((movement) => {
                const Icon = getIcon(movement.type);
                const tone = getTone(movement.type);
                return (
                  <PremiumActionRow
                    key={movement.id}
                    icon={Icon}
                    title={movement.description}
                    description={`${formatDate(movement.createdAt)}`}
                    tone={tone}
                    badge={movement.type === 'deposit' ? 'Entrada' : movement.type === 'prize' ? 'Premio' : 'Apuesta'}
                    trailing={
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        movement.amount > 0 ? 'text-emerald-600' : 'text-manises-blue'
                      )}>
                        {movement.amount > 0 ? '+' : ''}
                        {formatCurrency(movement.amount)}
                      </span>
                    }
                  />
                );
              })
            )}
          </div>
        </section>

        <PremiumSectionCard
          title="Seguridad y Auditoría"
          description="Cada movimiento cuenta con un identificador único de transacción para su seguimiento."
          tone="default"
        >
          <p className="text-[10px] text-muted-foreground/60 font-medium">
            Los datos mostrados son a título informativo.
          </p>
        </PremiumSectionCard>
      </div>
    </div>
  );
}

