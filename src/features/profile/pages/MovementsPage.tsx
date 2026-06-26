import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trophy, Wallet, Plus, Landmark, Clock } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumActionRow } from '../components/PremiumActionRow';
import { PremiumMetricPill } from '../components/PremiumMetricPill';
import { useMovements } from '@/features/wallet/hooks/useMovements';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MovementRowSkeleton } from '@/shared/ui/Skeleton';
import { TopUpModal } from '../components/TopUpModal';
import { Button } from '@/shared/ui/Button';
import type { WalletMovement } from '@/shared/types/domain';
import { toast } from 'sonner';

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
  const [selectedMovement, setSelectedMovement] = useState<WalletMovement | null>(null);

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
                  onClick={() => setSelectedMovement(movement)}
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

        <p className="text-center text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">
          Demo · Datos orientativos · No se realizará ninguna operación real
        </p>
      </div>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={profile?.balance ?? 0}
      />

      {/* Detalle del movimiento Modal */}
      <AnimatePresence>
        {selectedMovement && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMovement(null)}
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] w-full h-full cursor-default"
              aria-label="Cerrar detalle"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-screen-sm flex-col rounded-t-[2.5rem] bg-slate-50 border-t border-slate-200/80 shadow-[0_-28px_60px_rgba(15,23,42,0.22)] pb-safe"
            >
              <div className="px-5 py-4 flex-1 overflow-y-auto">
                <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
                
                {/* Header del detalle */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Detalle de Operación</p>
                    <h2 className="mt-1 text-xl font-black text-manises-blue uppercase tracking-tight">
                      {selectedMovement.type === 'deposit' && 'Recarga de saldo'}
                      {selectedMovement.type === 'withdrawal' && 'Retirada de saldo'}
                      {selectedMovement.type === 'prize' && 'Premio obtenido'}
                      {selectedMovement.type === 'bet' && 'Compra de jugada'}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedMovement(null)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-3 py-1 rounded-xl bg-slate-100 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Importe y Estado */}
                <div className="mt-5 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Importe de la operación</p>
                  <p className={cn(
                    "text-3xl font-black mt-1 tabular-nums",
                    selectedMovement.amount > 0 ? "text-emerald-600" : "text-manises-blue"
                  )}>
                    {selectedMovement.amount > 0 ? '+' : ''}{formatCurrency(selectedMovement.amount)}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider",
                      selectedMovement.type === 'prize' && 'bg-amber-50 text-amber-700 border border-amber-100',
                      selectedMovement.type === 'deposit' && 'bg-blue-50 text-blue-700 border border-blue-100',
                      selectedMovement.type === 'withdrawal' && 'bg-purple-50 text-purple-700 border border-purple-100',
                      selectedMovement.type === 'bet' && 'bg-slate-50 text-slate-600 border border-slate-200'
                    )}>
                      {selectedMovement.description}
                    </span>
                  </div>
                </div>

                {/* Desglose de información */}
                <div className="mt-4 rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha contable</span>
                    <span className="text-xs font-semibold text-manises-blue">{formatDate(selectedMovement.createdAt)}</span>
                  </div>

                  {selectedMovement.orderId && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nº de Referencia / Pedido</span>
                      <span className="text-xs font-mono font-black text-manises-blue">{selectedMovement.orderId}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo resultante</span>
                    <span className="text-xs font-black text-manises-blue">{formatCurrency(selectedMovement.balanceAfter ?? 0)}</span>
                  </div>

                  {/* Detalles específicos por tipo de operación */}
                  {selectedMovement.details && (
                    <div className="pt-1.5 space-y-3">
                      {/* Caso de Lotería Nacional */}
                      {selectedMovement.details.number && (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número jugado</span>
                            <span className="font-mono text-lg font-black tracking-widest text-manises-blue">{selectedMovement.details.number}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Décimos adquiridos</span>
                            <span className="text-xs font-black text-manises-blue">{selectedMovement.details.quantity} décimos</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método de entrega</span>
                            <span className="text-xs font-bold text-manises-blue">
                              {selectedMovement.details.deliveryMode === 'custody' ? 'Custodia Digital' : 'Envío a domicilio'}
                            </span>
                          </div>
                          {selectedMovement.details.shippingCost && selectedMovement.details.shippingCost > 0 && (
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gastos de envío</span>
                              <span className="text-xs font-semibold text-manises-blue">{formatCurrency(selectedMovement.details.shippingCost)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Caso de Juegos de combinaciones (Bonoloto, Primitiva, Euromillones) */}
                      {selectedMovement.details.combinations && selectedMovement.details.combinations.length > 0 && (
                        <div className="space-y-2 border-b border-slate-100 pb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Combinaciones jugadas</span>
                          <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {selectedMovement.details.combinations.map((comb, index) => (
                              <p key={index} className="font-mono text-xs font-black text-manises-blue text-center tracking-wider">
                                {comb}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Caso de Retiradas de saldo */}
                      {selectedMovement.details.iban && (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Banco de destino</span>
                            <span className="text-xs font-semibold text-manises-blue">{selectedMovement.details.bankName}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IBAN</span>
                            <span className="text-xs font-mono font-bold text-manises-blue">{selectedMovement.details.iban}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Titular</span>
                            <span className="text-xs font-semibold text-manises-blue">{selectedMovement.details.recipientName}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones del detalle */}
                <div className="mt-5 space-y-2.5">
                  {selectedMovement.type === 'bet' && (
                    <Button 
                      className="w-full h-12 rounded-2xl bg-manises-blue text-white font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-manises border-none transition-all"
                      onClick={() => {
                        toast.success('Abriendo resguardo oficial en demo...');
                      }}
                    >
                      Ver resguardo oficial
                    </Button>
                  )}
                  {selectedMovement.type === 'withdrawal' && (
                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-emerald-800 leading-relaxed">
                        Esta transferencia se encuentra en procesamiento y puede demorar hasta 72 horas hábiles en liquidarse.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
