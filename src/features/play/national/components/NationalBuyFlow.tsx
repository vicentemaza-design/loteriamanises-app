import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavArrowLeft, ShieldCheck, Truck, Spark, EditPencil, Xmark, ShoppingBag } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import type { NationalCartLine, NationalDrawId, NationalSearchState, NationalShowcaseItem } from '../contracts/national-play.contract';
import { useNationalCart } from '../hooks/useNationalCart';
import { getNationalShowcaseItems } from '../mocks/national-showcase.mock';
import { searchNationalShowcase } from '../application/search-national-showcase';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { DecimoQrScanner } from './DecimoQrScanner';

// ── Tipos ────────────────────────────────────────────────────────────────────

type FlowStep = 'sorteo' | 'entrega' | 'metodo' | 'aleatorio' | 'elegir';
type DeliveryMode = 'custody' | 'shipping';
type Metodo = 'aleatorio' | 'elegir';

export interface NationalBuyFlowProps {
  game: LotteryGame;
  drawId: NationalDrawId;
  drawLabel: string;
  drawDates: string[];            // Available dates — empty = skip sorteo step
  effectiveDrawDate: string;
  decimoPrice: number;
  availableBalance: number;
  onSelectDate?: (iso: string) => void;
  onBack: () => void;
  onPersistLines: (lines: NationalCartLine[], mode: DeliveryMode) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatChipDate(iso: string) {
  const d = new Date(iso);
  const wd = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = d.getDate();
  const mo = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
  return { wd, day, mo };
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function StepCard({ icon, title, subtitle, selected, onClick }: {
  icon: ReturnType<typeof ShieldCheck>; title: string; subtitle: string; selected?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98]',
        selected
          ? 'border-manises-blue bg-manises-blue/5 shadow-sm'
          : 'border-slate-200 bg-white hover:border-manises-blue/40'
      )}
    >
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', selected ? 'bg-manises-blue text-white' : 'bg-slate-100 text-slate-500')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[14px] font-black', selected ? 'text-manises-blue' : 'text-slate-700')}>{title}</p>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {selected && <div className="h-5 w-5 rounded-full bg-manises-blue flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-black">✓</span></div>}
    </button>
  );
}

