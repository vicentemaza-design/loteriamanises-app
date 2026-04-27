import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Spark } from 'iconoir-react/regular';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalTicketQuantitySelector } from './NationalTicketQuantitySelector';
import { NationalCartSummary } from './NationalCartSummary';
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
  game: any;
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
 * Flujo avanzado de Lotería Nacional (Refinado en Fase 2B.3B).
 * Utiliza subcomponentes extraídos para mayor claridad.
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
          <h2 className="font-black text-sm text-manises-blue">Números disponibles (Simulación)</h2>
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
            Escaparate simulado
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

      {/* Cantidad y Resumen (Componente extraído en 2B.3B) */}
      {selectedNationalNumber && (
        <NationalTicketQuantitySelector
          selectedNumber={selectedNationalNumber}
          selectedQuantity={selectedNationalQuantity}
          maxQuantity={maxNationalQuantity}
          decimoPrice={selectedNationalDraw.decimoPrice}
          firstPrize={selectedNationalDraw.firstPrize}
          onQuantityChange={onChangeNationalQuantity}
          onAddToCart={nationalCart.addSelectedToCart}
        />
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
