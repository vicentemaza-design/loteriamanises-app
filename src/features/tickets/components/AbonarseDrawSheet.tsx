import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Minus, Plus, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { toast } from 'sonner';
import type { Ticket } from '@/shared/types/domain';
import type { SubscriptionDrawType } from '@/features/profile/data/subscriptionsDemo';

// ── Constantes ────────────────────────────────────────────────────────────────

const DRAW_TYPE_META: Record<SubscriptionDrawType, {
  label: string;
  day: string;
  unitPrice: number;
}> = {
  JUE:  { label: 'Jueves', day: 'JUE', unitPrice: 3  },
  'SÁB': { label: 'Sábado', day: 'SÁB', unitPrice: 3  },
  NAV:  { label: 'Navidad', day: 'NAV', unitPrice: 20 },
  'NIÑ': { label: 'El Niño', day: 'NIÑ', unitPrice: 20 },
};

const ALL_DRAW_TYPES: SubscriptionDrawType[] = ['JUE', 'SÁB', 'NAV', 'NIÑ'];

/** Devuelve los tipos de sorteo activos por defecto según el gameId del ticket. */
function defaultDrawTypes(gameId: string): SubscriptionDrawType[] {
  if (gameId === 'loteria-nacional-sabado') return ['SÁB'];
  if (gameId === 'loteria-navidad')         return ['NAV'];
  if (gameId === 'loteria-nino')            return ['NIÑ'];
  return ['JUE']; // loteria-nacional-jueves y fallback
}

function splitAmount(n: number) {
  const [eur = '0', cts = '00'] = n.toLocaleString('es-ES', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).split(',');
  return { eur, cts };
}

