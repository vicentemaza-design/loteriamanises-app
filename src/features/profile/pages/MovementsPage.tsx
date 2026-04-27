import { useState } from 'react';
import type { ElementType } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trophy, Wallet, Plus } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { useMovements } from '@/features/wallet/hooks/useMovements';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MovementRowSkeleton } from '@/shared/ui/Skeleton';
import { TopUpModal } from '../components/TopUpModal';
import { Button } from '@/shared/ui/Button';
import type { WalletMovement } from '@/shared/types/domain';

type FilterKey = 'all' | 'deposit' | 'bet' | 'prize';

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'Todo' },
  { key: 'deposit', label: 'Recargas' },
  { key: 'bet',     label: 'Jugadas' },
  { key: 'prize',   label: 'Premios' },
];

function getIcon(type: WalletMovement['type']): ElementType {
  if (type === 'deposit') return ArrowDownLeft;
  if (type === 'prize') return Trophy;
  return ArrowUpRight;
}

function getTone(type: WalletMovement['type']): 'blue' | 'gold' | 'violet' {
  if (type === 'deposit') return 'blue';
  if (type === 'prize') return 'gold';
  return 'violet';
}

function getBadge(type: WalletMovement['type']): string {
  if (type === 'deposit') return 'Entrada';
  if (type === 'prize') return 'Premio';
  return 'Apuesta';
}

export function MovementsPage() {
  const { profile } = useAuth();
  const { movements, isLoading, error } = useMovements();
  const { topUp } = useWallet();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const deposits = movements.filter((m) => m.type === 'deposit').reduce((s, m) => s + m.amount, 0);
  const prizes   = movements.filter((m) => m.type === 'prize').reduce((s, m) => s + m.amount, 0);

  const filtered = activeFilter === 'all'
    ? movements
    : movements.filter((m) => m.type === activeFilter);

  const handleTopUpSuccess = async (amount: number) => {
    const result = await topUp(amount);
    return result?.success ? Promise.resolve() : Promise.reject();
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <ProfileSubHeader title="Movimientos" subtitle="Historial financiero" />
      <div className="flex flex-col gap-5 p-4">

        {/* Summary header */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance de actividad</p>
            <p className="text-[1.2rem] font-black text-manises-blue tracking-tight">
              {formatCurrency(deposits + prizes)}
              <span className="ml-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Histórico</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-9 rounded-xl bg-manises-blue text-white font-bold text-xs gap-1.5 hover:bg-manises-gold hover:text-manises-blue transition-all"
              onClick={() => setIsTopUpOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Recargar
            </Button>
            <div className="w-10 h-10 rounded-xl bg-manises-blue/5 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-manises-blue/40" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <PremiumMetricPill label="Total Ingresado" value={formatCurrency(deposits)} tone="blue" />
          <PremiumMetricPill label="Total Premios"   value={formatCurrency(prizes)}   tone="gold" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={cn(
                'shrink-0 inline-flex items-center px-4 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all',
                activeFilter === chip.key
                  ? 'bg-manises-blue text-white border-manises-blue shadow-sm'
                  : 'bg-white text-manises-blue/60 border-manises-blue/10 hover:border-manises-blue/25'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Movement list */}
        <section className="space-y-3">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
            {error ? (
              <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs text-red-600 font-bold">{error}</p>
              </div>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <MovementRowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-sm font-bold text-manises-blue">Sin movimientos</p>
                <p className="text-xs text-muted-foreground">
                  {activeFilter === 'all'
                    ? 'Tu actividad financiera aparecerá aquí.'
                    : 'No hay movimientos en esta categoría.'}
                </p>
              </div>
            ) : (
              filtered.map((movement) => (
                <PremiumActionRow
                  key={movement.id}
                  icon={getIcon(movement.type)}
                  title={movement.description}
                  description={formatDate(movement.createdAt)}
                  tone={getTone(movement.type)}
                  badge={getBadge(movement.type)}
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
              ))
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

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={profile?.balance ?? 0}
      />
    </div>
  );
}
