import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Spark, Trophy } from 'iconoir-react/regular';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalCartSummary } from './NationalCartSummary';
import { formatCurrency } from '@/shared/lib/utils';
import type { 
  NationalShowcaseItem, 
  NationalCartLine, 
  NationalOrderBreakdown, 
  NationalSearchState 
} from '../contracts/national-play.contract';

interface NationalDrawMeta {
  id: string;
  label: string;
  nextDraw: string;
  decimoPrice: number;
  firstPrize: number;
}

interface NationalAdvancedFlowProps {
  game: any; // Manteniendo la prop game como base
  selectedNationalDraw: NationalDrawMeta;
  selectedNationalNumber: string | null;
  selectedNationalQuantity: number;
  maxNationalQuantity: number;
  drawsCount: number;
  
  // Showcase state/actions
  nationalShowcase: {
    items: NationalShowcaseItem[];
    count: number;
    searchState: NationalSearchState;
    setSearchState: (state: NationalSearchState) => void;
  };
  
  // Cart state/actions
  nationalCart: {
    lines: NationalCartLine[];
    breakdown: NationalOrderBreakdown;
    removeLine: (number: string, drawId: any) => void;
    clearCart: () => void;
    addSelectedToCart: () => void;
  };

  onSelectNationalNumber: (ticket: NationalShowcaseItem) => void;
  onChangeNationalQuantity: (quantity: number) => void;
  onRandomNationalNumber: () => void;
  onClear: () => void;
}

/**
 * Flujo avanzado de Lotería Nacional.
 * Componente único que agrupa toda la UI avanzada (Fase 2B.3A).
 * Reutiliza buscadores y sumarios pero mantiene el selector de cantidad inline.
 */
export function NationalAdvancedFlow({
  game,
  selectedNationalDraw,
  selectedNationalNumber,
  selectedNationalQuantity,
  maxNationalQuantity,
  drawsCount,
  nationalShowcase,
  nationalCart,
  onSelectNationalNumber,
  onChangeNationalQuantity,
  onRandomNationalNumber,
  onClear,
}: NationalAdvancedFlowProps) {
  const potentialFirstPrize = selectedNationalDraw.firstPrize * selectedNationalQuantity;
  const drawType: NationalDrawType = game.id === 'loteria-navidad' ? 'navidad' : 
                                   game.id === 'loteria-nino' ? 'nino' : 'ordinary';

  return (
    <div className="space-y-8">
      {/* Cabecera Informativa con Visual del Décimo */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="font-black text-base text-manises-blue">Configuración de tu jugada</h2>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-manises-blue/70">
            Visualiza y personaliza tu décimo
          </p>
        </div>

        {/* TICKET VISUAL */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="stagger-item"
        >
          <NationalTicketVisual
            number={selectedNationalNumber}
            drawLabel={selectedNationalDraw.label}
            drawDate={selectedNationalDraw.nextDraw}
            price={selectedNationalDraw.decimoPrice}
            gameId={game.id}
            drawType={drawType}
          />
        </motion.div>
      </section>

      {/* Selector de Números */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-black text-sm text-manises-blue">Números en administración</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-400"
              onClick={onClear}
            >
              Limpiar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest border-manises-gold/40 text-manises-gold bg-manises-gold/5"
              onClick={onRandomNationalNumber}
            >
              <Spark className="w-3 h-3 mr-1" />
              Aleatorio
            </Button>
          </div>
        </div>

        <NationalSearchBar
          searchState={nationalShowcase.searchState}
          onChange={nationalShowcase.setSearchState}
        />

        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Escaparate demo
          </p>
          <p className="text-[10px] font-bold text-manises-blue/70">
            {nationalShowcase.count} números
          </p>
        </div>

        <NationalNumberShowcase
          items={nationalShowcase.items}
          selectedNumber={selectedNationalNumber}
          onSelect={onSelectNationalNumber}
        />
      </section>

      {/* Cantidad y Resumen (Inline según 2B.3A) */}
      {selectedNationalNumber && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[2rem] border border-manises-blue/10 bg-white p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tu compra</p>
              <h3 className="text-xl font-black text-manises-blue mt-1">
                {selectedNationalQuantity} {selectedNationalQuantity === 1 ? 'décimo' : 'décimos'}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</p>
              <p className="text-2xl font-black text-manises-blue mt-1">
                {formatCurrency(selectedNationalDraw.decimoPrice * selectedNationalQuantity)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl">
            <div className="ml-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ajustar cantidad</span>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Máximo {maxNationalQuantity} {maxNationalQuantity === 1 ? 'décimo disponible' : 'décimos disponibles'} para el número {selectedNationalNumber}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="icon"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
                onClick={() => onChangeNationalQuantity(Math.max(1, selectedNationalQuantity - 1))}
                disabled={selectedNationalQuantity <= 1}
                aria-label="Restar un décimo"
              >
                -
              </Button>
              <span className="w-6 text-center font-black text-lg text-manises-blue">{selectedNationalQuantity}</span>
              <Button
                variant="ghost" size="icon"
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
                onClick={() => onChangeNationalQuantity(Math.min(maxNationalQuantity, selectedNationalQuantity + 1))}
                disabled={selectedNationalQuantity >= maxNationalQuantity}
                aria-label="Sumar un décimo"
              >
                +
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
              Si este número resulta premiado con el <span className="font-black">Gordo</span>, cobrarías un total de <span className="font-black">{formatCurrency(potentialFirstPrize)}</span>.
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="rounded-2xl border-manises-blue/15 bg-manises-blue/[0.03] text-manises-blue"
              onClick={nationalCart.addSelectedToCart}
            >
              Añadir a cesta demo
            </Button>
          </div>
        </motion.section>
      )}

      <NationalCartSummary
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        onRemove={nationalCart.removeLine}
        onClear={nationalCart.clearCart}
      />
    </div>
  );
}
