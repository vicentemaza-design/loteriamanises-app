import { useState } from 'react';
import { motion } from 'motion/react';
import { Xmark, Trash, Lock, Plus, EditPencil, Truck, Star } from 'iconoir-react/regular';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { PlayDraft } from '../types/session.types';
import { ShippingAddressModal, type ShippingAddress } from './lottery/ShippingAddressModal';
import { AddSorteoModal } from './lottery/AddSorteoModal';
import { AbonarseModal } from './lottery/AbonarseModal';

const DRAW_COLORS: Record<string, string> = {
  navidad: '#991b1b', nino: '#1e40af', 'loteria-nacional': '#0a4792',
};
function drawColor(gameType: string) { return DRAW_COLORS[gameType] ?? '#0a4792'; }

interface DrawGroupData { gameType: string; drafts: PlayDraft[] }

function LotteryDraftRow({ draft, color, onDelete, onQty, showAbonarme }: {
  draft: PlayDraft; color: string; onDelete: () => void;
  onQty: (delta: number) => void; showAbonarme: boolean;
}) {
  const [abonarseOpen, setAbonarseOpen] = useState(false);
  if (draft.selection.type !== 'national') return null;
  const number = draft.selection.number;

  return (
    <>
      <div className="py-2.5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: color }}>DÉCIMO</span>
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
        {showAbonarme && (
          <button type="button" onClick={() => setAbonarseOpen(true)}
            className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-manises-gold/30 bg-manises-gold/5 px-2.5 py-1 text-[10px] font-black text-manises-gold transition-colors hover:bg-manises-gold/10">
            <Star className="h-3 w-3" /> Abonarme
          </button>
        )}
      </div>
      <AbonarseModal isOpen={abonarseOpen} onClose={() => setAbonarseOpen(false)} decimalNumber={number} />
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
        <p className="text-[13px] font-black text-manises-blue">{drawLabel}</p>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ backgroundColor: color }}>
          {totalDecimos} {totalDecimos === 1 ? 'número' : 'números'}
        </span>
      </div>
      <div className="divide-y divide-slate-50 px-4">
        {(data.drafts as PlayDraft[]).map((draft) => {
          const draftId = draft.id;
          return (
            <div key={draftId}>
              <LotteryDraftRow
                draft={draft} color={color}
                onDelete={() => onDelete(draftId)}
                onQty={(delta) => onQty(draftId, delta)}
                showAbonarme={deliveryMode === 'custodia'}
              />
            </div>
          );
        })}
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

  const isOpen = reviewTarget === 'lottery' && (status === 'reviewing' || status === 'confirming' || status === 'failed');
  if (!isOpen) return null;

  const balance = profile?.balance ?? 0;
  const subtotal = lotteryDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const SHIPPING_COST = 12;
  const shipping = deliveryMode === 'mensajeria' ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const isOverBalance = balance < total;
  const totalDecimos = lotteryDrafts.reduce((s, d) => s + d.quantity, 0);

  const groups = lotteryDrafts.reduce<Record<string, DrawGroupData>>((acc, draft) => {
    if (draft.selection.type !== 'national') return acc;
    const key = draft.selection.drawLabel;
    if (!acc[key]) acc[key] = { gameType: draft.gameType, drafts: [] };
    acc[key].drafts.push(draft);
    return acc;
  }, {} as Record<string, DrawGroupData>);

  const handleQty = (draftId: string, delta: number) => {
    const draft = lotteryDrafts.find((d) => d.id === draftId);
    if (!draft) return;
    const nextQty = Math.max(1, draft.quantity + delta);
    updateDraft(draftId, { ...draft, quantity: nextQty, totalPrice: draft.unitPrice * nextQty });
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
                className={`flex-1 rounded-lg py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                  deliveryMode === mode ? 'bg-manises-blue text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}>
                {mode === 'custodia' ? '🔒 Custodia digital' : '📦 Mensajería'}
              </button>
            ))}
          </div>

          {deliveryMode === 'custodia' && (
            <p className="mx-5 mb-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
              Los décimos se guardarán de forma segura en tu cuenta.
            </p>
          )}

          {errorMessage && (
            <div className="mx-5 mb-3 rounded-xl bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-600">{errorMessage}</div>
          )}

          {/* Scroll */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">

            {/* Números por sorteo */}
            {(Object.entries(groups) as Array<[string, DrawGroupData]>).map(([drawLabel, data]) => (
              <div key={drawLabel}>
                <DrawGroup drawLabel={drawLabel} data={data} deliveryMode={deliveryMode} onDelete={removeDraft} onQty={handleQty} />
              </div>
            ))}

            {/* Añadir otro sorteo */}
            <button type="button" onClick={() => setShowAddSorteo(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-[12px] font-black text-slate-400 hover:border-manises-blue/30 hover:text-manises-blue transition-colors">
              <Plus className="h-4 w-4" /> Añadir números de otro sorteo
            </button>

            {/* Datos de Envío (solo Mensajería) */}
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

            {/* Resumen económico */}
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
                <p className="text-[18px] font-black text-manises-blue">{formatCurrency(balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total del pedido</p>
                <p className={`text-[18px] font-black ${isOverBalance ? 'text-red-500' : 'text-manises-blue'}`}>{formatCurrency(total)}</p>
              </div>
            </div>
            {isOverBalance && (
              <p className="mb-2 text-center text-[10px] font-semibold text-red-400">Faltan {formatCurrency(total - balance)} para completar el pago</p>
            )}
            <button type="button" onClick={() => confirm()} disabled={isSubmitting || lotteryDrafts.length === 0 || (deliveryMode === 'mensajeria' && !shippingAddress)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-manises-blue py-4 text-[14px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
              <Lock className="h-4 w-4" />
              {isSubmitting ? 'Procesando...' : 'Comprar'}
            </button>
            {deliveryMode === 'mensajeria' && !shippingAddress && (
              <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-400">Añade una dirección de envío para continuar</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modales auxiliares */}
      <ShippingAddressModal
        isOpen={showShipping}
        onClose={() => setShowShipping(false)}
        onSave={setShippingAddress}
        savedAddress={shippingAddress}
      />
      <AddSorteoModal
        isOpen={showAddSorteo}
        onClose={() => setShowAddSorteo(false)}
        deliveryMode={deliveryMode}
      />
    </>
  );
}
