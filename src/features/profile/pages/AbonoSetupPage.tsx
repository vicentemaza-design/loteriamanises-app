import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Shield, Lock, Check,
  Lightbulb, Minus, Plus, AlertCircle, Search,
} from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { toast } from 'sonner';
import type { SubscriptionDrawType } from '@/features/profile/data/subscriptionsDemo';

// ── Domain config ─────────────────────────────────────────────────────────────

const DRAW_META: Record<SubscriptionDrawType, {
  label: string; short: string; color: string; unitPrice: number;
  nextDate: string; nextLabel: string;
}> = {
  JUE:   { label: 'Jueves',  short: 'J', color: '#0a4792', unitPrice: 3,  nextDate: '2026-07-17', nextLabel: 'Jue. 17 jul. 2026' },
  'SÁB': { label: 'Sábado',  short: 'S', color: '#059669', unitPrice: 3,  nextDate: '2026-07-12', nextLabel: 'Sáb. 12 jul. 2026' },
  NAV:   { label: 'Navidad', short: 'N', color: '#dc2626', unitPrice: 20, nextDate: '2026-12-22', nextLabel: 'Mar. 22 dic. 2026' },
  'NIÑ': { label: 'El Niño', short: 'Ñ', color: '#d97706', unitPrice: 20, nextDate: '2027-01-06', nextLabel: 'Mié. 6 ene. 2027' },
};

const ALL_DRAW_TYPES: SubscriptionDrawType[] = ['JUE', 'SÁB', 'NAV', 'NIÑ'];

// ── Mock data (BE: GET /api/subscriptions/available-numbers) ──────────────────

interface AvailableNumber {
  number: string;
  availableDrawTypes: SubscriptionDrawType[];
  maxQty: number;
}

const MOCK_AVAILABLE: AvailableNumber[] = [
  { number: '03421', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '05132', availableDrawTypes: ['JUE', 'SÁB', 'NAV'],        maxQty: 5  },
  { number: '07865', availableDrawTypes: ['JUE'],                       maxQty: 8  },
  { number: '10295', availableDrawTypes: ['JUE'],                       maxQty: 3  },
  { number: '11480', availableDrawTypes: ['JUE', 'SÁB', 'NAV', 'NIÑ'], maxQty: 10 },
  { number: '14037', availableDrawTypes: ['NAV', 'NIÑ'],                maxQty: 6  },
  { number: '18903', availableDrawTypes: ['JUE', 'SÁB', 'NAV', 'NIÑ'], maxQty: 5  },
  { number: '21566', availableDrawTypes: ['SÁB'],                       maxQty: 10 },
  { number: '23190', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 7  },
  { number: '25874', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '28341', availableDrawTypes: ['NAV'],                       maxQty: 5  },
  { number: '30718', availableDrawTypes: ['NAV', 'NIÑ'],                maxQty: 10 },
  { number: '33052', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '36489', availableDrawTypes: ['JUE', 'SÁB', 'NAV'],        maxQty: 4  },
  { number: '40127', availableDrawTypes: ['SÁB', 'NAV'],                maxQty: 8  },
  { number: '41893', availableDrawTypes: ['JUE'],                       maxQty: 10 },
  { number: '45670', availableDrawTypes: ['JUE', 'SÁB', 'NAV', 'NIÑ'], maxQty: 10 },
  { number: '48205', availableDrawTypes: ['NAV', 'NIÑ'],                maxQty: 7  },
  { number: '51374', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '54918', availableDrawTypes: ['JUE', 'SÁB', 'NAV', 'NIÑ'], maxQty: 3  },
  { number: '58630', availableDrawTypes: ['SÁB'],                       maxQty: 10 },
  { number: '61742', availableDrawTypes: ['NAV'],                       maxQty: 5  },
  { number: '63085', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '67254', availableDrawTypes: ['SÁB', 'NAV'],                maxQty: 7  },
  { number: '70391', availableDrawTypes: ['JUE', 'SÁB', 'NAV'],        maxQty: 6  },
  { number: '72436', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '75819', availableDrawTypes: ['NIÑ'],                       maxQty: 8  },
  { number: '78264', availableDrawTypes: ['JUE', 'SÁB', 'NAV', 'NIÑ'], maxQty: 5  },
  { number: '80543', availableDrawTypes: ['JUE'],                       maxQty: 10 },
  { number: '82017', availableDrawTypes: ['SÁB', 'NAV'],                maxQty: 9  },
  { number: '85362', availableDrawTypes: ['JUE', 'SÁB'],               maxQty: 10 },
  { number: '89013', availableDrawTypes: ['NAV', 'NIÑ'],                maxQty: 8  },
  { number: '91476', availableDrawTypes: ['JUE', 'SÁB', 'NAV'],        maxQty: 5  },
  { number: '94728', availableDrawTypes: ['JUE'],                       maxQty: 10 },
  { number: '97053', availableDrawTypes: ['NAV', 'NIÑ'],                maxQty: 6  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

type DrawQtys = Partial<Record<SubscriptionDrawType, number>>;
type Step = 1 | 2 | 3;

function activeDraws(qtys: DrawQtys): SubscriptionDrawType[] {
  return ALL_DRAW_TYPES.filter(dt => (qtys[dt] ?? 0) > 0);
}

function firstUpcoming(qtys: DrawQtys): SubscriptionDrawType | null {
  const a = activeDraws(qtys);
  if (!a.length) return null;
  return a.reduce((min, dt) =>
    DRAW_META[dt].nextDate < DRAW_META[min].nextDate ? dt : min,
  );
}

function initQtys(avail: SubscriptionDrawType[]): DrawQtys {
  const out: DrawQtys = {};
  avail.forEach(dt => { out[dt] = 1; });
  return out;
}

// ── DrawTypeBadge ─────────────────────────────────────────────────────────────

function DrawTypeBadge({ type, xs = false }: React.HTMLAttributes<HTMLSpanElement> & { type: SubscriptionDrawType; xs?: boolean }) {
  const m = DRAW_META[type];
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-black text-white',
        xs ? 'h-5 w-5 text-[8px]' : 'h-6 w-6 text-[10px]',
      )}
      style={{ backgroundColor: m.color }}
    >
      {m.short}
    </span>
  );
}

