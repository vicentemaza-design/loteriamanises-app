import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Spark } from 'iconoir-react/regular';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalTicketQuantitySelector } from './NationalTicketQuantitySelector';
import { NationalCartSummary } from './NationalCartSummary';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';
import type { 
  NationalShowcaseItem, 
  NationalCartLine, 
  NationalOrderBreakdown, 
  NationalSearchState 
} from '../contracts/national-play.contract';
import type { LotteryGame } from '@/shared/types/domain';

interface NationalDrawMeta {
  id: string;
  label: string;
  nextDraw: string;
  decimoPrice: number;
  firstPrize: number;
}

interface NationalAdvancedFlowProps {
  game: LotteryGame;
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
    removeLine: (number: string, drawId: NationalCartLine['drawId']) => void;
    clearCart: () => void;
    addSelectedToCart: () => void;
    onPersistToSession?: () => void;
  };

  onSelectNationalNumber: (ticket: NationalShowcaseItem) => void;
  onChangeNationalQuantity: (quantity: number) => void;
  onRandomNationalNumber: () => void;
  onClear: () => void;
}

/**
 * Flujo avanzado de Lotería Nacional (Refinado en Fase 3B.1).
 * Prioriza selector de entrega, buscador y escaparate visible rápido.
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
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('custody');

  const drawType: NationalDrawType = game.id === 'loteria-navidad' ? 'navidad' : 
                                   game.id === 'loteria-nino' ? 'nino' : 'ordinary';

  return (
    <div className="space-y-8">
      {/* 1. Selector de Entrega (Decisión previa compacta) */}
      <section className="stagger-item">
        <NationalDeliverySelector 
          selectedMode={deliveryMode} 
          onChange={setDeliveryMode} 
        />
      </section>

      {/* 2. Buscador Protagonista */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-black text-sm text-manises-blue">Busca tu número</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-400"
            onClick={onClear}
          >
            Limpiar filtros
          </Button>
        </div>

        <NationalSearchBar
          searchState={nationalShowcase.searchState}
          onChange={nationalShowcase.setSearchState}
        />
      </section>

      {/* 3. Escaparate visible rápido */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Escaparate demo ({nationalShowcase.count} números)
          </p>
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

        <NationalNumberShowcase
          items={nationalShowcase.items}
          selectedNumber={selectedNationalNumber}
          onSelect={onSelectNationalNumber}
        />
      </section>

      {/* 4. Visual del Décimo (Solo cuando hay selección o como bloque secundario) */}
      {selectedNationalNumber && (
        <section className="space-y-4 pt-4 border-t border-slate-100">
           <div>
            <h2 className="font-black text-sm text-manises-blue">Tu décimo seleccionado</h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-manises-blue/50">
              Personaliza la cantidad de décimos iguales
            </p>
          </div>

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

          <NationalTicketQuantitySelector
            selectedNumber={selectedNationalNumber}
            selectedQuantity={selectedNationalQuantity}
            maxQuantity={maxNationalQuantity}
            decimoPrice={selectedNationalDraw.decimoPrice}
            firstPrize={selectedNationalDraw.firstPrize}
            onQuantityChange={onChangeNationalQuantity}
            onAddToCart={nationalCart.addSelectedToCart}
          />
        </section>
      )}

      {/* 5. Cesta Clara Después */}
      <NationalCartSummary
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        onRemove={nationalCart.removeLine}
        onClear={nationalCart.clearCart}
        onPersistToSession={nationalCart.onPersistToSession}
      />
    </div>
  );
}
