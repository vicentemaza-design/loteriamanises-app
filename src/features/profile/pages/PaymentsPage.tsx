import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Plus, Shield, Trash2, Star, AlertTriangle, ChevronRight, CreditCard, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { MOCK_PAYMENT_CARDS } from '../data/profile.mock';
import type { PaymentCard } from '../types/profile.types';

import visaLogo from '@/assets/games/visa.svg';
import mastercardLogo from '@/assets/games/mastercard.svg';

const HOW_TO_STEPS = [
  'Realiza una recarga de saldo por el importe que desees (mínimo 1 €).',
  'Durante el pago, marca la opción "Guardar tarjeta para futuras compras".',
  'El importe de la recarga se añadirá a tu saldo y podrás utilizarlo en la compra.',
  'Al finalizar el pago, tu tarjeta quedará almacenada en Redsys.',
  'La próxima vez, podrás pagar de forma rápida sin volver a introducir los datos.',
];

export function PaymentsPage() {
  const navigate = useNavigate();

  const [cards, setCards] = useState<PaymentCard[]>(() => {
    const saved = localStorage.getItem('manises_payment_cards');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return MOCK_PAYMENT_CARDS;
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const saveCards = (next: PaymentCard[]) => {
    setCards(next);
    localStorage.setItem('manises_payment_cards', JSON.stringify(next));
  };

  const setDefaultCard = (id: string) => {
    saveCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success('Tarjeta predeterminada actualizada.');
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const next = cards.filter(c => c.id !== deleteConfirm);
    if (cards.find(c => c.id === deleteConfirm)?.isDefault && next.length > 0) {
      next[0].isDefault = true;
    }
    saveCards(next);
    setDeleteConfirm(null);
    toast.success('Tarjeta eliminada con éxito.');
  };

  const getCardStyle = (brand: string) => {
    if (brand === 'Mastercard') return { gradient: 'from-slate-800 to-slate-900', logo: mastercardLogo };
    return { gradient: 'from-blue-900 to-indigo-950', logo: visaLogo };
  };

  return (
    <div className="flex min-h-full flex-col bg-[#f5f7fa] pb-24">
      <ProfileSubHeader title="Métodos de Pago" />

      <div className="flex flex-col gap-4 px-4 pt-5 pb-6">

        {/* ── TARJETAS GUARDADAS ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Tarjetas guardadas por Redsys
            </p>
            <Info className="w-3 h-3 text-slate-300" />
          </div>

          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {cards.map(card => {
                const style = getCardStyle(card.brand);
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
                  >
                    {/* Mini tarjeta — proporción ISO/IEC 7810, ~42% del contenedor */}
                    <div
                      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg`}
                      style={{ width: '42%', aspectRatio: '85.6 / 53.98' }}
                    >
                      <div className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="relative z-10 flex h-full flex-col justify-between p-3">
                        {/* Chip + NFC */}
                        <div className="flex items-start justify-between">
                          <div
                            className="h-[18px] w-[26px] rounded-[3px]"
                            style={{
                              background: 'linear-gradient(135deg, #f9e77e 0%, #c8960a 45%, #f5c518 70%, #a07010 100%)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)',
                            }}
                          />
                          <svg width="11" height="13" viewBox="0 0 18 20" fill="none" className="opacity-25">
                            <path d="M9 4 Q14 10 9 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                            <path d="M9 1 Q17 10 9 19" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                            <circle cx="9" cy="10" r="1.5" fill="white"/>
                          </svg>
                        </div>
                        {/* Número */}
                        <p className="font-mono text-[8.5px] font-bold tracking-[0.14em] text-white/90">
                          •••• •••• •••• {card.last4}
                        </p>
                        {/* Caduca + logo */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[5px] font-bold uppercase tracking-[0.15em] text-white/40">Caduca</p>
                            <p className="font-mono text-[8px] font-bold tracking-[0.08em] text-white/80">{card.expires}</p>
                          </div>
                          <img src={style.logo} alt={card.brand} className="h-[18px] object-contain brightness-0 invert opacity-75" />
                        </div>
                      </div>
                    </div>

                    {/* Info + acciones */}
                    <div className="flex flex-1 flex-col gap-2.5 min-w-0">
                      <div>
                        <p className="text-[13px] font-black text-manises-blue leading-none">
                          {card.brand} •••• {card.last4}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-slate-400">Caduca: {card.expires}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {card.isDefault ? (
                          <span className="flex items-center gap-1 text-[11px] font-black text-manises-blue">
                            <Star className="w-3.5 h-3.5 fill-manises-gold text-manises-gold" />
                            Predeterminada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDefaultCard(card.id)}
                            className="flex w-fit items-center gap-1 text-[11px] font-bold text-slate-400 active:scale-95 transition-transform"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Hacer predeterminada
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(card.id)}
                          className="flex w-fit items-center gap-1 text-[11px] font-bold text-red-400 active:scale-95 transition-transform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* ── GUARDAR NUEVA TARJETA (CTA) ─────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate('/profile/wallet')}
          className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-manises-blue/20 bg-white px-4 py-3.5 text-left shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-blue/10">
            <Plus className="h-5 w-5 text-manises-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-manises-blue">Guardar nueva tarjeta</p>
            <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-400">
              Para guardar tu tarjeta necesitas realizar una recarga de saldo mínima 1 €.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </button>

        {/* ── CÓMO GUARDAR UNA TARJETA ────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-blue/10">
              <CreditCard className="h-4 w-4 text-manises-blue" />
            </div>
            <div>
              <p className="text-[12px] font-black text-manises-blue">¿Cómo guardar una tarjeta?</p>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-400">
                Para guardar tu tarjeta y pagar más rápido en futuras compras:
              </p>
            </div>
          </div>
          <div className="px-4 py-3.5 space-y-2.5">
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-manises-blue text-white text-[9px] font-black mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[11px] font-medium leading-snug text-slate-500">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AVISO DE SEGURIDAD ───────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
          <Shield className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
            Las tarjetas se almacenan de forma segura por{' '}
            <span className="font-black text-slate-600">Redsys</span>{' '}
            (entidad bancaria Redsys). Lotería Manises nunca guarda los datos
            completos de tu tarjeta.
          </p>
        </div>

        {/* ── CTA PRINCIPAL ────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate('/profile/wallet')}
          className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 100%)' }}
        >
          Recargar saldo y guardar tarjeta
        </button>

      </div>

      {/* ── Confirmación de eliminar ─────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 z-[90] bg-black"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="fixed inset-x-4 z-[100] top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-manises-blue">¿Eliminar esta tarjeta?</h3>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
                    Esta acción es irreversible y no podrás usarla para recargas rápidas.
                  </p>
                </div>
                <div className="flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 rounded-2xl border border-slate-200 py-3 text-[12px] font-bold text-slate-600 active:scale-95 transition-transform"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 py-3 text-[12px] font-black text-white active:scale-95 transition-transform"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