// ── Step 1: Elige tu número ───────────────────────────────────────────────────

function StepSelectNumber({ onSelect }: { onSelect: (n: string, avail: SubscriptionDrawType[], maxQty: number) => void }) {
  const [search, setSearch] = useState('');
  const [filterDraw, setFilterDraw] = useState<SubscriptionDrawType | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = MOCK_AVAILABLE.filter(item => {
    const matchSearch = !search || item.number.includes(search.trim());
    const matchDraw = !filterDraw || item.availableDrawTypes.includes(filterDraw);
    return matchSearch && matchDraw;
  });

  function toggleSearch() {
    if (searchOpen) setSearch('');
    setSearchOpen(v => !v);
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-manises-blue px-5 py-5 text-white">
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -right-2 top-0 h-16 w-16 rounded-full bg-white/[0.04]" />
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-3.5 w-3.5 text-manises-gold" />
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-manises-gold">Reserva preferente</p>
        </div>
        <p className="text-[17px] font-black leading-tight">
          {filtered.length} número{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
        <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-white/65">
          Elige el tuyo y configura los sorteos a los que deseas abonarte.
        </p>
      </div>

      {/* Filter chips + lupa */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {([null, 'JUE', 'SÁB', 'NAV', 'NIÑ'] as (SubscriptionDrawType | null)[]).map(dt => {
            const active = filterDraw === dt;
            const label = dt === null ? 'Todos' : DRAW_META[dt].label;
            const color = dt ? DRAW_META[dt].color : '#0a4792';
            return (
              <button
                key={dt ?? 'all'}
                type="button"
                onClick={() => setFilterDraw(dt)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-[11px] font-black transition-all',
                  active ? 'text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-500',
                )}
                style={active ? { backgroundColor: color } : undefined}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={toggleSearch}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 transition-all',
              searchOpen || search
                ? 'border-manises-blue bg-manises-blue text-white'
                : 'border-slate-200 bg-white text-slate-500',
            )}
          >
            <Search className="h-3 w-3" />
            <span className="text-[11px] font-black">Buscar</span>
          </button>
        </div>

        {/* Expandable search input */}
        <div className={cn(
          'overflow-hidden transition-all duration-200',
          searchOpen ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        )}>
          <input
            type="text"
            inputMode="numeric"
            value={search}
            onChange={e => setSearch(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Escribe el número..."
            autoFocus={searchOpen}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-mono font-black text-manises-blue placeholder:font-sans placeholder:font-medium placeholder:text-slate-400 focus:border-manises-blue/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Number list */}
      <div className="flex flex-col gap-1.5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[12px] font-medium text-slate-400">
            No hay números con ese criterio.
          </p>
        ) : filtered.map((item) => (
          <button
            key={item.number}
            type="button"
            onClick={() => onSelect(item.number, item.availableDrawTypes, item.maxQty)}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-left shadow-[0_1px_4px_rgba(15,23,42,0.05)] transition-colors active:bg-slate-50/80"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[22px] font-black text-manises-blue tracking-[0.1em] leading-none">
                {item.number}
              </p>
              <p className="mt-0.5 text-[9.5px] font-semibold text-slate-400 leading-none">
                {item.availableDrawTypes.map(dt => DRAW_META[dt].label).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {item.availableDrawTypes.map(dt => <DrawTypeBadge key={dt} type={dt} xs />)}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Configurar abono ──────────────────────────────────────────────────

function StepConfigure({
  number, availableDrawTypes, maxQty, qtys, onQty,
}: {
  number: string;
  availableDrawTypes: SubscriptionDrawType[];
  maxQty: number;
  qtys: DrawQtys;
  onQty: (dt: SubscriptionDrawType, qty: number) => void;
}) {
  const active = activeDraws(qtys);
  const firstDraw = firstUpcoming(qtys);
  const firstMeta = firstDraw ? DRAW_META[firstDraw] : null;
  const firstTotal = firstDraw ? (qtys[firstDraw] ?? 0) * firstMeta!.unitPrice : 0;

  const weeklyDecimos = active
    .filter(dt => dt === 'JUE' || dt === 'SÁB')
    .reduce((s, dt) => s + (qtys[dt] ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">

      {/* Number + availability header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1.5">Número seleccionado</p>
            <p className="font-mono text-[24px] font-black text-manises-blue tracking-[0.1em] leading-none">{number}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1.5">Disponible para:</p>
            <div className="flex flex-col gap-1">
              {ALL_DRAW_TYPES.map(dt => {
                const avail = availableDrawTypes.includes(dt);
                const on = (qtys[dt] ?? 0) > 0;
                return (
                  <div key={dt} className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      avail && on ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200 bg-white',
                    )}>
                      {avail && on && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                    </span>
                    <span className={cn(
                      'text-[10px] font-semibold',
                      avail ? 'text-manises-blue' : 'text-slate-300',
                    )}>
                      {DRAW_META[dt].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Per-draw steppers */}
      <div className="flex flex-col gap-1.5">
        {ALL_DRAW_TYPES.map(dt => {
          const avail = availableDrawTypes.includes(dt);
          const qty = qtys[dt] ?? 0;
          const meta = DRAW_META[dt];
          return (
            <div
              key={dt}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all',
                !avail ? 'border-slate-100 bg-slate-50/50' : qty > 0
                  ? 'border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)]'
                  : 'border-slate-100 bg-white',
              )}
            >
              {/* Badge + name */}
              <DrawTypeBadge type={dt} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-[12px] font-black leading-none',
                  avail ? 'text-manises-blue' : 'text-slate-300',
                )}>
                  {meta.label}
                </p>
                {avail && (
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5 leading-none">
                    {formatCurrency(meta.unitPrice)} por sorteo
                  </p>
                )}
              </div>

              {/* Right side */}
              {!avail ? (
                <span className="rounded-lg border border-slate-100 bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  No disponible
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onQty(dt, Math.max(0, qty - 1))}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl border text-manises-blue transition-all active:scale-90',
                      qty <= 0 ? 'border-slate-100 bg-slate-50 text-slate-300' : 'border-manises-blue/20 bg-manises-blue/5',
                    )}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className={cn(
                    'w-6 text-center text-[16px] font-black tabular-nums leading-none',
                    qty > 0 ? 'text-manises-blue' : 'text-slate-300',
                  )}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQty(dt, Math.min(maxQty, qty + 1))}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl border border-manises-blue/20 bg-manises-blue/5 text-manises-blue transition-all active:scale-90',
                      qty >= maxQty && 'opacity-30',
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary card */}
      {active.length > 0 && (
        <div className="rounded-2xl border border-manises-blue/10 bg-manises-blue/[0.03] p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-manises-blue/50 mb-2">
            Resumen del abono
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Número</p>
              <p className="font-mono text-[15px] font-black text-manises-blue tracking-wider">{number}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Sorteos activos</p>
              <div className="flex items-center gap-1 flex-wrap">
                {active.map(dt => <DrawTypeBadge key={dt} type={dt} xs />)}
              </div>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {active.filter(dt => dt === 'JUE' || dt === 'SÁB').length > 0 ? 'Déc. / semana' : 'Décimos'}
              </p>
              <p className="text-[15px] font-black text-manises-blue">
                {active.reduce((s, dt) => s + (qtys[dt] ?? 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* First charge estimate */}
      {firstMeta && firstTotal > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${firstMeta.color}15` }}
            >
              <DrawTypeBadge type={firstDraw!} xs />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Primer cargo estimado</p>
              <p className="text-[11px] font-bold text-manises-blue mt-0.5">{firstMeta.nextLabel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400">Importe del primer pedido</p>
            <p className="text-[15px] font-black text-manises-blue">{formatCurrency(firstTotal)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Confirmar pedido y abono ─────────────────────────────────────────

function StepConfirm({
  number,
  qtys,
  availableDrawTypes,
}: {
  number: string;
  qtys: DrawQtys;
  availableDrawTypes: SubscriptionDrawType[];
}) {
  const firstDraw = firstUpcoming(qtys);
  if (!firstDraw) return null;
  const meta = DRAW_META[firstDraw];
  const qty = qtys[firstDraw] ?? 0;
  const amount = qty * meta.unitPrice;

  return (
    <div className="flex flex-col gap-5">

      {/* Activation banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Shield className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[11px] font-black text-emerald-800 leading-snug">
            Tu abono se activará una vez confirmemos la compra del primer sorteo.
          </p>
          <p className="mt-1.5 text-[10px] font-medium text-emerald-700 leading-relaxed">
            A partir de ese momento, las renovaciones se realizarán automáticamente.
          </p>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <p className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 border-b border-slate-100">
          Resumen del primer pedido
        </p>
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Número</p>
            <p className="font-mono text-[20px] font-black text-manises-blue tracking-widest">{number}</p>
          </div>
          <div className="p-4 border-b border-slate-100">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sorteo</p>
            <div className="flex items-center gap-2">
              <DrawTypeBadge type={firstDraw} />
              <p className="text-[13px] font-black text-manises-blue">{meta.label}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cantidad</p>
            <p className="text-[13px] font-black text-manises-blue">{qty} {qty === 1 ? 'décimo' : 'décimos'}</p>
          </div>
          <div className="p-4">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Importe</p>
            <p className="text-[16px] font-black text-manises-blue">{formatCurrency(amount)}</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">¿Cómo funciona?</p>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            'Realizamos la compra del sorteo seleccionado.',
            'Cuando esté confirmado, tu abono quedará activo.',
            'Renovaremos automáticamente según la configuración elegida.',
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 stroke-[3]" />
              <span className="text-[10.5px] font-medium text-amber-800 leading-snug">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Active draws reminder */}
      {activeDraws(qtys).length > 1 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-manises-blue/10 bg-manises-blue/[0.03] px-4 py-3">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-manises-blue/50" />
          <p className="text-[10px] font-medium text-manises-blue/70 leading-relaxed">
            Los sorteos restantes ({activeDraws(qtys).filter(dt => dt !== firstDraw).map(dt => DRAW_META[dt].label).join(', ')}) se reservarán automáticamente a partir de la primera confirmación.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const STEP_TITLES: Record<Step, string> = {
  1: 'Elige tu número',
  2: 'Configurar abono',
  3: 'Confirmar pedido',
};

export function AbonoSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledNumber = searchParams.get('number');
  const prefilledAvail  = searchParams.get('draws')?.split(',') as SubscriptionDrawType[] | undefined;

  const { addSubscription, hasActiveSubscription } = useSubscriptions();

  const initialStep: Step = prefilledNumber ? 2 : 1;
  const [step, setStep]           = useState<Step>(initialStep);
  const [number, setNumber]       = useState<string | null>(prefilledNumber);
  const [maxQty, setMaxQty]       = useState(10);
  const [availDraws, setAvailDraws] = useState<SubscriptionDrawType[]>(
    prefilledAvail?.length ? prefilledAvail : (prefilledNumber ? ALL_DRAW_TYPES : []),
  );
  const [qtys, setQtys]           = useState<DrawQtys>(
    prefilledNumber ? initQtys(prefilledAvail?.length ? prefilledAvail : ALL_DRAW_TYPES) : {},
  );
  const [terms2, setTerms2]       = useState(false);
  const [terms3, setTerms3]       = useState(false);

  function handleSelectNumber(n: string, avail: SubscriptionDrawType[], mq: number) {
    setNumber(n);
    setAvailDraws(avail);
    setMaxQty(mq);
    setQtys(initQtys(avail));
    setTerms2(false);
    setStep(2);
  }

  function handleBack() {
    if (step > 1) { setTerms2(false); setTerms3(false); setStep((s) => (s - 1) as Step); }
    else navigate(-1);
  }

  function handleContinue() {
    setTerms3(false);
    setStep(3);
  }

  function handleConfirm() {
    if (!number) return;
    const active = activeDraws(qtys);
    // BE: POST /api/subscriptions + POST /api/subscriptions/:id/confirm-first-draw
    addSubscription(number, qtys[active[0]] ?? 1, active);
    toast.success(
      `Abono creado — número ${number}`,
      { description: `Sorteos: ${active.map(dt => DRAW_META[dt].label).join(', ')}` },
    );
    navigate('/profile/subscriptions', { replace: true });
  }

  const firstDraw = firstUpcoming(qtys);
  const active    = activeDraws(qtys);
  const alreadySub = number ? hasActiveSubscription(number) : false;
  const canContinue = step === 2
    ? terms2 && active.length > 0 && !alreadySub
    : terms3 && !!firstDraw;

  return (
    <div className="min-h-full bg-background">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-manises-blue transition-transform active:scale-90"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          </button>

          <h1 className="flex-1 text-center text-[13px] font-black text-manises-blue uppercase tracking-wider">
            {STEP_TITLES[step]}
          </h1>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {([1, 2, 3] as Step[]).map(s => (
              <span
                key={s}
                className={cn(
                  'rounded-full transition-all',
                  s === step ? 'h-2 w-4 bg-manises-blue' :
                  s < step  ? 'h-2 w-2 bg-manises-blue/30' :
                               'h-2 w-2 bg-slate-200',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="p-4 pb-8">
        {step === 1 && <StepSelectNumber onSelect={handleSelectNumber} />}

        {step === 2 && number && (
          <div className="flex flex-col gap-3">
            <StepConfigure
              number={number}
              availableDrawTypes={availDraws}
              maxQty={maxQty}
              qtys={qtys}
              onQty={(dt, qty) => setQtys(prev => ({ ...prev, [dt]: qty }))}
            />

            {/* Already subscribed warning */}
            {alreadySub && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-[10px] font-semibold text-amber-800">
                  Este número ya tiene un abono activo. Puedes gestionarlo en Mis abonos.
                </p>
              </div>
            )}

            {/* T&C */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <span
                onClick={() => setTerms2(v => !v)}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                  terms2 ? 'border-manises-blue bg-manises-blue text-white' : 'border-slate-300 bg-white',
                )}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span className="text-[10.5px] font-medium leading-relaxed text-slate-500">
                He leído y acepto las{' '}
                <span onClick={() => navigate('/legal/condiciones-abonos')} className="font-bold text-manises-blue underline underline-offset-2 cursor-pointer">condiciones del servicio de abonos</span>.
              </span>
            </label>

            {/* CTA */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-black uppercase tracking-wider transition-all active:scale-[0.99]',
                canContinue
                  ? 'bg-manises-blue text-white shadow-md shadow-manises-blue/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && number && (
          <div className="flex flex-col gap-3">
            <StepConfirm number={number} qtys={qtys} availableDrawTypes={availDraws} />

            {/* T&C */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <span
                onClick={() => setTerms3(v => !v)}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                  terms3 ? 'border-manises-blue bg-manises-blue text-white' : 'border-slate-300 bg-white',
                )}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span className="text-[10.5px] font-medium leading-relaxed text-slate-500">
                He leído y acepto las{' '}
                <span onClick={() => navigate('/legal/condiciones-abonos')} className="font-bold text-manises-blue underline underline-offset-2 cursor-pointer">condiciones del servicio de abonos</span>.
              </span>
            </label>

            {/* CTA */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canContinue}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-black uppercase tracking-wider transition-all active:scale-[0.99]',
                canContinue
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              {canContinue && <Lock className="h-4 w-4" />}
              Comprar primer sorteo y solicitar abono
            </button>

            <p className="text-center text-[9px] font-medium text-slate-400">
              Pago 100 % seguro. Tu pedido se tramita como una compra normal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
