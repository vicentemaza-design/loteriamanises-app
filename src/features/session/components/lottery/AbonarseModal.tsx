import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Xmark, Star, InfoCircle } from 'iconoir-react/regular';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';

const SUBSCRIBABLE_GAME_IDS = [
  'loteria-navidad',
  'loteria-nino',
  'loteria-nacional-jueves',
  'loteria-nacional-sabado',
];

interface AbonarseModalProps {
  isOpen: boolean;
  onClose: () => void;
  decimalNumber: string;
}

export function AbonarseModal({ isOpen, onClose, decimalNumber }: AbonarseModalProps) {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<string, number>>({} as Record<string, number>);
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const games = LOTTERY_GAMES.filter((g) => SUBSCRIBABLE_GAME_IDS.includes(g.id));

  const setQty = (gameId: string, delta: number) =>
    setQuantities((prev) => ({ ...prev, [gameId]: Math.max(0, (prev[gameId] ?? 0) + delta) }));

  const hasSelection = (Object.values(quantities) as number[]).some((q) => q > 0);
  const canAdd = hasSelection && accepted;

  return (
    <div className="fixed inset-0 z-[250] flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative mt-auto flex max-h-[90vh] flex-col rounded-t-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="text-[16px] font-black text-manises-blue">Abonarse al número {decimalNumber}</p>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Xmark className="h-4 w-4" />
          </button>
        </div>

        {/* Banner info */}
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl bg-manises-gold/10 px-3 py-2.5">
          <Star className="h-4 w-4 shrink-0 text-manises-gold" />
          <p className="text-[11px] font-semibold text-manises-blue">Este número está disponible para abonarse.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
          <p className="text-[12px] font-black text-manises-blue">¿En qué sorteos quieres abonarte?</p>

          {games.map((game) => {
            const qty = quantities[game.id] ?? 0;
            const frequency = game.type === 'navidad' ? '22 dic. 2026'
              : game.type === 'nino' ? '6 ene. 2026'
              : game.type === 'loteria-nacional' && game.id.includes('jueves') ? 'Jueves, semanal'
              : 'Sábado, semanal';

            return (
              <div key={game.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <GameBadge game={game} size="xs" tone="soft" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-manises-blue">{game.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">{frequency}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => setQty(game.id, -1)} disabled={qty === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[13px] font-black text-slate-400 disabled:opacity-30 hover:border-manises-blue hover:text-manises-blue transition-colors">
                    −
                  </button>
                  <span className="w-4 text-center text-[13px] font-black text-manises-blue">{qty}</span>
                  <button type="button" onClick={() => setQty(game.id, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[13px] font-black text-slate-400 hover:border-manises-blue hover:text-manises-blue transition-colors">
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {/* Info notice */}
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
            <InfoCircle className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <p className="text-[11px] font-medium text-blue-600">
              Puedes seleccionar la cantidad de números que quieres abonar en cada sorteo. Ajusta con los botones − y +.
            </p>
          </div>

          {/* Checkbox condiciones */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
              className="h-4 w-4 rounded accent-manises-blue" />
            <span className="text-[12px] font-medium text-slate-600">
              Acepto las <span onClick={() => navigate('/legal/condiciones-abonos')} className="text-manises-blue font-bold underline cursor-pointer">condiciones del abono</span>
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-100 px-5 pt-3 pb-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          <button type="button" onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-[13px] font-black text-slate-500 transition-all active:scale-[0.98]">
            No quiero abonarme
          </button>
          <button type="button" disabled={!canAdd}
            className="flex-1 rounded-2xl bg-manises-blue py-3.5 text-[13px] font-black text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40">
            Añadir abono a la cesta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