function QtyRow({ label, subtitle, value, onDec, onInc }: {
  label: string; subtitle: string; value: number; onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-manises-blue">{label}</p>
        <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button type="button" onClick={onDec} disabled={value <= 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-[18px] font-black text-slate-400 disabled:opacity-30 hover:border-manises-blue hover:text-manises-blue transition-colors">
          −
        </button>
        <span className="w-8 text-center text-[22px] font-black text-manises-blue">{value}</span>
        <button type="button" onClick={onInc}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-manises-blue text-[18px] font-black text-manises-blue hover:bg-manises-blue/5 transition-colors">
          +
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function NationalBuyFlow({
  game, drawId, drawLabel, drawDates, effectiveDrawDate,
  decimoPrice, availableBalance, onSelectDate, onBack, onPersistLines,
}: NationalBuyFlowProps) {
  const hasSorteo = drawDates.length > 1 && !!onSelectDate;
  const initialStep: FlowStep = hasSorteo ? 'sorteo' : 'entrega';

  const [step, setStep] = useState<FlowStep>(initialStep);
  const [delivery, setDelivery] = useState<DeliveryMode>('custody');
  const [metodo, setMetodo] = useState<Metodo | null>(null);
  const [sameQty, setSameQty] = useState(1);
  const [diffQty, setDiffQty] = useState(0);
  const [searchState, setSearchState] = useState<NationalSearchState>({ query: '', sortBy: 'featured', onlyAvailable: true, minQuantity: 1 });
  const [minAvail, setMinAvail] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);

  const { lines, addOrUpdateLine, removeLine, updateQuantity, clearCart, breakdown } = useNationalCart();

  // Showcase items for "elegir" step
  const allItems = useMemo(() => getNationalShowcaseItems(drawId), [drawId]);
  const filteredItems = useMemo(() => {
    const filtered = minAvail > 0 ? allItems.filter((i) => i.available >= minAvail) : allItems;
    return searchNationalShowcase(filtered, searchState);
  }, [allItems, searchState, minAvail]);

  const luckyItem = useMemo(() => allItems.find((i) => i.available > 0) ?? null, [allItems]);

  const total = breakdown.total;
  const isOverBalance = availableBalance < total;
  const canContinue = step === 'aleatorio' ? (sameQty + diffQty > 0) : lines.length > 0;

  const AVAIL_FILTERS = [0, 10, 20, 30, 50];

  // Lógica de CONTINUAR
  const handleContinue = () => {
    if (step === 'sorteo') { setStep('entrega'); return; }
    if (step === 'entrega') { setStep('metodo'); return; }
    if (step === 'metodo' && metodo) { setStep(metodo); return; }

    if (step === 'aleatorio') {
      // Generar combinaciones aleatorias
      const available = allItems.filter((i) => i.available > 0);
      const picked: NationalShowcaseItem[] = [];
      const shuffled = [...available].sort(() => Math.random() - 0.5);

      if (sameQty > 0 && shuffled[0]) {
        addOrUpdateLine({
          number: shuffled[0].number, drawId, drawLabel,
          drawDates: [effectiveDrawDate], quantity: sameQty,
          unitPrice: decimoPrice, totalPrice: decimoPrice * sameQty,
          deliveryMode: delivery, maxQuantity: shuffled[0].available,
        });
        picked.push(shuffled[0]);
      }
      for (let i = 1; i < diffQty + 1 && i < shuffled.length; i++) {
        if (!picked.find((p) => p.number === shuffled[i].number)) {
          addOrUpdateLine({
            number: shuffled[i].number, drawId, drawLabel,
            drawDates: [effectiveDrawDate], quantity: 1,
            unitPrice: decimoPrice, totalPrice: decimoPrice,
            deliveryMode: delivery, maxQuantity: shuffled[i].available,
          });
          picked.push(shuffled[i]);
        }
      }

      const allLines = [
        ...(sameQty > 0 && shuffled[0] ? [{
          number: shuffled[0].number, drawId, drawLabel, drawDates: [effectiveDrawDate],
          quantity: sameQty, unitPrice: decimoPrice, totalPrice: decimoPrice * sameQty,
          deliveryMode: delivery, maxQuantity: shuffled[0].available,
        }] : []),
        ...picked.slice(1).map((p) => ({
          number: p.number, drawId, drawLabel, drawDates: [effectiveDrawDate],
          quantity: 1, unitPrice: decimoPrice, totalPrice: decimoPrice,
          deliveryMode: delivery, maxQuantity: p.available,
        })),
      ];
      onPersistLines(allLines, delivery);
      return;
    }

    if (step === 'elegir') {
      onPersistLines(lines.map((l) => ({ ...l, deliveryMode: delivery })), delivery);
      clearCart();
      return;
    }
  };

  const handleToggle = (item: NationalShowcaseItem) => {
    const existing = lines.find((l) => l.number === item.number && l.drawId === item.drawId);
    if (existing) {
      removeLine(item.number, item.drawId);
    } else {
      addOrUpdateLine({
        number: item.number, drawId: item.drawId, drawLabel: item.drawLabel,
        drawDates: [effectiveDrawDate], quantity: 1,
        unitPrice: item.decimoPrice, totalPrice: item.decimoPrice,
        deliveryMode: delivery, maxQuantity: item.available,
      });
    }
  };

  const stepTitle: Record<FlowStep, string> = {
    sorteo: 'Elige el sorteo',
    entrega: '¿Cómo quieres recibir tus décimos?',
    metodo: '¿Cómo quieres obtener tus números?',
    aleatorio: '¿Cuántos décimos quieres?',
    elegir: 'Elige tus números',
  };

  const goBack = () => {
    if (step === 'entrega') { hasSorteo ? setStep('sorteo') : onBack(); return; }
    if (step === 'metodo') { setStep('entrega'); return; }
    if (step === 'aleatorio' || step === 'elegir') { setStep('metodo'); setMetodo(null); return; }
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-3 py-2 text-white shadow-lg"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})`,
          minHeight: 'calc(env(safe-area-inset-top, 0px) + 56px)',
        }}
      >
        <button type="button" onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all">
          <NavArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black leading-tight">{game.name}</p>
          <p className="text-[10px] text-white/70 font-medium">{stepTitle[step]}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-32" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

            {/* PASO 1 — SORTEO */}
            {step === 'sorteo' && (
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Sorteo disponibles</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {drawDates.map((iso) => {
                    const { wd, day, mo } = formatChipDate(iso);
                    const sel = iso === effectiveDrawDate;
                    return (
                      <button key={iso} type="button" onClick={() => onSelectDate?.(iso)}
                        className={cn('flex shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-all', sel ? 'border-transparent text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
                        style={sel ? { backgroundColor: game.color } : undefined}>
                        <span className="text-[11px] font-semibold uppercase">{wd}</span>
                        <span className="text-[20px] font-bold leading-tight">{day}</span>
                        <span className="text-[11px] font-semibold uppercase">{mo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 2 — ENTREGA */}
            {step === 'entrega' && (
              <div className="space-y-3">
                <div key="custody">
                  <StepCard
                    icon={<ShieldCheck className="h-6 w-6" />}
                    title="Custodia digital"
                    subtitle="Los décimos se guardan en tu cuenta. Consulta en 'Mis jugadas'."
                    selected={delivery === 'custody'}
                    onClick={() => setDelivery('custody')}
                  />
                </div>
                <div key="shipping">
                  <StepCard
                    icon={<Truck className="h-6 w-6" />}
                    title="Envío a domicilio"
                    subtitle="Recibes los décimos físicos en casa. Gastos de envío incluidos."
                    selected={delivery === 'shipping'}
                    onClick={() => setDelivery('shipping')}
                  />
                </div>
              </div>
            )}

            {/* PASO 3 — MÉTODO */}
            {step === 'metodo' && (
              <div className="space-y-3">
                <div key="aleatorio">
                  <StepCard
                    icon={<Spark className="h-6 w-6" />}
                    title="Aleatorio"
                    subtitle="Elegimos nosotros el número o números para ti."
                    selected={metodo === 'aleatorio'}
                    onClick={() => setMetodo('aleatorio')}
                  />
                </div>
                <div key="elegir">
                  <StepCard
                    icon={<EditPencil className="h-6 w-6" />}
                    title="Elegir número"
                    subtitle="Escoge tú el número concreto o la terminación."
                    selected={metodo === 'elegir'}
                    onClick={() => setMetodo('elegir')}
                  />
                </div>
              </div>
            )}

            {/* PASO 4a — ALEATORIO: CANTIDAD */}
            {step === 'aleatorio' && (
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Elige cuántos décimos quieres</p>
                <QtyRow
                  label="Décimos del mismo número"
                  subtitle={sameQty === 0 ? 'No seleccionado' : `${sameQty} décimo${sameQty !== 1 ? 's' : ''} del mismo número`}
                  value={sameQty}
                  onDec={() => setSameQty((q) => Math.max(0, q - 1))}
                  onInc={() => setSameQty((q) => Math.min(50, q + 1))}
                />
                <QtyRow
                  label="Décimos de distintos números"
                  subtitle={diffQty === 0 ? 'No seleccionado' : `${diffQty} número${diffQty !== 1 ? 's' : ''} diferente${diffQty !== 1 ? 's' : ''}`}
                  value={diffQty}
                  onDec={() => setDiffQty((q) => Math.max(0, q - 1))}
                  onInc={() => setDiffQty((q) => Math.min(50, q + 1))}
                />
                {(sameQty + diffQty) > 0 && (
                  <div className="rounded-xl bg-manises-blue/5 border border-manises-blue/15 px-4 py-3 text-center">
                    <p className="text-[13px] font-black text-manises-blue">
                      Total: {sameQty + diffQty} décimo{(sameQty + diffQty) !== 1 ? 's' : ''} · {formatCurrency((sameQty + diffQty) * decimoPrice)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PASO 4b — ELEGIR NÚMERO */}
            {step === 'elegir' && (
              <div className="space-y-3">
                {/* Buscador + QR */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <NationalSearchBar
                      searchState={searchState}
                      onChange={setSearchState}
                    />
                  </div>
                </div>

                {/* Filtros de disponibilidad */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {AVAIL_FILTERS.map((f) => (
                    <button key={f} type="button" onClick={() => setMinAvail(f)}
                      className={cn('shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all',
                        minAvail === f ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-500')
                      }
                      style={minAvail === f ? { backgroundColor: game.color } : undefined}>
                      {f === 0 ? 'TODOS' : `+${f}`}
                    </button>
                  ))}
                </div>

                {/* Décimo de la Suerte */}
                {luckyItem && searchState.query === '' && (
                  <button type="button" onClick={() => handleToggle(luckyItem)}
                    className={cn('w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all text-left',
                      lines.find((l) => l.number === luckyItem.number) ? 'border-manises-gold bg-manises-gold/10' : 'border-manises-gold/40 bg-white')}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-manises-gold text-manises-blue text-[18px] font-black">✦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-wider text-manises-gold">Décimo de la Suerte</p>
                      <p className="text-[16px] font-black text-manises-blue">{luckyItem.number}</p>
                      <p className="text-[10px] text-slate-400">{luckyItem.stockLabel} · {formatCurrency(luckyItem.decimoPrice)}</p>
                    </div>
                    <span className="shrink-0 text-[12px] font-black text-manises-gold">Añadir {formatCurrency(luckyItem.decimoPrice)}</span>
                  </button>
                )}

                {/* Listado */}
                <NationalNumberShowcase
                  items={filteredItems}
                  cartLines={lines}
                  onToggle={handleToggle}
                  onIncrement={(number, dId) => updateQuantity(number, dId, 1)}
                  onDecrement={(number, dId) => updateQuantity(number, dId, -1)}
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carrusel de seleccionados (solo paso elegir) */}
      {step === 'elegir' && lines.length > 0 && (
        <div className="fixed left-0 right-0 z-[45] bg-white/95 border-t border-slate-200/60 backdrop-blur-xl px-4 py-2"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
          <div className="flex items-center gap-2 overflow-x-auto">
            {lines.map((line) => (
              <div key={`${line.drawId}-${line.number}`}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-manises-blue/8 border border-manises-blue/20 px-2.5 py-1.5">
                <span className="text-[12px] font-black text-manises-blue">{line.number}</span>
                {line.quantity > 1 && <span className="text-[9px] font-black text-manises-blue/60">×{line.quantity}</span>}
                <button type="button" onClick={() => removeLine(line.number, line.drawId)} className="text-slate-400 hover:text-red-400 transition-colors">
                  <Xmark className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra inferior fija */}
      <div
        className="fixed left-0 right-0 z-50 border-t border-slate-200/60 bg-white/95 backdrop-blur-xl"
        style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Saldo actual</p>
            <p className={cn('text-[15px] font-black', isOverBalance ? 'text-red-500' : 'text-manises-blue')}>
              {formatCurrency(availableBalance)}
            </p>
          </div>
          {(step === 'aleatorio' || step === 'elegir') && (
            <div className="text-center min-w-0 px-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Importe</p>
              <p className="text-[15px] font-black text-manises-blue">
                {step === 'aleatorio'
                  ? formatCurrency((sameQty + diffQty) * decimoPrice)
                  : formatCurrency(total)}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleContinue}
            disabled={
              (step === 'metodo' && !metodo) ||
              (step === 'aleatorio' && (sameQty + diffQty) === 0) ||
              (step === 'elegir' && lines.length === 0)
            }
            className="flex items-center gap-2 rounded-2xl bg-manises-blue px-5 py-3 text-[13px] font-black text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {(step === 'aleatorio' || step === 'elegir') && <ShoppingBag className="h-4 w-4" />}
            {step === 'aleatorio' || step === 'elegir'
              ? `${step === 'aleatorio' ? sameQty + diffQty : breakdown.totalDecimos} décimo${(step === 'aleatorio' ? sameQty + diffQty : breakdown.totalDecimos) !== 1 ? 's' : ''} · Continuar`
              : 'Continuar'}
          </button>
        </div>
      </div>

      <DecimoQrScanner isOpen={qrOpen} onClose={() => setQrOpen(false)} onScan={(d) => { setSearchState((s) => ({ ...s, query: d })); setQrOpen(false); }} />
    </div>
  );
}
