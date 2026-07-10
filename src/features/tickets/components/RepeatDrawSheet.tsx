import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Repeat2, Shuffle } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { getDrawScheduleConfig } from '@/features/play/config/draw-schedule.config';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import type { Ticket } from '@/shared/types/domain';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_SHORT  = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MON_SHORT  = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function toIso(d: Date) { return d.toISOString().split('T')[0]; }

function getUpcomingDraws(weekdays: number[], maxWeeks: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // mañana
  const limit = new Date(cursor.getTime() + maxWeeks * 7 * 24 * 60 * 60 * 1000);
  while (cursor <= limit && dates.length < 20) {
    if (weekdays.includes(cursor.getDay())) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function splitAmount(n: number) {
  const [eur = '0', cts = '00'] = n.toLocaleString('es-ES', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).split(',');
  return { eur, cts };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface RepeatDrawSheetProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function RepeatDrawSheet({ ticket, onClose }: RepeatDrawSheetProps) {
  const { profile } = useAuth();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [mode, setMode] = useState<'same' | 'random'>('same');

  const game   = ticket ? LOTTERY_GAMES.find(g => g.id === ticket.gameId) ?? null : null;
  const config = ticket ? getDrawScheduleConfig(ticket.gameType) : null;

  const upcomingDraws = useMemo(() => {
    if (!config || config.drawWeekdays.length === 0) return [];
    return getUpcomingDraws(config.drawWeekdays, config.maxWeeksSelectable);
  }, [config]);

  const multiSelect = config?.supportsMultipleDrawSelection ?? false;

  const isNational = ticket
    ? ticket.gameType === 'loteria-nacional' || ticket.gameType === 'navidad' || ticket.gameType === 'nino'
    : false;

  // Reset + auto-select first date when ticket changes
  useEffect(() => {
    setMode('same');
    if (upcomingDraws.length > 0) {
      setSelectedDates([toIso(upcomingDraws[0])]);
    } else {
      setSelectedDates([]);
    }
  }, [ticket?.id, upcomingDraws]);

  const originalDrawCount = ticket
    ? (Array.isArray(ticket.metadata?.orderDrawDates) ? ticket.metadata.orderDrawDates.length : 1)
    : 1;
  const pricePerDraw = ticket ? ticket.price / originalDrawCount : 0;
  const totalPrice   = pricePerDraw * selectedDates.length;
  const balance      = profile?.balance ?? 0;
  const isOver       = balance < totalPrice;
  const canRepeat    = selectedDates.length > 0;

  function toggleDate(iso: string) {
    if (!multiSelect) { setSelectedDates([iso]); return; }
    setSelectedDates(prev =>
      prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso]
    );
  }

  function handleRepeat() {
    toast.success(
      `Repetición enviada · ${selectedDates.length} ${selectedDates.length === 1 ? 'sorteo' : 'sorteos'} · ${mode === 'same' ? 'mismos números' : 'números aleatorios'}`
    );
    onClose();
  }

  const bal = splitAmount(balance);
  const tot = splitAmount(totalPrice);
  const color = game?.color ?? '#0a4792';

  return (
    <AnimatePresence>
      {ticket && (
        <>
          {/* Backdrop */}
          <motion.div
            key="repeat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            key="repeat-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[82vh] flex-col overflow-hidden rounded-t-[2.5rem] bg-white"
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
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Repetir jugada</p>
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

            {/* Scrollable body */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">

              {/* ── Selector de sorteos ── */}
              {upcomingDraws.length > 0 ? (
                <section>
                  <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {multiSelect ? 'Selecciona los sorteos' : 'Selecciona el sorteo'}
                  </p>
                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
                    {upcomingDraws.map((date) => {
                      const iso = toIso(date);
                      const sel = selectedDates.includes(iso);
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => toggleDate(iso)}
                          className={cn(
                            'flex shrink-0 flex-col items-center rounded-2xl border-2 px-3.5 py-2.5 transition-all active:scale-95',
                            sel
                              ? 'border-transparent text-white shadow-md'
                              : 'border-slate-100 bg-white text-manises-blue'
                          )}
                          style={sel ? { backgroundColor: color, borderColor: color } : undefined}
                        >
                          <span className="text-[22px] font-black leading-none">{date.getDate()}</span>
                          <span className={cn(
                            'text-[9px] font-black uppercase tracking-wide leading-none mt-0.5',
                            sel ? 'text-white/80' : 'text-slate-400'
                          )}>
                            {MON_SHORT[date.getMonth()]}
                          </span>
                          <span className={cn(
                            'mt-2 rounded-full px-2 py-[2px] text-[8px] font-black uppercase tracking-wider',
                            sel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          )}>
                            {DAY_SHORT[date.getDay()]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold text-amber-700">No hay sorteos próximos disponibles</p>
                </div>
              )}

              {/* ── Tipo de números (solo juegos numéricos) ── */}
              {!isNational && (
                <section>
                  <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Tipo de combinación
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'same',   label: 'Mismos números', Icon: Repeat2 },
                      { value: 'random', label: 'Aleatorios',     Icon: Shuffle },
                    ] as const).map(({ value, label, Icon }) => {
                      const active = mode === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setMode(value)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-2xl border-2 px-3.5 py-3 text-left transition-all active:scale-[0.97]',
                            active
                              ? 'border-transparent text-white shadow-md'
                              : 'border-slate-100 bg-white text-manises-blue'
                          )}
                          style={active ? { backgroundColor: color, borderColor: color } : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-[11px] font-black">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── Resumen ── */}
              {selectedDates.length > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-manises-blue">
                      {selectedDates.length}{' '}
                      {selectedDates.length === 1 ? 'sorteo' : 'sorteos'}
                      {' · '}
                      {isNational ? 'Mismo número' : mode === 'same' ? 'Mismos números' : 'Números aleatorios'}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                      {formatCurrency(pricePerDraw)} por sorteo
                    </p>
                  </div>
                  <p className="shrink-0 text-[18px] font-black text-manises-blue">{formatCurrency(totalPrice)}</p>
                </div>
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

                {/* Importe */}
                <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
                  <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
                  <p className="relative text-[1.05rem] font-black leading-none tracking-normal text-white">
                    {tot.eur}<sup className="ml-0.5 align-super text-[0.5rem] font-black">,{tot.cts}</sup>
                  </p>
                  <p className={cn('relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em]', isOver ? 'text-red-300' : 'text-white/58')}>
                    {isOver ? `Faltan ${formatCurrency(totalPrice - balance)}` : 'Importe €'}
                  </p>
                </div>

                {/* Botón */}
                <button
                  type="button"
                  onClick={handleRepeat}
                  disabled={!canRepeat}
                  className={cn(
                    'relative m-1.5 flex h-auto min-w-0 items-center justify-center overflow-hidden rounded-xl px-4 text-[0.85rem] font-black leading-none tracking-normal transition-all active:scale-[0.985]',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14),0_0_14px_rgba(245,197,24,0.14)]',
                    canRepeat
                      ? 'bg-manises-gold text-manises-blue'
                      : 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
                  )}
                >
                  <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
                  <span className="relative">Repetir</span>
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
