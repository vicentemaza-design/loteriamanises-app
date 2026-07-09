import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Xmark, Trash, Lock, Plus, EditPencil, Truck, Star, ShieldCheck, Eye, WarningTriangle, NavArrowLeft } from 'iconoir-react/regular';
import { CreditCard, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { PlayDraft } from '../types/session.types';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import { ShippingAddressModal, type ShippingAddress } from './lottery/ShippingAddressModal';
import { AddSorteoModal } from './lottery/AddSorteoModal';
import { AbonarseModal } from './lottery/AbonarseModal';

const DRAW_COLORS: Record<string, string> = {
  navidad: '#991b1b', nino: '#1e40af', 'loteria-nacional': '#0a4792',
};
function drawColor(gameType: string) { return DRAW_COLORS[gameType] ?? '#0a4792'; }

// Un número es abonable si termina en 0, 2 o 5 (demo: ~30% de números)
function isAbonable(number: string): boolean {
  const last = number.slice(-1);
  return ['0', '2', '5'].includes(last);
}

// Navidad/niño → siempre DÉCIMO. Jueves/sábado → TICKET si termina en 3 o 7
function getTicketLabel(gameType: string, number: string): 'DÉCIMO' | 'TICKET' {
  if (gameType === 'navidad' || gameType === 'nino') return 'DÉCIMO';
  return ['3', '7'].includes(number.slice(-1)) ? 'TICKET' : 'DÉCIMO';
}

function formatDrawDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface DrawGroupData { gameType: string; drafts: PlayDraft[]; drawDate: string }

// Mockup del décimo/ticket — pendiente imagen real del número desde backend
function TicketMockupModal({ number, gameType, label, onClose }: {
  number: string; gameType: string; label: 'DÉCIMO' | 'TICKET'; onClose: () => void;
}) {
  const drawId = gameType === 'navidad' ? 'navidad' : gameType === 'nino' ? 'nino' :
    gameType.includes('sabado') ? 'sabado' : 'jueves';
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
          {/* Cabecera */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <button type="button" onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
              <Xmark className="h-4 w-4" />
            </button>
          </div>

          {/* Imagen mockup */}
          <div className="relative overflow-hidden rounded-2xl">
            <NationalTicketThumbnail drawId={drawId} className="w-full" />
            <div className="absolute top-[10%] left-[59%] -translate-x-1/2 text-center">
              <span className="font-mono text-[32px] font-black tracking-[0.08em] text-gray-900">
                {number}
              </span>
            </div>
          </div>

          {/* Aviso pendiente integración */}
          {/* TODO: reemplazar con imagen real generada por backend con el número montado en el décimo/ticket */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <WarningTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="text-[10px] font-semibold leading-relaxed text-amber-700">
              Imagen de ejemplo · Pendiente de integración con el backend para mostrar el {label.toLowerCase()} real del número {number}.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Genera códigos de serie y hash deterministas a partir del número del décimo
function generateSerial(number: string): { line1: string; line2: string } {
  let s = 0;
  for (let i = 0; i < number.length; i++) {
    s = ((s * 31) + number.charCodeAt(i)) & 0x7fffffff;
  }
  const groups: string[] = [];
  for (let i = 0; i < 7; i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    groups.push(String(s % 100000).padStart(5, '0'));
  }
  const hex = '0123456789ABCDEF';
  let line2 = '';
  for (let i = 0; i < 20; i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    line2 += hex[s % 16];
  }
  return { line1: groups.join('-'), line2 };
}

// Modal custodia digital — usa la imagen template del décimo en blanco
function CustodiaTicketModal({ number, onClose }: { number: string; onClose: () => void }) {
  const { line1, line2 } = generateSerial(number);
  const qrValue = `LOTERIA-MANISES-${number}-${line2}`;
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
          {/* Cabecera */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">DÉCIMO</p>
            <button type="button" onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
              <Xmark className="h-4 w-4" />
            </button>
          </div>

          {/* Template con overlays */}
          <div className="relative overflow-hidden rounded-2xl">
            <img src="/assets/decimo-template.jpg" className="block w-full" alt="Décimo digital" />

            {/* Número — zona blanca superior */}
            <div className="absolute top-[11%] left-[55%] -translate-x-1/2">
              <span className="font-mono text-[32px] font-black tracking-[0.08em] text-gray-900 whitespace-nowrap">
                {number}
              </span>
            </div>

            {/* QR — zona azul, anclado en esquina superior izquierda */}
            <div className="absolute" style={{ top: '60%', left: '1%' }}>
              <QRCodeSVG value={qrValue} size={78} level="M" />
            </div>

            {/* MANISES */}
            <div className="absolute" style={{ bottom: '14%', left: '54%', transform: 'translateX(-50%)' }}>
              <p className="whitespace-nowrap font-black tracking-[0.14em] text-gray-900" style={{ fontSize: 10 }}>
                MANISES
              </p>
            </div>

            {/* Códigos de serie */}
            <div className="absolute text-center" style={{ bottom: '2%', left: '54%', transform: 'translateX(-50%)' }}>
              <p className="whitespace-nowrap font-mono tracking-tight text-gray-800" style={{ fontSize: 6 }}>{line1}</p>
              <p className="whitespace-nowrap font-mono tracking-tight text-gray-800" style={{ fontSize: 6 }}>{line2}</p>
            </div>
          </div>

          {/* Aviso */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <WarningTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="text-[10px] font-semibold leading-relaxed text-amber-700">
              Imagen de ejemplo · Pendiente de integración con el backend para mostrar el décimo real del número {number}.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LotteryDraftRow({ draft, color, deliveryMode, onDelete, onQty }: {
  draft: PlayDraft; color: string; deliveryMode: 'custodia' | 'mensajeria';
  onDelete: () => void; onQty: (delta: number) => void;
}) {
  const [abonarseOpen, setAbonarseOpen] = useState(false);
  const [ticketMockupOpen, setTicketMockupOpen] = useState(false);
  const [custodiaTicketOpen, setCustodiaTicketOpen] = useState(false);
  if (draft.selection.type !== 'national') return null;
  const number = draft.selection.number;
  const label = getTicketLabel(draft.gameType, number);
  const canAbonarse = isAbonable(number);
  const isCustodia = deliveryMode === 'custodia';

  return (
    <>
      <div className="py-2.5">
        <div className="flex items-center gap-3">
          {/* Etiqueta DÉCIMO/TICKET — solo en mensajería */}
          {!isCustodia && (
            <span className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              {label}
            </span>
          )}
          <span className="flex-1 min-w-0 text-[14px] font-black text-manises-blue tabular-nums">{number}</span>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => onQty(-1)} disabled={draft.quantity <= 1}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[12px] font-black text-slate-400 disabled:opacity-30 hover:border-manises-blue hover:text-manises-blue transition-colors">−</button>
            <span className="w-4 text-center text-[13px] font-black text-manises-blue">{draft.quantity}</span>
            <button type="button" onClick={() => onQty(1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[12px] font-black text-slate-400 hover:border-manises-blue hover:text-manises-blue transition-colors">+</button>
          </div>
          <span className="shrink-0 w-16 text-right text-[12px] font-bold text-manises-blue">{formatCurrency(draft.unitPrice * draft.quantity)}</span>
          <button type="button" onClick={onDelete}
            className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors">
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Custodia: Abonarme (si abonable) + Ver ticket */}
        {isCustodia && (
          <div className="mt-1.5 flex gap-1.5">
            {canAbonarse && (
              <button type="button" onClick={() => setAbonarseOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-manises-gold/30 bg-manises-gold/5 px-2.5 py-1 text-[10px] font-black text-manises-gold transition-colors hover:bg-manises-gold/10">
                <Star className="h-3 w-3" /> Abonarme
              </button>
            )}
            <button type="button" onClick={() => setCustodiaTicketOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-manises-blue transition-colors hover:bg-slate-100">
              <Eye className="h-3 w-3" /> Ver ticket
            </button>
          </div>
        )}

        {/* Mensajería: Ver décimo / Ver ticket → abre mockup */}
        {!isCustodia && (
          <button type="button" onClick={() => setTicketMockupOpen(true)}
            className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-manises-blue transition-colors hover:bg-slate-100">
            <Eye className="h-3 w-3" />
            {label === 'DÉCIMO' ? 'Ver décimo' : 'Ver ticket'}
          </button>
        )}
      </div>
      <AbonarseModal isOpen={abonarseOpen} onClose={() => setAbonarseOpen(false)} decimalNumber={number} />
      {ticketMockupOpen && (
        <TicketMockupModal number={number} gameType={draft.gameType} label={label} onClose={() => setTicketMockupOpen(false)} />
      )}
      {custodiaTicketOpen && (
        <CustodiaTicketModal number={number} onClose={() => setCustodiaTicketOpen(false)} />
      )}
    </>
  );
}

function DrawGroup({ drawLabel, data, onDelete, onQty, deliveryMode }: {
  drawLabel: string; data: DrawGroupData; deliveryMode: 'custodia' | 'mensajeria';
  onDelete: (id: string) => void; onQty: (id: string, delta: number) => void;
}) {
  const color = drawColor(data.gameType);
  const totalDecimos = data.drafts.reduce((s, d) => s + d.quantity, 0);
  const total = data.drafts.reduce((s, d) => s + d.totalPrice, 0);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <div>
          <p className="text-[13px] font-black text-manises-blue">{drawLabel}</p>
          <p className="text-[10px] font-semibold text-slate-400">{formatDrawDate(data.drawDate)}</p>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ backgroundColor: color }}>
          {totalDecimos} {totalDecimos === 1 ? 'número' : 'números'}
        </span>
      </div>
      <div className="divide-y divide-slate-50 px-4">
        {(data.drafts as PlayDraft[]).map((draft) => (
          <div key={draft.id}>
            <LotteryDraftRow
              draft={draft}
              color={color}
              deliveryMode={deliveryMode}
              onDelete={() => onDelete(draft.id)}
              onQty={(delta) => onQty(draft.id, delta)}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-slate-400">{totalDecimos} décimo{totalDecimos !== 1 ? 's' : ''}</span>
        <span className="text-[13px] font-black text-manises-blue">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function LotteryCartPanel() {
  const { lotteryDrafts, reviewTarget, closeReview, removeDraft, updateDraft, status, errorMessage } = usePlaySession();
  const { confirm, isSubmitting } = usePlaySessionConfirm({ draftFilter: 'lottery' });
  const { profile } = useAuth();
  const [deliveryMode, setDeliveryMode] = useState<'custodia' | 'mensajeria'>('custodia');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [showShipping, setShowShipping] = useState(false);
  const [showAddSorteo, setShowAddSorteo] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [inlineStep, setInlineStep] = useState<'warning' | 'recharge'>('warning');
  const INLINE_AMOUNTS = [5, 10, 20, 50, 100, 200];
  const [inlineAmt, setInlineAmt] = useState(20);
  const [inlineMethod, setInlineMethod] = useState<'apple' | 'bizum' | 'card'>('apple');
  const [isRechargingInline, setIsRechargingInline] = useState(false);
  const [balanceBoost, setBalanceBoost] = useState(0);
  const [justRecharged, setJustRecharged] = useState(false);

  const isOpen = reviewTarget === 'lottery' && (status === 'reviewing' || status === 'confirming' || status === 'failed');
  if (!isOpen) return null;

  const balance = profile?.balance ?? 0;
  const effectiveBalance = balance + balanceBoost;
  const subtotal = lotteryDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const SHIPPING_COST = 12;
  const shipping = deliveryMode === 'mensajeria' ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const isOverBalance = effectiveBalance < total;
  const totalDecimos = lotteryDrafts.reduce((s, d) => s + d.quantity, 0);

  const groups = lotteryDrafts.reduce<Record<string, DrawGroupData>>((acc, draft) => {
    if (draft.selection.type !== 'national') return acc;
    const key = draft.selection.drawLabel;
    if (!acc[key]) acc[key] = { gameType: draft.gameType, drafts: [], drawDate: draft.drawDate };
    acc[key].drafts.push(draft);
    return acc;
  }, {} as Record<string, DrawGroupData>);

  const handleQty = (draftId: string, delta: number) => {
    const draft = lotteryDrafts.find((d) => d.id === draftId);
    if (!draft) return;
    const nextQty = Math.max(1, draft.quantity + delta);
    updateDraft(draftId, { ...draft, quantity: nextQty, totalPrice: draft.unitPrice * nextQty });
  };

  const handleInlineRecharge = async () => {
    setIsRechargingInline(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRechargingInline(false);
    setBalanceBoost(prev => prev + inlineAmt);
    setJustRecharged(true);
    setShowInsufficientBalance(false);
  };

  const handleComprar = () => {
    if (isOverBalance) {
      const shortfall = total - effectiveBalance;
      setInlineAmt(INLINE_AMOUNTS.find(a => a >= shortfall) ?? 20);
      setInlineStep('warning');
      setShowInsufficientBalance(true);
      return;
    }
    setJustRecharged(false);
    confirm();
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] flex flex-col">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeReview} />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative mt-auto flex max-h-[92vh] flex-col rounded-t-3xl bg-[#f6f8fb] shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <button type="button" onClick={closeReview} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <Xmark className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-[15px] font-black text-manises-blue">Mi cesta</p>
              <p className="text-[11px] font-medium text-slate-400">Lotería Nacional</p>
            </div>
            <div className="h-8 w-8" />
          </div>

          {/* Selector Custodia/Mensajería */}
          <div className="mx-5 mb-3 flex rounded-xl border border-slate-200 bg-white p-1">
            {(['custodia', 'mensajeria'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setDeliveryMode(mode)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                  deliveryMode === mode ? 'bg-manises-blue text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}>
                {mode === 'custodia'
                  ? <><ShieldCheck className="h-3.5 w-3.5" /> Custodia digital</>
                  : <><Truck className="h-3.5 w-3.5" /> Mensajería</>}
              </button>
            ))}
          </div>

          {deliveryMode === 'custodia' && (
            <p className="mx-5 mb-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
              Los décimos se guardarán de forma segura en tu cuenta.
            </p>
          )}
          {deliveryMode === 'mensajeria' && (
            <p className="mx-5 mb-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
              Los décimos se enviarán a la dirección que indiques.
            </p>
          )}

          {errorMessage && (
            <div className="mx-5 mb-3 rounded-xl bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-600">{errorMessage}</div>
          )}

          {/* Scroll */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">

            {(Object.entries(groups) as Array<[string, DrawGroupData]>).map(([drawLabel, data]) => (
              <div key={drawLabel}>
                <DrawGroup drawLabel={drawLabel} data={data} deliveryMode={deliveryMode} onDelete={removeDraft} onQty={handleQty} />
              </div>
            ))}

            <button type="button" onClick={() => setShowAddSorteo(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-[12px] font-black text-slate-400 hover:border-manises-blue/30 hover:text-manises-blue transition-colors">
              <Plus className="h-4 w-4" /> Añadir números de otro sorteo
            </button>

            {deliveryMode === 'mensajeria' && (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-400" />
                    <p className="text-[12px] font-black text-manises-blue">Datos de envío</p>
                  </div>
                  <button type="button" onClick={() => setShowShipping(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-manises-blue hover:underline">
                    <EditPencil className="h-3.5 w-3.5" />
                    {shippingAddress ? 'Editar' : 'Añadir'}
                  </button>
                </div>
                {shippingAddress ? (
                  <div className="px-4 pb-4 space-y-0.5">
                    <p className="text-[13px] font-black text-manises-blue">{shippingAddress.name}</p>
                    <p className="text-[11px] text-slate-500">{shippingAddress.street}</p>
                    <p className="text-[11px] text-slate-500">{shippingAddress.cp} {shippingAddress.city}</p>
                    <p className="text-[11px] text-slate-400 mt-1">📦 Envío estimado: 24 a 48 h hábiles</p>
                  </div>
                ) : (
                  <div className="px-4 pb-4">
                    <button type="button" onClick={() => setShowShipping(true)}
                      className="w-full rounded-xl border border-dashed border-slate-200 py-3 text-[12px] font-black text-slate-400 hover:border-manises-blue/30 hover:text-manises-blue transition-colors">
                      + Añadir dirección de entrega
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-4 py-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Resumen económico</p>
              <div className="flex justify-between text-[12px] font-semibold text-slate-600">
                <span>Total décimos</span><span>{totalDecimos}</span>
              </div>
              <div className="flex justify-between text-[12px] font-semibold text-slate-600">
                <span>Importe décimos</span><span>{formatCurrency(subtotal)}</span>
              </div>
              {deliveryMode === 'mensajeria' && (
                <div className="flex justify-between text-[12px] font-semibold text-slate-600">
                  <span>Gastos de mensajería (Península)</span><span>{formatCurrency(SHIPPING_COST)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px] font-black text-manises-blue">
                <span>Total del pedido</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200/60 bg-white px-5 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
            <div className="grid grid-cols-2 gap-3 mb-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo actual</p>
                <p className="text-[18px] font-black text-manises-blue">{formatCurrency(effectiveBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total del pedido</p>
                <p className={`text-[18px] font-black ${isOverBalance ? 'text-red-500' : 'text-manises-blue'}`}>{formatCurrency(total)}</p>
              </div>
            </div>
            {isOverBalance && (
              <p className="mb-2 text-center text-[10px] font-semibold text-red-400">Faltan {formatCurrency(total - effectiveBalance)} para completar el pago</p>
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
            <button type="button" onClick={handleComprar}
              disabled={isSubmitting || lotteryDrafts.length === 0 || (deliveryMode === 'mensajeria' && !shippingAddress)}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
                justRecharged && !isOverBalance
                  ? 'bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]'
                  : 'bg-manises-blue'
              }`}>
              <Lock className="h-4 w-4" />
              {isSubmitting ? 'Procesando...' : 'Comprar'}
            </button>
            {deliveryMode === 'mensajeria' && !shippingAddress && (
              <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-400">Añade una dirección de envío para continuar</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal saldo insuficiente — aviso + recarga inline */}
      <AnimatePresence>
        {showInsufficientBalance && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInsufficientBalance(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[310] mx-auto max-w-screen-sm rounded-t-[2rem] bg-white px-5 pb-8 pt-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

              <AnimatePresence mode="wait">
                {inlineStep === 'warning' ? (
                  <motion.div key="warning" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                    {/* Header */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <WarningTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-manises-blue">Saldo insuficiente</p>
                          <p className="text-[11px] font-medium text-slate-500">
                            Te faltan {formatCurrency(total - effectiveBalance)} para confirmar
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowInsufficientBalance(false)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
                        <Xmark className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* 2-step visual */}
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 border-b border-slate-100 bg-manises-blue/[0.04] p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[12px] font-black text-white">1</div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black text-manises-blue">Recargar saldo</p>
                          <p className="text-[10px] font-medium text-slate-500">Añadir {formatCurrency(total - effectiveBalance)} o más</p>
                        </div>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">Siguiente</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 opacity-50">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-black text-slate-500">2</div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black text-slate-600">Pulsar "Comprar"</p>
                          <p className="text-[10px] font-medium text-slate-400">El botón se activará en verde al volver</p>
                        </div>
                        <Lock className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>

                    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                      <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
                        Recargar saldo <span className="font-black">no confirma tu compra</span>. Después de recargar, el botón <span className="font-black">"Comprar"</span> se activará en verde para que lo confirmes.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button type="button" onClick={() => setInlineStep('recharge')}
                        className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98]">
                        Recargar saldo
                      </button>
                      <button type="button" onClick={() => setShowInsufficientBalance(false)}
                        className="w-full rounded-xl py-3 text-[12px] font-bold text-slate-400">
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="recharge" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="space-y-4">
                    {/* Back nav */}
                    <div className="flex items-center gap-2.5">
                      <button type="button" onClick={() => setInlineStep('warning')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                        <NavArrowLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recargar saldo</p>
                        <p className="text-sm font-black text-manises-blue">Te faltan {formatCurrency(total - effectiveBalance)}</p>
                      </div>
                    </div>

                    {/* Amount grid */}
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Importe</p>
                      <div className="grid grid-cols-3 gap-2">
                        {INLINE_AMOUNTS.map(a => (
                          <button key={a} type="button" onClick={() => setInlineAmt(a)}
                            className={`rounded-xl border-2 py-2.5 text-sm font-black transition-all ${
                              inlineAmt === a ? 'border-manises-blue bg-manises-blue text-white' : 'border-slate-200 bg-white text-manises-blue hover:border-manises-blue/30'
                            }`}>
                            {formatCurrency(a)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Method */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Método de pago</p>
                      {([
                        { id: 'apple' as const, label: 'Apple Pay', sub: 'Biometría · instantáneo',
                          icon: <svg viewBox="0 0 814 1000" className="h-4 w-4 fill-current"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.8-105.9C115.1 715.6 81 568.9 81 439.1c0-184.7 120.4-282.3 238-282.3 63.4 0 116.5 41.5 156.3 41.5 37.9 0 97.5-44 171.8-44 27.6 0 130.3 2.6 198.3 99.4zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg> },
                        { id: 'bizum' as const, label: 'Bizum', sub: 'Tu número de teléfono',
                          icon: <span className="text-sm font-black italic text-[#00c4b3]">bz</span> },
                        { id: 'card' as const, label: 'Tarjeta guardada', sub: '•••• 4242',
                          icon: <CreditCard className="h-4 w-4" /> },
                      ]).map(m => (
                        <button key={m.id} type="button" onClick={() => setInlineMethod(m.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                            inlineMethod === m.id ? 'border-manises-blue bg-manises-blue/[0.04]' : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">{m.icon}</div>
                          <div className="text-left flex-1">
                            <p className="text-[11px] font-black text-manises-blue">{m.label}</p>
                            <p className="text-[9px] font-medium text-slate-400">{m.sub}</p>
                          </div>
                          {inlineMethod === m.id && (
                            <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-manises-blue">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* CTA */}
                    <button type="button" onClick={handleInlineRecharge} disabled={isRechargingInline}
                      className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60">
                      {isRechargingInline
                        ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</span>
                        : `Recargar ${formatCurrency(inlineAmt)} · demo`
                      }
                    </button>
                    <p className="text-center text-[9px] font-medium text-slate-400">Simulación demo · sin cargo real</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShippingAddressModal isOpen={showShipping} onClose={() => setShowShipping(false)} onSave={setShippingAddress} savedAddress={shippingAddress} />
      <AddSorteoModal isOpen={showAddSorteo} onClose={() => setShowAddSorteo(false)} deliveryMode={deliveryMode} />
    </>
  );
}