function isNationalTicket(ticket: Ticket) {
  return (
    ticket.gameType === 'loteria-nacional' ||
    ticket.gameType === 'navidad' ||
    ticket.gameType === 'nino'
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AbonarseDrawSheetProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function AbonarseDrawSheet({ ticket, onClose }: AbonarseDrawSheetProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addSubscription, hasActiveSubscription } = useSubscriptions();

  const [selectedDrawTypes, setSelectedDrawTypes] = useState<SubscriptionDrawType[]>([]);
  const [quantity, setQuantity] = useState(1);

  const game = ticket ? LOTTERY_GAMES.find(g => g.id === ticket.gameId) ?? null : null;
  const nationalNumber = ticket?.metadata?.nationalNumber ?? ticket?.numbers.join('').padStart(5, '0') ?? '';
  const isNational = ticket ? isNationalTicket(ticket) : false;
  const alreadySubscribed = ticket ? hasActiveSubscription(nationalNumber) : false;

  // Reset state when ticket changes
  useEffect(() => {
    if (!ticket) return;
    setSelectedDrawTypes(defaultDrawTypes(ticket.gameId));
    setQuantity(ticket.metadata?.nationalQuantity ?? 1);
  }, [ticket?.id]);

  function toggleDrawType(dt: SubscriptionDrawType) {
    setSelectedDrawTypes(prev =>
      prev.includes(dt) ? prev.filter(d => d !== dt) : [...prev, dt]
    );
  }

  const pricePerSorteo = selectedDrawTypes.reduce(
    (sum, dt) => sum + DRAW_TYPE_META[dt].unitPrice * quantity,
    0,
  );
  const balance  = profile?.balance ?? 0;
  const isOver   = balance < pricePerSorteo;
  const canAbono = selectedDrawTypes.length > 0 && !alreadySubscribed;

  function handleAbono() {
    if (!ticket || !canAbono) return;

    // Mock: crear abono en estado local
    // BE: POST /api/subscriptions { number, quantity, drawTypes, gameId, sourceTicketId }
    addSubscription(nationalNumber, quantity, selectedDrawTypes);

    toast.success(
      `Abono creado para el ${nationalNumber} · ${selectedDrawTypes.join(', ')} · ${quantity} ${quantity === 1 ? 'décimo' : 'décimos'} por sorteo`,
      { description: 'Ya lo tienes en Mis abonos → Mis números.' }
    );
    onClose();
    navigate('/profile/subscriptions');
  }

  const bal = splitAmount(balance);
  const tot = splitAmount(pricePerSorteo);
  const color = game?.color ?? '#0a4792';

  return (
    <AnimatePresence>
      {ticket && (
        <>
          {/* Backdrop */}
          <motion.div
            key="abonarse-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            key="abonarse-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[88vh] flex-col overflow-hidden rounded-t-[2.5rem] bg-white"
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1.5 w-14 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 px-5 pb-4">
              {game && (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <GameBadge game={game} size="sm" variant="white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crear abono</p>
                <p className="text-[15px] font-black leading-tight text-manises-blue">{game?.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-px shrink-0 bg-slate-100" />

            {/* Body */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">

              {/* ── Juego no soportado ── */}
              {!isNational && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50 px-6 py-10 text-center">
                  <Bell className="h-8 w-8 text-slate-300" />
                  <p className="text-[13px] font-black text-manises-blue">Abonos próximamente</p>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-400">
                    Los abonos de jugadas para este juego estarán disponibles próximamente.
                    Por ahora solo están disponibles para Lotería Nacional.
                  </p>
                </div>
              )}

              {isNational && (
                <>
                  {/* ── Número ── */}
                  <section>
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Número abonado
                    </p>
                    <div
                      className="flex items-center justify-center rounded-2xl border-2 py-4"
                      style={{ borderColor: `${color}30`, background: `${color}06` }}
                    >
                      <span
                        className="font-mono text-[2rem] font-black tracking-[0.18em]"
                        style={{ color }}
                      >
                        {nationalNumber.padStart(5, '0')}
                      </span>
                    </div>
                  </section>

                  {/* ── Ya abonado ── */}
                  {alreadySubscribed && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-[11px] font-black text-amber-800">Este número ya está abonado</p>
                        <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-amber-700">
                          Puedes modificar la configuración desde Mis abonos → Mis números.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Selector de sorteos ── */}
                  {!alreadySubscribed && (
                    <>
                      <section>
                        <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Incluir en sorteos
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {ALL_DRAW_TYPES.map((dt) => {
                            const meta = DRAW_TYPE_META[dt];
                            const active = selectedDrawTypes.includes(dt);
                            return (
                              <button
                                key={dt}
                                type="button"
                                onClick={() => toggleDrawType(dt)}
                                className={cn(
                                  'flex flex-col items-center gap-1 rounded-2xl border-2 py-3 transition-all active:scale-95',
                                  active
                                    ? 'border-transparent text-white shadow-md'
                                    : 'border-slate-100 bg-white text-manises-blue'
                                )}
                                style={active ? { backgroundColor: color, borderColor: color } : undefined}
                              >
                                {active && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white/80" />
                                )}
                                <span className="text-[13px] font-black leading-none">{meta.day}</span>
                                <span className={cn(
                                  'text-[8px] font-bold leading-none',
                                  active ? 'text-white/70' : 'text-slate-400'
                                )}>
                                  {meta.unitPrice === 3 ? '3 €' : `${meta.unitPrice} €`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      {/* ── Cantidad de décimos ── */}
                      <section>
                        <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Décimos por sorteo
                        </p>
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-manises-blue disabled:opacity-30 active:scale-95 transition-transform"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="flex-1 text-center">
                            <p className="text-[26px] font-black text-manises-blue leading-none">{quantity}</p>
                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                              {quantity === 1 ? 'décimo' : 'décimos'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuantity(q => Math.min(10, q + 1))}
                            disabled={quantity >= 10}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-manises-blue/20 bg-manises-blue/8 text-manises-blue disabled:opacity-30 active:scale-95 transition-transform"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </section>

                      {/* ── Resumen por sorteo ── */}
                      {selectedDrawTypes.length > 0 && (
                        <section className="rounded-2xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
                          {selectedDrawTypes.map((dt) => {
                            const meta = DRAW_TYPE_META[dt];
                            return (
                              <div key={dt} className="flex items-center justify-between px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="rounded-full px-2 py-[3px] text-[9px] font-black text-white"
                                    style={{ backgroundColor: color }}
                                  >
                                    {meta.day}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {meta.label} · {quantity} {quantity === 1 ? 'décimo' : 'décimos'}
                                  </span>
                                </div>
                                <span className="text-[13px] font-black text-manises-blue">
                                  {formatCurrency(meta.unitPrice * quantity)}
                                  <span className="text-[9px] font-medium text-slate-400"> /sorteo</span>
                                </span>
                              </div>
                            );
                          })}
                        </section>
                      )}

                      {/* ── Aviso sin cobro automático ── */}
                      <div className="flex items-start gap-2 rounded-xl border border-manises-blue/10 bg-manises-blue/[0.04] px-3.5 py-2.5">
                        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-manises-blue/60" />
                        <p className="text-[10px] font-medium leading-relaxed text-manises-blue/70">
                          Sin cobro automático. Cada sorteo reservado lo pagas manualmente desde Mis abonos cuando quieras.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Barra de pago ── */}
            <div
              className="relative shrink-0 border-t border-white/5 bg-[#0a4792]/88 shadow-[0_-8px_32px_rgba(0,0,0,0.25)] backdrop-blur-3xl"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white">

                {/* Saldo */}
                <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
                  <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
                  <p className={cn('relative text-[1.05rem] font-black leading-none tracking-normal', isOver ? 'text-red-300' : 'text-manises-gold')}>
                    {bal.eur}<sup className="ml-0.5 align-super text-[0.5rem] font-black">,{bal.cts}</sup>
                  </p>
                  <p className="relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/58">Saldo €</p>
                </div>

                {/* Importe primer sorteo */}
                <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
                  <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
                  <p className="relative text-[1.05rem] font-black leading-none tracking-normal text-white">
                    {tot.eur}<sup className="ml-0.5 align-super text-[0.5rem] font-black">,{tot.cts}</sup>
                  </p>
                  <p className={cn('relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em]', isOver ? 'text-red-300' : 'text-white/58')}>
                    {isOver ? `Faltan ${formatCurrency(pricePerSorteo - balance)}` : '1er sorteo €'}
                  </p>
                </div>

                {/* Botón */}
                <button
                  type="button"
                  onClick={handleAbono}
                  disabled={!canAbono}
                  className={cn(
                    'relative m-1.5 flex h-auto min-w-0 items-center justify-center overflow-hidden rounded-xl px-4 text-[0.85rem] font-black leading-none tracking-normal transition-all active:scale-[0.985]',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14),0_0_14px_rgba(245,197,24,0.14)]',
                    canAbono
                      ? 'bg-manises-gold text-manises-blue'
                      : 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
                  )}
                >
                  <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
                  <span className="relative">Abonarme</span>
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
