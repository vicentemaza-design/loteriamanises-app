import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Xmark, Trash, Lock, Plus, EditPencil, Truck, Star, ShieldCheck, Eye, WarningTriangle } from 'iconoir-react/regular';
import { CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useSecurityGate } from '@/features/profile/hooks/useSecurityGate';
import type { PlayDraft } from '../types/session.types';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import { ShippingAddressModal, type ShippingAddress } from './lottery/ShippingAddressModal';
import { AddSorteoModal } from './lottery/AddSorteoModal';
import { getDeliveryMode, saveDeliveryMode, type LotteryDeliveryMode } from '../lib/delivery-preference';
import { AbonarseModal } from './lottery/AbonarseModal';
import { TopUpModal } from '@/features/profile/components/TopUpModal';
import { InsufficientBalanceModal } from '@/features/play/components/InsufficientBalanceModal';

const DRAW_COLORS: Record<string, string> = {
  navidad: '#991b1b', nino: '#1e40af', 'loteria-nacional': '#0a4792',
};
function drawColor(gameType: string) { return DRAW_COLORS[gameType] ?? '#0a4792'; }

// Un número es abonable si termina en 0, 2 o 5 (demo: ~30% de números)
function isAbonable(number: string): boolean {
  const last = number.slice(-1);
  return ['0', '2', '5'].includes(last);
}

// El set demo tiene prioridad sobre cualquier regla de gameType — en producción
// esto vendrá del campo ticketFormat del BE/SALAE.
// Navidad/niño → siempre DÉCIMO salvo que el número esté en el set demo.
// Jueves/sábado → TICKET si termina en 3 o 7.
const DEMO_TICKET_NUMBERS = new Set(['23019', '45002', '12086', '67054', '89021', '44501']);
function getTicketLabel(gameType: string, number: string): 'DÉCIMO' | 'TICKET' {
  if (DEMO_TICKET_NUMBERS.has(number)) return 'TICKET';
  if (gameType === 'navidad' || gameType === 'nino') return 'DÉCIMO';
  return ['3', '7'].includes(number.slice(-1)) ? 'TICKET' : 'DÉCIMO';
}

function formatDrawDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface DrawGroupData { gameType: string; drafts: PlayDraft[]; drawDate: string; drawLabel: string }

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
            <div className="absolute" style={{ top: '60%', left: '4%' }}>
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
              <p className="whitespace-nowrap font-mono tracking-tight text-gray-800" style={{ fontSize: 7 }}>{line1}</p>
              <p className="whitespace-nowrap font-mono tracking-tight text-gray-800" style={{ fontSize: 7 }}>{line2}</p>
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

        {/* Custodia: solo Abonarme (si abonable) */}
        {isCustodia && canAbonarse && (
          <div className="mt-1.5">
            <button type="button" onClick={() => setAbonarseOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-manises-gold/30 bg-manises-gold/5 px-2.5 py-1 text-[10px] font-black text-manises-gold transition-colors hover:bg-manises-gold/10">
              <Star className="h-3 w-3" /> Abonarme
            </button>
          </div>
        )}

        {/* Mensajería: un botón cuyo modal depende del tipo de número */}
        {!isCustodia && (
          <div className="mt-1.5">
            {label === 'DÉCIMO' ? (
              <button type="button" onClick={() => setTicketMockupOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-manises-blue transition-colors hover:bg-slate-100">
                <Eye className="h-3 w-3" /> Ver décimo
              </button>
            ) : (
              <button type="button" onClick={() => setTicketMockupOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-manises-blue transition-colors hover:bg-slate-100">
                <Eye className="h-3 w-3" /> Ver ticket
              </button>
            )}
          </div>
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
          {data.drafts.length} {data.drafts.length === 1 ? 'número' : 'números'}
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
  const { balance, topUp } = useWallet();
  const { requireReauth, gateModal } = useSecurityGate();
  // Arranca en lo último que el usuario eligió, no siempre en custodia: este
  // panel se desmonta al cerrar la cesta, así que un valor fijo aquí borraba
  // su elección en cada apertura (ver lib/delivery-preference.ts).
  const [deliveryMode, setDeliveryMode] = useState<LotteryDeliveryMode>(getDeliveryMode);

  const chooseDeliveryMode = (mode: LotteryDeliveryMode) => {
    setDeliveryMode(mode);
    saveDeliveryMode(mode);
  };
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [showShipping, setShowShipping] = useState(false);
  const [showAddSorteo, setShowAddSorteo] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [justRecharged, setJustRecharged] = useState(false);

  const isOpen = reviewTarget === 'lottery' && (status === 'reviewing' || status === 'confirming' || status === 'failed');
  if (!isOpen) return null;

  const effectiveBalance = balance;
  const subtotal = lotteryDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const SHIPPING_COST = 12;
  const shipping = deliveryMode === 'mensajeria' ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const isOverBalance = effectiveBalance < total;
  const totalDecimos = lotteryDrafts.reduce((s, d) => s + d.quantity, 0);

  // Agrupar por la fecha REAL del sorteo (draft.drawDate), no por la etiqueta
  // genérica (draft.selection.drawLabel, p.ej. "Jueves") — dos sorteos
  // distintos pueden compartir la misma etiqueta ("Jueves 27 ago" y "Jueves 3
  // sep" son ambos "Jueves") y no deben fusionarse en un único grupo.
  const groups = lotteryDrafts.reduce<Record<string, DrawGroupData>>((acc, draft) => {
    if (draft.selection.type !== 'national') return acc;
    const key = draft.drawDate;
    if (!acc[key]) acc[key] = { gameType: draft.gameType, drafts: [], drawDate: draft.drawDate, drawLabel: draft.selection.drawLabel };
    acc[key].drafts.push(draft);
    return acc;
  }, {} as Record<string, DrawGroupData>);

  const handleQty = (draftId: string, delta: number) => {
    const draft = lotteryDrafts.find((d) => d.id === draftId);
    if (!draft) return;
    const nextQty = Math.max(1, draft.quantity + delta);
    updateDraft(draftId, { ...draft, quantity: nextQty, totalPrice: draft.unitPrice * nextQty });
  };

  // Recarga inline: mismo componente que "Mi cuenta" (TopUpModal) — ver
  // docs/be-handoff/security-reauthentication.md sobre por qué TopUpModal
  // gatea su propio "Recargar" con requireReauth('topUp') internamente. Al
  // tener éxito solo se marca justRecharged y se cierra la recarga; el
  // carrito de fondo nunca se desmonta, así que el usuario sigue en la misma
  // compra y debe pulsar "Comprar" de nuevo para confirmar (recargar no compra).
  const handleTopUpSuccess = async (amount: number) => {
    const result = await topUp(amount);
    if (!result?.success) throw new Error('No se pudo procesar la recarga.');
    setJustRecharged(true);
  };

  const handleComprar = async () => {
    if (isOverBalance) {
      // Aviso previo (InsufficientBalanceModal) antes de abrir la recarga:
      // recargar y comprar son dos pasos explícitos, nunca uno automático —
      // ver handleTopUpSuccess más abajo.
      setShowInsufficientBalance(true);
      return;
    }
    // Local PIN gate only when the user opted in (Perfil → Seguridad →
    // "Al comprar boletos") — never a substitute for BE authorization; see
    // docs/be-handoff/security-reauthentication.md.
    const reauthed = await requireReauth('purchase');
    if (!reauthed) return;
    setJustRecharged(false);
    confirm({ shippingCost: shipping });
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
              <button key={mode} type="button" onClick={() => chooseDeliveryMode(mode)}
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

            {(Object.entries(groups) as Array<[string, DrawGroupData]>).map(([drawDateKey, data]) => (
              <div key={drawDateKey}>
                <DrawGroup drawLabel={data.drawLabel} data={data} deliveryMode={deliveryMode} onDelete={removeDraft} onQty={handleQty} />
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

      {/* Aviso previo (ya existente, reutilizado): antes de abrir la recarga
          se explica que primero hay que añadir saldo y luego confirmar el
          pedido — "Añadir saldo" abre la recarga, "Ahora no" vuelve a la
          cesta sin cambios. */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalance}
        missingAmount={total - effectiveBalance}
        confirmLabel="Comprar"
        onClose={() => setShowInsufficientBalance(false)}
        onAddBalance={() => {
          setShowInsufficientBalance(false);
          setShowTopUp(true);
        }}
      />

      {/* Recarga inline — mismo componente que "Mi cuenta" (TopUpModal),
          solo con el contexto superior de déficit en vez de saldo actual. */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={effectiveBalance}
        deficitAmount={total - effectiveBalance}
      />

      <ShippingAddressModal isOpen={showShipping} onClose={() => setShowShipping(false)} onSave={setShippingAddress} savedAddress={shippingAddress} />
      <AddSorteoModal isOpen={showAddSorteo} onClose={() => setShowAddSorteo(false)} deliveryMode={deliveryMode} />
      {gateModal}
    </>
  );
}
