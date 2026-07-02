import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { ShoppingCart, Trophy, Wallet, Plus, Landmark, Clock, ChevronRight, X, Ticket, Star, RefreshCw, RotateCcw } from 'lucide-react';
import { formatCurrency, cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumActionRow } from '../components/PremiumActionRow';
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
  { key: 'all',        label: 'Todos' },
  { key: 'deposit',    label: 'Recargas' },
  { key: 'prize',      label: 'Premios' },
  { key: 'bet',        label: 'Jugadas' },
  { key: 'withdrawal', label: 'Retiradas' },
];

const NATIONAL_GAME_IDS = ['loteria-nacional', 'navidad', 'nino'];

function getIcon(type: string, gameId?: string): ElementType {
  if (type === 'deposit') return Wallet;
  if (type === 'prize') return Trophy;
  if (type === 'withdrawal') return Landmark;
  if (type === 'adjustment') return RefreshCw;
  if (type === 'cancellation') return RotateCcw;
  if (NATIONAL_GAME_IDS.includes(gameId || '') || (!gameId && type === 'bet')) return Ticket;
  if (gameId === 'euromillones') return Star;
  return ShoppingCart;
}

function getTone(type: string, gameId?: string): 'blue' | 'gold' | 'violet' | 'emerald' | 'rose' | 'default' {
  if (type === 'deposit') return 'emerald';
  if (type === 'prize') return 'gold';
  if (type === 'withdrawal') return 'blue';
  if (type === 'adjustment' || type === 'cancellation') return 'default';
  if (NATIONAL_GAME_IDS.includes(gameId || '')) return 'violet';
  return 'rose';
}

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function MovementsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { movements, isLoading, error } = useMovements();
  const { topUp } = useWallet();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<WalletMovement | null>(null);

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
      <ProfileSubHeader
        title="Movimientos"
        subtitle="Historial financiero"
        rightSlot={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl border-manises-blue/20 text-manises-blue font-black text-[10px] gap-1.5 hover:bg-slate-50 transition-all shadow-sm px-3"
              onClick={() => navigate('/profile/withdrawals')}
            >
              <Landmark className="w-3 h-3" />
              Retirar
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-xl bg-manises-blue text-white font-black text-[10px] gap-1.5 hover:opacity-90 transition-all border-none shadow-md px-3"
              onClick={() => setIsTopUpOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Recargar
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-5 p-4">

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
                  icon={getIcon(movement.type, movement.details?.gameId)}
                  title={movement.description}
                  noTruncate
                  description={formatDatetime(movement.createdAt)}
                  subdescription={movement.orderId ? `Pedido ${movement.orderId}` : undefined}
                  tone={getTone(movement.type, movement.details?.gameId)}
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

        <div className="flex items-start gap-2.5 rounded-2xl border border-manises-blue/10 bg-manises-blue/4 px-4 py-3">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-manises-blue/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[11px] font-medium leading-snug text-manises-blue/50">
            Los movimientos pueden tardar unos minutos en mostrarse tras realizarse.
          </p>
        </div>
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
              className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-[2px] w-full h-full cursor-default"
              aria-label="Cerrar detalle"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-screen-sm flex-col rounded-t-[2.5rem] bg-white border-t border-slate-200/80 shadow-[0_-28px_60px_rgba(15,23,42,0.22)]"
            >
              <MovementDetail movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MovementDetail ────────────────────────────────────────────────────────────

function MovementDetail({ movement: mv, onClose }: { movement: MovementWithBalance; onClose: () => void }) {
  const isNational = mv.type === 'bet' && (NATIONAL_GAME_IDS.includes(mv.details?.gameId || '') || !!mv.details?.number);
  const isGamesBet = mv.type === 'bet' && !isNational;
  const isAdjustment = mv.type === 'adjustment';
  const isCancellation = mv.type === 'cancellation';

  const DetailIcon = getIcon(mv.type, mv.details?.gameId);

  const iconStyle =
    mv.type === 'prize' ? 'bg-amber-50 text-amber-500' :
    mv.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' :
    mv.type === 'withdrawal' ? 'bg-blue-50 text-blue-600' :
    isNational ? 'bg-indigo-50 text-indigo-600' :
    (isAdjustment || isCancellation) ? 'bg-slate-100 text-slate-500' :
    'bg-rose-50 text-rose-500';

  const amountColor = mv.amount > 0 ? 'text-emerald-600' : 'text-manises-blue';

  const status =
    mv.type === 'withdrawal' ? 'Enviada' :
    mv.type === 'prize' ? 'Abonado' :
    mv.type === 'cancellation' ? 'Anulado' :
    'Completada';
  const statusStyle =
    status === 'Enviada' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
    status === 'Anulado' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
    'bg-emerald-50 text-emerald-600 border border-emerald-200';

  // ── Campos por tipo ──────────────────────────────────────────────────────
  const fields: Array<{ label: string; value: string; mono?: boolean; positive?: boolean }> = [];

  if (mv.type === 'prize') {
    fields.push({ label: 'Fecha del sorteo', value: formatDateOnly(mv.createdAt) });
    fields.push({ label: 'Categoría del premio', value: '5 aciertos + Complementario' });
    fields.push({ label: 'Nº de pedido origen', value: mv.orderId || 'PR-202606290014', mono: true });
    const abono = new Date(mv.createdAt);
    abono.setDate(abono.getDate() + 1);
    fields.push({ label: 'Fecha del abono', value: formatDatetime(abono.toISOString()) });
    fields.push({ label: 'Importe abonado', value: formatCurrency(mv.amount), positive: true });
  } else if (mv.type === 'deposit') {
    fields.push({ label: 'Fecha y hora', value: formatDatetime(mv.createdAt) });
    const method = mv.description.includes('Bizum') ? 'Bizum'
      : mv.description.includes('Apple') ? 'Apple Pay'
      : mv.description.includes('Transferencia') ? 'Transferencia bancaria'
      : 'Tarjeta bancaria';
    fields.push({ label: 'Método de pago', value: method });
    fields.push({ label: 'Nº de referencia', value: mv.orderId || 'RB-202606290052', mono: true });
    fields.push({ label: 'Importe recargado', value: formatCurrency(mv.amount), positive: true });
  } else if (mv.type === 'withdrawal') {
    fields.push({ label: 'Fecha y hora', value: formatDatetime(mv.createdAt) });
    fields.push({ label: 'Cuenta destino', value: mv.details?.iban || 'ES12 2100 **** **** 3456', mono: true });
    fields.push({ label: 'Titular', value: mv.details?.recipientName || 'Rafa Sanchis' });
    fields.push({ label: 'Importe retirado', value: formatCurrency(Math.abs(mv.amount)) });
    fields.push({ label: 'Estado', value: 'Enviada' });
    const prevista = new Date(mv.createdAt);
    prevista.setDate(prevista.getDate() + 3);
    fields.push({ label: 'Fecha prevista', value: formatDateOnly(prevista.toISOString()) });
  } else if (isNational) {
    fields.push({ label: 'Fecha del pedido', value: formatDatetime(mv.createdAt) });
    fields.push({ label: 'Fecha del sorteo', value: '22 dic 2026' });
    fields.push({ label: 'Nº de pedido', value: mv.orderId || 'LN-983055', mono: true });
    fields.push({ label: 'Detalle', value: `${mv.details?.quantity || 1} décimos` });
    fields.push({ label: 'Método de entrega', value: mv.details?.deliveryMode === 'shipping' ? 'Mensajería (Nacex)' : 'Custodia digital' });
  } else if (isAdjustment) {
    fields.push({ label: 'Fecha y hora', value: formatDatetime(mv.createdAt) });
    fields.push({ label: 'Motivo', value: 'Corrección de saldo por el sistema' });
    fields.push({ label: 'Nº de referencia', value: mv.orderId || 'ADJ-00058', mono: true });
    fields.push({ label: 'Importe regularizado', value: formatCurrency(Math.abs(mv.amount)), positive: true });
  } else if (isCancellation) {
    fields.push({ label: 'Fecha y hora', value: formatDatetime(mv.createdAt) });
    fields.push({ label: 'Juego anulado', value: mv.details?.gameLabel || 'Juego' });
    fields.push({ label: 'Nº de pedido anulado', value: mv.orderId || 'CAN-00147', mono: true });
    fields.push({ label: 'Motivo', value: 'Anulación solicitada antes del sorteo' });
    fields.push({ label: 'Importe devuelto', value: formatCurrency(Math.abs(mv.amount)), positive: true });
  } else {
    // juegos activos (primitiva, bonoloto, euromillones, gordo…)
    const sorteo = new Date(mv.createdAt);
    sorteo.setDate(sorteo.getDate() + 3);
    fields.push({ label: 'Fecha del pedido', value: formatDatetime(mv.createdAt) });
    fields.push({ label: 'Sorteo', value: sorteo.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) });
    fields.push({ label: 'Nº de pedido', value: mv.orderId || 'EM-983120', mono: true });
    const combCount = mv.details?.combinations?.length || 1;
    fields.push({ label: 'Detalle', value: `${combCount} ${combCount === 1 ? 'apuesta' : 'apuestas'}` });
    fields.push({ label: 'Modalidad', value: 'Sencilla' });
  }

  fields.push({ label: 'Saldo resultante', value: formatCurrency(mv.balanceAfter ?? 0) });

  // ── Resumen económico (solo apuestas) ────────────────────────────────────
  const economicLines: Array<{ label: string; value: string }> = [];
  if (isNational) {
    const qty = mv.details?.quantity || 1;
    const shipping = mv.details?.shippingCost || (mv.details?.deliveryMode === 'shipping' ? 12 : 0);
    const decimosCost = Math.abs(mv.amount) - shipping;
    const priceEach = qty > 0 ? decimosCost / qty : decimosCost;
    economicLines.push({ label: `Décimos (${qty} × ${formatCurrency(priceEach)})`, value: formatCurrency(decimosCost) });
    if (shipping > 0) economicLines.push({ label: 'Mensajería (Nacex)', value: formatCurrency(shipping) });
  } else if (isGamesBet) {
    const combCount = mv.details?.combinations?.length || 1;
    const pricePerBet = combCount > 0 ? Math.abs(mv.amount) / combCount : Math.abs(mv.amount);
    economicLines.push({ label: `Apuestas (${combCount} × ${formatCurrency(pricePerBet)})`, value: formatCurrency(combCount * pricePerBet) });
  }

  // ── Botones de acción ────────────────────────────────────────────────────
  const actions: string[] = isNational ? ['Ver pedido', 'Ver escrutinio']
    : isGamesBet ? ['Ver apuestas', 'Ver escrutinio']
    : mv.type === 'prize' ? ['Ver escrutinio']
    : mv.type === 'deposit' ? ['Ver comprobante']
    : mv.type === 'withdrawal' ? ['Ver solicitud']
    : isAdjustment ? ['Ver justificante']
    : isCancellation ? ['Ver pedido original']
    : [];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Grabber */}
      <div className="pt-3 pb-1 flex justify-center shrink-0">
        <div className="h-1.5 w-14 rounded-full bg-slate-200" />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Detalle del movimiento</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero: icono + nombre + importe + estado */}
        <div className="flex flex-col items-center gap-1.5 py-3">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm', iconStyle)}>
            <DetailIcon className="w-8 h-8" />
          </div>
          <p className="mt-1 text-[13px] font-bold text-manises-blue">{mv.description}</p>
          <p className={cn('text-[2rem] font-black tabular-nums leading-none', amountColor)}>
            {mv.amount > 0 ? '+' : ''}{formatCurrency(mv.amount)}
          </p>
          <span className={cn('mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', statusStyle)}>
            {status}
          </span>
        </div>

        {/* Campos */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{f.label}</span>
              <span className={cn(
                'text-xs font-bold text-right ml-3',
                f.mono ? 'font-mono' : '',
                f.positive ? 'text-emerald-600' : 'text-manises-blue'
              )}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Resumen económico */}
        {economicLines.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-4 pt-3.5 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue">Resumen económico</p>
            </div>
            {economicLines.map((line, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-slate-50">
                <span className="text-[11px] font-medium text-slate-500">{line.label}</span>
                <span className="text-[11px] font-bold text-manises-blue">{line.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-manises-blue/[0.03]">
              <span className="text-[11px] font-black uppercase tracking-wider text-manises-blue">Total pagado</span>
              <span className="text-sm font-black text-manises-blue">{formatCurrency(Math.abs(mv.amount))}</span>
            </div>
          </div>
        )}

        {/* Aviso retirada */}
        {mv.type === 'withdrawal' && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-amber-800 leading-snug">
              Esta transferencia puede tardar hasta <strong>72 horas hábiles</strong> en liquidarse.
            </p>
          </div>
        )}

        {/* Botones de acción */}
        {actions.length > 0 && (
          <div className="space-y-2">
            {actions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toast.info(`${label} — disponible próximamente`)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-manises-blue/15 bg-manises-blue/[0.03] text-manises-blue hover:bg-manises-blue/[0.07] transition-colors"
              >
                <span className="text-[12px] font-black uppercase tracking-wider">{label}</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
