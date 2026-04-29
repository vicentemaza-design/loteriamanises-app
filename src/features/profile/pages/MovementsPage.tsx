import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trophy, Wallet, Plus, Landmark } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
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

type FilterKey = 'all' | 'deposit' | 'bet' | 'prize' | 'withdrawal';
type MovementWithBalance = WalletMovement & { balanceAfter?: number };

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'Todo' },
  { key: 'deposit',    label: 'Recargas' },
  { key: 'prize',      label: 'Premios' },
  { key: 'bet',        label: 'Jugadas' },
  { key: 'withdrawal', label: 'Retiradas' },
];

function getIcon(type: WalletMovement['type']): ElementType {
  if (type === 'deposit') return Plus;
  if (type === 'prize') return Trophy;
  if (type === 'withdrawal') return ArrowUpRight;
  return ArrowDownLeft; // default/bet
}

function getTone(type: WalletMovement['type']): 'blue' | 'gold' | 'violet' | 'emerald' | 'default' {
  if (type === 'deposit') return 'blue';
  if (type === 'prize') return 'gold';
  if (type === 'withdrawal') return 'emerald';
  if (type === 'bet') return 'default';
  return 'default';
}

function getBadge(type: WalletMovement['type']): string {
  if (type === 'deposit') return 'Entrada';
  if (type === 'prize') return 'Premio';
  if (type === 'withdrawal') return 'Retirada';
  return 'Apuesta';
}

export function MovementsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { movements, isLoading, error } = useMovements();
  const { topUp } = useWallet();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const deposits = movements.filter((m) => m.type === 'deposit').reduce((s, m) => s + m.amount, 0);
  const prizes   = movements.filter((m) => m.type === 'prize').reduce((s, m) => s + m.amount, 0);

  // Pre-calculate running balance for "all" view
  const movementsWithBalance = useMemo<MovementWithBalance[]>(() => {
    let current = profile?.balance ?? 0;
    return movements.map(m => {
      const balanceAfter = current;
      current = current - m.amount;
      return { ...m, balanceAfter };
    });
  }, [movements, profile?.balance]);

  const filtered = activeFilter === 'all'
    ? movementsWithBalance
    : movementsWithBalance.filter((m) => m.type === activeFilter);

  const handleTopUpSuccess = async (amount: number) => {
    const result = await topUp(amount);
    return result?.success ? Promise.resolve() : Promise.reject();
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <ProfileSubHeader title="Movimientos" subtitle="Historial financiero" />
      <div className="flex flex-col gap-5 p-4">

        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-manises-blue/40 uppercase tracking-[0.2em]">Balance total</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-manises-blue tracking-tight tabular-nums">
                {formatCurrency(profile?.balance ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-10 rounded-2xl border-manises-blue/20 text-manises-blue font-black text-[10px] gap-2 hover:bg-slate-50 transition-all shadow-sm px-4"
              onClick={() => navigate('/profile/withdrawals')}
            >
              <Landmark className="w-3.5 h-3.5" />
              Retirar
            </Button>
            <Button
              size="sm"
              className="h-10 rounded-2xl bg-manises-blue text-white font-black text-[10px] gap-2 hover:opacity-90 transition-all border-none shadow-lg px-4"
              onClick={() => setIsTopUpOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Recargar
            </Button>
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
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        'text-sm font-black tabular-nums',
                        movement.amount > 0 ? 'text-emerald-600' : 'text-manises-blue'
                      )}>
                        {movement.amount > 0 ? '+' : ''}
                        {formatCurrency(movement.amount)}
                      </span>
                      {activeFilter === 'all' && (
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                          {formatCurrency(movement.balanceAfter)}
                        </span>
                      )}
                    </div>
                  }
                />
              ))
            )}
          </div>
        </section>

        <PremiumSectionCard
          title="Seguridad y Auditoría"
          eyebrow="Compliance"
          description="Cada movimiento cuenta con un identificador único de transacción para su seguimiento informativo."
          tone="default"
        >
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Los datos mostrados son a título informativo. Las operaciones simuladas son de carácter orientativo y pendientes de integración.
            </p>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <p className="text-[9px] font-black text-manises-blue uppercase tracking-widest">
                Demo · Pendiente de integración
              </p>
              <p className="text-[8px] font-bold text-manises-blue uppercase tracking-[0.2em]">
                No se realizará ninguna operación real
              </p>
            </div>
          </div>
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
