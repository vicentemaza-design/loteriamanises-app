import { motion } from 'motion/react';
import { Xmark, NavArrowRight, Star } from 'iconoir-react/regular';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { useNavigate } from 'react-router-dom';

const NATIONAL_GAME_IDS = [
  'loteria-navidad',
  'loteria-nino',
  'loteria-nacional-jueves',
  'loteria-nacional-sabado',
];

interface AddSorteoModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryMode: 'custodia' | 'mensajeria';
}

export function AddSorteoModal({ isOpen, onClose, deliveryMode }: AddSorteoModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const games = LOTTERY_GAMES.filter((g) => NATIONAL_GAME_IDS.includes(g.id));

  const handleSelect = (gameId: string) => {
    onClose();
    navigate(`/play/${gameId}`);
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative mt-auto flex max-h-[85vh] flex-col rounded-t-3xl bg-[#f6f8fb] shadow-2xl">

        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <div>
            <p className="text-[16px] font-black text-manises-blue">Añadir décimos de otro sorteo</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Selecciona el sorteo al que quieres añadir décimos</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Xmark className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-2 mt-3">
          {games.map((game) => {
            const nextDraw = game.nextDraw
              ? new Date(game.nextDraw).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
              : null;
            const isCompatible = deliveryMode === 'custodia' || true; // mensajería supports all

            return (
              <div key={game.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(game.id)}
                  disabled={!isCompatible}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-all hover:border-manises-blue/20 hover:shadow-md active:scale-[0.99] disabled:opacity-40"
                >
                  <GameBadge game={game} size="xs" tone="soft" className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-black text-manises-blue">{game.name}</p>
                    {nextDraw && <p className="text-[11px] font-medium text-slate-400 mt-0.5">Próximo sorteo: {nextDraw}</p>}
                  </div>
                  <NavArrowRight className="shrink-0 h-4 w-4 text-slate-400" />
                </button>
              </div>
            );
          })}

          {/* Sorteos especiales */}
          <div>
            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-all hover:border-manises-blue/20 hover:shadow-md active:scale-[0.99]"
              onClick={() => { onClose(); navigate('/games'); }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-gold/10 border border-manises-gold/20">
                <Star className="h-4 w-4 text-manises-gold" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-black text-manises-blue">Sorteos especiales</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Consulta los sorteos disponibles</p>
              </div>
              <NavArrowRight className="shrink-0 h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
