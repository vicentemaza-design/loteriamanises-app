import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavArrowLeft, Spark, NavArrowUp, NavArrowDown, Trash, Star, ShieldCheck, Truck, Lock, Xmark, WarningTriangle } from 'iconoir-react/regular';
import {
  Check, Loader2, CreditCard, Search,
  CheckCircle2, ArrowRight, Eye, ShoppingCart, Smartphone, Landmark, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { AbonarseModal } from '@/features/session/components/lottery/AbonarseModal';
import { Button } from '@/shared/ui/Button';
import { cn, formatCurrency } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SHIPPING_COST = 12;

function isAbonable(number: string): boolean {
  return ['0', '2', '5'].includes(number.slice(-1));
}

function formatDrawDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function TicketMockupModal({ number, onClose }: { number: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">DÉCIMO</p>
              <p className="font-mono text-[22px] font-black tracking-[0.18em] text-manises-blue">{number}</p>
            </div>
            <button type="button" onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
              <Xmark className="h-4 w-4" />
            </button>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <NationalTicketThumbnail drawId="navidad" className="w-full" />
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 text-center">
              <span className="font-mono text-[22px] font-black tracking-[0.2em] text-gray-900">{number}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'selection' | 'cart' | 'recharge' | 'processing';
type DeliveryMode = 'custody' | 'shipping';

interface CartItem {
  number: string;
  serie?: string;
  fraccion?: string;
  quantity: number;
  unitPrice: number;
  deliveryMode: DeliveryMode;
  maxQuantity: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NavidadCheckoutFlowProps {
  game: LotteryGame;
  showcaseItems: NationalShowcaseItem[];
  availableBalance: number;
  drawDate: string;
  initialDeliveryMode?: DeliveryMode;
  onTopUp: (amount: number) => Promise<void>;
  onGoToTickets: () => void;
}

// ─── Navidad décimo mini-card ─────────────────────────────────────────────────

function NavidadDecimoCard({ number, compact }: { number: string; active?: boolean; compact?: boolean }) {
  return (
    <div className="relative shrink-0">
      <NationalTicketThumbnail
        drawId="navidad"
        number={number}
        className={compact ? 'w-14 shadow-sm' : 'w-[88px] shadow-sm'}
      />
      {!compact && (
        <div className="absolute inset-x-0 bottom-0 rounded-b-md bg-black/55 py-1 text-center">
          <span className="font-mono text-[10px] font-black tracking-widest text-white leading-none">
            {number}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Recharge inline view ─────────────────────────────────────────────────────

const RECHARGE_AMOUNTS = [5, 10, 20, 50, 100, 200];
type PayMethod = 'apple' | 'bizum' | 'card' | 'transfer';

const BANK_TRANSFER_INFO: Record<string, string> = {
  IBAN: 'ES91 2100 0418 4502 0005 1332',
  Titular: 'Administración Lotería nº 3 Manises',
  Banco: 'CaixaBank',
  Concepto: 'REF-RECARGA-2026',
};

interface RechargeViewProps {
  currentBalance: number;
  neededAmount: number;
  onBack: () => void;
  onSuccess: (amount: number) => Promise<void>;
}

function RechargeView({ currentBalance, neededAmount, onBack, onSuccess }: RechargeViewProps) {
  const shortfall = Math.max(0, neededAmount - currentBalance);
  const defaultAmount = RECHARGE_AMOUNTS.find(a => a >= shortfall) ?? RECHARGE_AMOUNTS[RECHARGE_AMOUNTS.length - 1];
  const [selected, setSelected] = useState(defaultAmount);
  const [method, setMethod] = useState<PayMethod>('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRecharge = async () => {
    if (method === 'transfer') {
      toast.info('Realiza la transferencia con los datos indicados. El saldo se actualizará en 72 h hábiles.');
      return;
    }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await onSuccess(selected);
      setIsSuccess(true);
      setTimeout(() => onBack(), 1400);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-10 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Saldo añadido</p>
          <p className="mt-1 text-2xl font-black text-manises-blue">+{formatCurrency(selected)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-manises-blue/5 px-4 py-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-manises-blue" />
          <p className="text-[12px] font-black text-manises-blue">Volviendo a tu cesta…</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Paso 1 de 2 — recordatorio permanente */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Paso 1 de 2 · Recargar saldo</p>
          <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-amber-700">
            Cuando termines, vuelve y pulsa <span className="font-black">"Comprar"</span> para confirmar tu pedido de Navidad.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
        >
          <NavArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recargar saldo</p>
          <p className="text-sm font-black text-manises-blue">Te faltan {formatCurrency(shortfall)}</p>
        </div>
      </div>

      {/* Balance info */}
      <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex-1 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saldo actual</p>
          <p className="mt-0.5 text-lg font-black text-manises-blue">{formatCurrency(currentBalance)}</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="flex-1 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total pedido</p>
          <p className="mt-0.5 text-lg font-black text-manises-blue">{formatCurrency(neededAmount)}</p>
        </div>
      </div>

      {/* Amount selector */}
      <div>
        <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Importe</p>
        <div className="grid grid-cols-3 gap-2">
          {RECHARGE_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => setSelected(a)}
              className={cn(
                'rounded-xl border-2 py-2.5 text-sm font-black transition-all',
                selected === a
                  ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                  : 'border-slate-200 bg-white text-manises-blue hover:border-manises-blue/30'
              )}
            >
              {formatCurrency(a)}
            </button>
          ))}
        </div>
      </div>

      {/* Method */}
      <div>
        <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Método de pago</p>
        <div className="space-y-2">
          {([
            {
              id: 'apple' as PayMethod, label: 'Apple Pay', sub: 'Biometría · instantáneo',
              icon: (
                <svg viewBox="0 0 814 1000" className="h-4 w-4 fill-current">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.8-105.9C115.1 715.6 81 568.9 81 439.1c0-184.7 120.4-282.3 238-282.3 63.4 0 116.5 41.5 156.3 41.5 37.9 0 97.5-44 171.8-44 27.6 0 130.3 2.6 198.3 99.4zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
              ),
            },
            { id: 'bizum' as PayMethod, label: 'Bizum', sub: 'Tu número de teléfono', icon: <span className="text-sm font-black italic text-[#00c4b3]">bz</span> },
            { id: 'card' as PayMethod, label: 'Tarjeta guardada', sub: '•••• 4242', icon: <CreditCard className="h-4 w-4" /> },
            { id: 'transfer' as PayMethod, label: 'Transferencia bancaria', sub: 'Hasta 72 h hábiles', icon: <Landmark className="h-4 w-4" /> },
          ] as { id: PayMethod; label: string; sub: string; icon: ReactNode }[]).map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border-2 p-3 transition-all',
                method === m.id
                  ? 'border-manises-blue bg-manises-blue/[0.04]'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                {m.icon}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-manises-blue">{m.label}</p>
                <p className="text-[9px] font-medium text-slate-400">{m.sub}</p>
              </div>
              {method === m.id && (
                <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-manises-blue">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Datos bancarios (solo transferencia) */}
      {method === 'transfer' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Datos de transferencia (demo)</p>
          {Object.entries(BANK_TRANSFER_INFO).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{label}</p>
                <p className="text-[11px] font-bold text-manises-blue truncate">{value}</p>
              </div>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(value); toast.success(`${label} copiado`); }}
                className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-400 hover:bg-blue-100 shrink-0"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleRecharge}
        disabled={isProcessing}
        className="w-full rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest bg-manises-blue text-white"
      >
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando…</>
        ) : method === 'transfer' ? (
          <>Ver datos de transferencia <ArrowRight className="ml-2 h-4 w-4 opacity-70" /></>
        ) : (
          <>Recargar {formatCurrency(selected)} demo</>
        )}
      </Button>
      <p className="text-center text-[9px] font-medium text-slate-400">
        Simulación demo · sin cargo real
      </p>
    </div>
  );
}

// ─── Processing step ──────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  'Verificando identidad',
  'Procesando pago',
  'Reservando décimos',
  'Confirmando pedido',
];

function ProcessingView() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = PROCESS_STEPS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 600 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#991b1b]/10">
        <Loader2 className="h-8 w-8 animate-spin text-[#991b1b]" />
      </div>
      <div className="w-full space-y-3">
        <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          Procesando compra
        </p>
        {PROCESS_STEPS.map((label, i) => (
          <AnimatePresence key={label}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
                  i < visibleCount - 1
                    ? 'bg-emerald-100'
                    : 'bg-slate-100 animate-pulse'
                )}>
                  {i < visibleCount - 1
                    ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                    : <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  }
                </div>
                <span className="text-[12px] font-semibold text-manises-blue">{label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NavidadCheckoutFlow({
  game,
  showcaseItems,
  availableBalance,
  drawDate,
  initialDeliveryMode = 'custody',
  onTopUp,
  onGoToTickets,
}: NavidadCheckoutFlowProps) {
  const [step, setStep] = useState<Step>('selection');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialDeliveryMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [minAvailability, setMinAvailability] = useState<0 | 10 | 20 | 30 | 50>(0);
  const [abonarseNumber, setAbonarseNumber] = useState<string | null>(null);
  const [ticketMockupNumber, setTicketMockupNumber] = useState<string | null>(null);
  const [showRechargeWarning, setShowRechargeWarning] = useState(false);
  const [justRecharged, setJustRecharged] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(availableBalance);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [activeCartNumber, setActiveCartNumber] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const stepperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTicketTap = (number: string) => {
    if (stepperTimerRef.current) clearTimeout(stepperTimerRef.current);
    if (activeCartNumber === number) { setActiveCartNumber(null); return; }
    setActiveCartNumber(number);
    stepperTimerRef.current = setTimeout(() => setActiveCartNumber(null), 2000);
  };

  // Sync balance updates from parent
  useEffect(() => {
    setCurrentBalance(availableBalance);
  }, [availableBalance]);

  // Auto-expand cart panel when first ticket is added
  useEffect(() => {
    if (cart.length > 0) setCartExpanded(true);
  }, [cart.length]);

  const filteredItems = showcaseItems.filter(i => {
    if (searchQuery && !i.number.includes(searchQuery)) return false;
    if (minAvailability > 0 && i.available < minAvailability) return false;
    return true;
  });

  const totalDecimos = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const getCartItem = (number: string) => cart.find(i => i.number === number);

  const updateCart = (item: NationalShowcaseItem, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.number === item.number);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, {
          number: item.number,
          serie: item.serie,
          fraccion: item.fraccion,
          quantity: 1,
          unitPrice: item.decimoPrice,
          deliveryMode,
          maxQuantity: item.available,
        }];
      }
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) return prev.filter(i => i.number !== item.number);
      return prev.map(i => i.number === item.number
        ? { ...i, quantity: Math.min(nextQty, i.maxQuantity), deliveryMode }
        : i
      );
    });
  };

  const removeFromCart = (number: string) => {
    setCart(prev => prev.filter(i => i.number !== number));
  };

  const updateCartDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    setCart(prev => prev.map(i => ({ ...i, deliveryMode: mode })));
  };

  const handleContinueToCart = () => {
    if (cart.length === 0) return;
    setStep('cart');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleFinalizarCompra = () => {
    setStep('processing');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    setTimeout(() => {
      toast.success(
        `${totalDecimos} décimo${totalDecimos !== 1 ? 's' : ''} reservado${totalDecimos !== 1 ? 's' : ''} · Lotería de Navidad`,
        { duration: 4000 }
      );
      onGoToTickets();
    }, PROCESS_STEPS.length * 700 + 900);
  };

  const handleTopUpSuccess = async (amount: number) => {
    await onTopUp(amount);
    setCurrentBalance(prev => prev + amount);
    setJustRecharged(true);
  };

  // ── Processing ─────────────────────────────────────────────────────────────
  if (step === 'processing') {
    return <ProcessingView />;
  }

  // ── Recharge ───────────────────────────────────────────────────────────────
  if (step === 'recharge') {
    return (
      <RechargeView
        currentBalance={currentBalance}
        neededAmount={totalPrice}
        onBack={() => setStep('cart')}
        onSuccess={handleTopUpSuccess}
      />
    );
  }

  // ── Cart (Mi Cesta) ────────────────────────────────────────────────────────
  if (step === 'cart') {
    const shipping = deliveryMode === 'shipping' ? SHIPPING_COST : 0;
    const total = totalPrice + shipping;
    const isOverBalance = currentBalance < total;

    return (
      <>
        <div className="space-y-3 pb-[140px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('selection')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <NavArrowLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-[15px] font-black text-manises-blue">Mi cesta</p>
              <p className="text-[11px] font-medium text-slate-400">Lotería de Navidad</p>
            </div>
            <div className="h-8 w-8" />
          </div>

          {/* Selector Custodia/Mensajería */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {(['custody', 'shipping'] as const).map(mode => (
              <button key={mode} type="button" onClick={() => updateCartDeliveryMode(mode)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                  deliveryMode === mode ? 'bg-manises-blue text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}>
                {mode === 'custody'
                  ? <><ShieldCheck className="h-3.5 w-3.5" /> Custodia digital</>
                  : <><Truck className="h-3.5 w-3.5" /> Mensajería</>}
              </button>
            ))}
          </div>

          {deliveryMode === 'custody' && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
              Los décimos se guardarán de forma segura en tu cuenta.
            </p>
          )}
          {deliveryMode === 'shipping' && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
              Los décimos se enviarán a la dirección que indiques.
            </p>
          )}

          {/* Sorteo group card */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <div>
                <p className="text-[13px] font-black text-manises-blue">Lotería de Navidad</p>
                <p className="text-[10px] font-semibold text-slate-400">{formatDrawDate(drawDate)}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ backgroundColor: '#991b1b' }}>
                {cart.length} {cart.length === 1 ? 'número' : 'números'}
              </span>
            </div>
            <div className="divide-y divide-slate-50 px-4">
              {cart.map(item => (
                <div key={item.number} className="py-2.5">
                  <div className="flex items-center gap-3">
                    {deliveryMode === 'shipping' && (
                      <span className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: '#991b1b' }}>
                        DÉCIMO
                      </span>
                    )}
                    <span className="flex-1 min-w-0 text-[14px] font-black text-manises-blue tabular-nums">{item.number}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button"
                        onClick={() => setCart(prev => prev.map(i => i.number === item.number ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                        disabled={item.quantity <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[12px] font-black text-slate-400 disabled:opacity-30 hover:border-[#991b1b] hover:text-[#991b1b] transition-colors">−</button>
                      <span className="w-4 text-center text-[13px] font-black text-manises-blue">{item.quantity}</span>
                      <button type="button"
                        onClick={() => setCart(prev => prev.map(i => i.number === item.number && i.quantity < i.maxQuantity ? { ...i, quantity: i.quantity + 1 } : i))}
                        disabled={item.quantity >= item.maxQuantity}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[12px] font-black text-slate-400 hover:border-[#991b1b] hover:text-[#991b1b] transition-colors disabled:opacity-30">+</button>
                    </div>
                    <span className="shrink-0 w-16 text-right text-[12px] font-bold text-manises-blue">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    <button type="button"
                      onClick={() => removeFromCart(item.number)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors">
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {deliveryMode === 'custody' && isAbonable(item.number) && (
                    <button type="button"
                      onClick={() => setAbonarseNumber(item.number)}
                      className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-manises-gold/30 bg-manises-gold/5 px-2.5 py-1 text-[10px] font-black text-manises-gold transition-colors hover:bg-manises-gold/10">
                      <Star className="h-3 w-3" /> Abonarme
                    </button>
                  )}
                  {deliveryMode === 'shipping' && (
                    <button type="button"
                      onClick={() => setTicketMockupNumber(item.number)}
                      className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-manises-blue transition-colors hover:bg-slate-100">
                      <Eye className="h-3 w-3" /> Ver décimo
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5">
              <span className="text-[11px] font-semibold text-slate-400">{totalDecimos} décimo{totalDecimos !== 1 ? 's' : ''}</span>
              <span className="text-[13px] font-black text-manises-blue">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {/* Resumen económico */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-4 py-4 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Resumen económico</p>
            <div className="flex justify-between text-[12px] font-semibold text-slate-600">
              <span>Total décimos</span><span>{totalDecimos}</span>
            </div>
            <div className="flex justify-between text-[12px] font-semibold text-slate-600">
              <span>Importe décimos</span><span>{formatCurrency(totalPrice)}</span>
            </div>
            {deliveryMode === 'shipping' && (
              <div className="flex justify-between text-[12px] font-semibold text-slate-600">
                <span>Gastos de mensajería (Península)</span><span>{formatCurrency(SHIPPING_COST)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px] font-black text-manises-blue">
              <span>Total del pedido</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white px-5 pt-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <div className="mx-auto max-w-screen-sm">
            <div className="grid grid-cols-2 gap-3 mb-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo actual</p>
                <p className="text-[18px] font-black text-manises-blue">{formatCurrency(currentBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total del pedido</p>
                <p className={`text-[18px] font-black ${isOverBalance ? 'text-red-500' : 'text-manises-blue'}`}>{formatCurrency(total)}</p>
              </div>
            </div>
            {isOverBalance && (
              <p className="mb-2 text-center text-[10px] font-semibold text-red-400">
                Faltan {formatCurrency(total - currentBalance)} para completar el pago
              </p>
            )}
            {justRecharged && !isOverBalance && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <p className="text-[11px] font-black text-emerald-700">Saldo listo · Pulsa Comprar para confirmar</p>
              </motion.div>
            )}
            <button
              type="button"
              onClick={isOverBalance ? () => setShowRechargeWarning(true) : () => { setJustRecharged(false); handleFinalizarCompra(); }}
              disabled={cart.length === 0}
              className={cn(
                'mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50',
                justRecharged && !isOverBalance
                  ? 'bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]'
                  : 'bg-manises-blue'
              )}
            >
              <Lock className="h-4 w-4" />
              {isOverBalance ? 'Recargar saldo' : 'Comprar'}
            </button>
          </div>
        </div>

        {abonarseNumber && (
          <AbonarseModal isOpen={!!abonarseNumber} onClose={() => setAbonarseNumber(null)} decimalNumber={abonarseNumber} />
        )}
        {ticketMockupNumber && (
          <TicketMockupModal number={ticketMockupNumber} onClose={() => setTicketMockupNumber(null)} />
        )}

        {/* ── Popover: aviso 2 pasos antes de recargar ────────────────── */}
        <AnimatePresence>
          {showRechargeWarning && (
            <motion.div
              key="recharge-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRechargeWarning(false)}
            />
          )}
          {showRechargeWarning && (
            <motion.div
              key="recharge-sheet"
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[310] mx-auto max-w-screen-sm rounded-t-[2rem] bg-white px-5 pb-8 pt-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />

              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <WarningTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-manises-blue">Saldo insuficiente</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Te faltan {formatCurrency(total - currentBalance)} para confirmar
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowRechargeWarning(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Xmark className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 2-step visual */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-manises-blue/[0.04] p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[12px] font-black text-white">1</div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-manises-blue">Recargar saldo</p>
                    <p className="text-[10px] font-medium text-slate-500">
                      Añadir {formatCurrency(total - currentBalance)} o más a tu monedero
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">
                    Siguiente
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 opacity-50">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-black text-slate-500">2</div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-slate-600">Confirmar tu compra</p>
                    <p className="text-[10px] font-medium text-slate-400">Volver aquí y pulsar "Comprar"</p>
                  </div>
                  <Lock className="h-4 w-4 text-slate-300" />
                </div>
              </div>

              {/* Callout de aviso */}
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
                  Recargar saldo <span className="font-black">no confirma tu compra</span>. Cuando termines de recargar, vuelve a esta cesta y pulsa{' '}
                  <span className="font-black">"Comprar"</span>.
                </p>
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setShowRechargeWarning(false); setStep('recharge'); }}
                  className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98]"
                >
                  Entendido · Recargar saldo
                </button>
                <button
                  type="button"
                  onClick={() => setShowRechargeWarning(false)}
                  className="w-full rounded-xl py-3 text-[12px] font-bold text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-3 pb-[200px]"
      onClick={() => { if (cartExpanded) { setCartExpanded(false); setActiveCartNumber(null); } }}
    >
      {/* Buscador + lupa */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Ej.: 12345 · 123 · 45"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-manises-blue placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b]/40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => searchInputRef.current?.focus()}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#991b1b]/30 hover:text-[#991b1b] transition-colors"
          aria-label="Buscar número"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Décimo de la Suerte */}
      <div
        className="flex items-center gap-2.5 rounded-2xl border-2 border-manises-gold/40 bg-amber-50/60 p-2.5 cursor-pointer select-none transition-all hover:border-manises-gold/60 active:scale-[0.98]"
        onClick={() => {
          const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number));
          if (available.length > 0) {
            const random = available[Math.floor(Math.random() * available.length)];
            updateCart(random, 1);
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const available = showcaseItems.filter(i => i.available > 0 && !getCartItem(i.number));
            if (available.length > 0) updateCart(available[Math.floor(Math.random() * available.length)], 1);
          }
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-manises-gold/30 bg-manises-gold/10">
          <Spark className="h-4 w-4 text-manises-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-manises-blue">Décimo de la Suerte</p>
          <p className="text-[8px] font-medium text-slate-400">Elegido por Lotería Manises</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-manises-gold/30 bg-white px-2.5 py-1 text-[9px] font-black text-manises-gold shadow-sm">
          Añadir {formatCurrency(showcaseItems[0]?.decimoPrice ?? 20)}
          <span className="text-sm leading-none">+</span>
        </div>
      </div>

      {/* Filtro disponibilidad mínima */}
      <div>
        <p className="mb-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
          Mostrar números con disponibilidad mínima
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {([0, 10, 20, 30, 50] as const).map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setMinAvailability(val)}
              className={cn(
                'rounded-full border py-1 text-[9px] font-black uppercase tracking-wider transition-all',
                minAvailability === val
                  ? 'border-[#991b1b] bg-[#991b1b] text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#991b1b]/30'
              )}
            >
              {val === 0 ? 'Todos' : `+${val}`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de números */}
      <div className="space-y-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50 py-10 px-6 text-center">
            <p className="text-sm font-bold text-slate-400">Sin resultados</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-300">
              Prueba con otro número o filtro
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const cartItem = getCartItem(item.number);
            const isInCart = !!cartItem;
            const qty = cartItem?.quantity ?? 0;

            return (
              <motion.div
                key={item.number}
                layout
                whileTap={{ scale: 0.97 }}
                transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border-2 px-3 py-1.5 transition-all',
                  isInCart
                    ? 'border-[#991b1b]/30 bg-[#991b1b]/[0.04]'
                    : 'border-slate-100 bg-white'
                )}
              >
                <NavidadDecimoCard number={item.number} active={isInCart} compact />

                <div className="min-w-0 flex-1">
                  <p className="text-[1.1rem] font-black leading-none tracking-widest text-manises-blue tabular-nums">
                    {item.number}
                  </p>
                  <p className={cn(
                    'mt-0.5 text-[8px] font-semibold leading-none',
                    item.available <= 1 ? 'text-amber-600'
                      : item.available <= 4 ? 'text-red-500'
                      : 'text-slate-400'
                  )}>
                    {item.available <= 1 ? 'Último décimo' : `${item.available} disponibles`}
                  </p>
                </div>

                {/* Controles — ancho fijo para alinear todas las filas */}
                <div
                  className={cn(
                    'shrink-0 flex items-center rounded-xl border p-0.5 shadow-sm',
                    isInCart ? 'border-[#991b1b]/30 bg-white' : 'border-slate-200 bg-slate-50'
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => updateCart(item, -1)}
                    disabled={qty === 0}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition-colors',
                      isInCart
                        ? 'text-[#991b1b] hover:bg-[#991b1b]/10'
                        : 'text-slate-300 cursor-default'
                    )}
                  >
                    {isInCart && qty <= 1 ? '×' : '−'}
                  </button>
                  <span className={cn(
                    'w-5 text-center text-[12px] font-black tabular-nums',
                    isInCart ? 'text-[#991b1b]' : 'text-slate-300'
                  )}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateCart(item, 1)}
                    disabled={qty >= item.available}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition-colors disabled:opacity-30',
                      isInCart
                        ? 'text-[#991b1b] hover:bg-[#991b1b]/10'
                        : 'text-[#991b1b] hover:bg-[#991b1b]/10'
                    )}
                  >
                    +
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Panel inferior: carrusel colapsable + barra de acción */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Carrusel de thumbnails (expandible) */}
        <AnimatePresence>
          {cartExpanded && cart.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="flex gap-5 overflow-x-auto px-5 pt-3 pb-5">
                <AnimatePresence initial={false} mode="popLayout">
                {cart.map(item => {
                  const isActive = activeCartNumber === item.number;
                  return (
                    <motion.div
                      key={item.number}
                      layout
                      initial={{ scale: 0.5, opacity: 0, y: 24 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="relative shrink-0 cursor-pointer"
                      onClick={() => handleTicketTap(item.number)}
                    >
                      <NationalTicketThumbnail
                        drawId="navidad"
                        className="w-[100px] rounded-sm shadow-md"
                      />

                      {/* Número flotante */}
                      {!isActive && (
                        <span className="pointer-events-none absolute inset-x-0 bottom-[57%] translate-x-2 text-center font-mono text-[15px] font-black tracking-tight text-black">
                          {item.number}
                        </span>
                      )}

                      {/* Stepper al tocar — desaparece a los 2 s */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 rounded-xl bg-black/75 flex items-center justify-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1 rounded-xl bg-white/15 p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity <= 1) { removeFromCart(item.number); setActiveCartNumber(null); }
                                  else setCart(prev => prev.map(i => i.number === item.number ? { ...i, quantity: i.quantity - 1 } : i));
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-black text-base hover:bg-white/20 transition-colors"
                              >
                                {item.quantity <= 1 ? '×' : '−'}
                              </button>
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#991b1b] text-white font-black text-sm border-2 border-white/30">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCart(prev => prev.map(i => i.number === item.number && i.quantity < i.maxQuantity ? { ...i, quantity: i.quantity + 1 } : i))}
                                disabled={item.quantity >= item.maxQuantity}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-black text-base hover:bg-white/20 transition-colors disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* X quitar — siempre visible */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeFromCart(item.number); }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[11px] font-black text-white shadow-sm hover:bg-rose-600 transition-colors"
                        aria-label={`Quitar ${item.number}`}
                      >
                        ×
                      </button>

                      {/* Badge cantidad — siempre visible abajo-derecha */}
                      {!isActive && (
                        <span className="absolute -bottom-2.5 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#991b1b] text-[9px] font-black text-white shadow-sm">
                          {item.quantity}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fila toggle: resumen + flecha */}
        <button
          type="button"
          onClick={() => cart.length > 0 && setCartExpanded(e => !e)}
          className={cn(
            'flex w-full items-center justify-between border-b border-slate-50 px-4 py-2.5 transition-colors',
            cart.length > 0 ? 'hover:bg-slate-50/60' : 'cursor-default'
          )}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5 text-manises-blue/60 shrink-0" />
            {cart.length === 0 ? (
              <span className="text-[10px] font-medium text-slate-400">Elige al menos un décimo</span>
            ) : (
              <span className="text-[10px] font-black text-manises-blue">
                {cart.length} {cart.length === 1 ? 'número' : 'números'} · {totalDecimos} {totalDecimos === 1 ? 'décimo seleccionado' : 'décimos seleccionados'}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            cartExpanded
              ? <NavArrowDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              : <NavArrowUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          )}
        </button>

        {/* Barra de acción: total + CONTINUAR */}
        <div
          className="bg-[#0a4792]/88"
          style={{ backdropFilter: 'blur(24px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
        <div className="mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white">
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <motion.p
              key={totalDecimos}
              initial={{ scale: 1.4, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 28 }}
              className="relative text-[1.05rem] font-black leading-none text-white tabular-nums"
            >
              {totalDecimos}
            </motion.p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/58">
              Total a pagar
            </p>
          </div>
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-white tabular-nums">
              {totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <sup className="ml-0.5 align-super text-[0.5rem] font-black">,00</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase leading-none tracking-[0.08em] text-white/58">
              Precio total
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinueToCart}
            disabled={cart.length === 0}
            className={cn(
              'relative m-1.5 flex h-auto min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl px-3 transition-all active:scale-[0.985]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14)]',
              cart.length === 0
                ? 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
                : 'bg-manises-gold text-manises-blue'
            )}
          >
            <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
            <span className="relative text-[0.9rem] font-black leading-none">Continuar</span>
            <span className="relative mt-0.5 text-[0.48rem] font-bold uppercase leading-none tracking-[0.08em] opacity-70">
              Revisar y confirmar
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
