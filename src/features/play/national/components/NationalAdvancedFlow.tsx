import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Spark, ControlSlider } from 'iconoir-react/regular';
import { cn, formatDate } from '@/shared/lib/utils';
import { NationalTicketVisual, type NationalDrawType } from '@/features/play/components/NationalTicketVisual';
import { NationalSearchBar } from './NationalSearchBar';
import { NationalNumberShowcase } from './NationalNumberShowcase';
import { NationalTicketQuantitySelector } from './NationalTicketQuantitySelector';
import { NationalCartSummary } from './NationalCartSummary';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';
import { NationalReservationCard } from './NationalReservationCard';
import type {
  NationalShowcaseItem,
  NationalCartLine,
  NationalOrderBreakdown,
  NationalSearchState
} from '../contracts/national-play.contract';
import type { LotteryGame } from '@/shared/types/domain';
import { toast } from 'sonner';

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

  nationalShowcase: {
    items: NationalShowcaseItem[];
    count: number;
    searchState: NationalSearchState;
    setSearchState: (state: NationalSearchState) => void;
  };

  nationalCart: {
    lines: NationalCartLine[];
    breakdown: NationalOrderBreakdown;
    removeLine: (number: string, drawId: NationalCartLine['drawId']) => void;
    updateQuantity: (number: string, drawId: NationalCartLine['drawId'], delta: number) => void;
    clearCart: () => void;
    addSelectedToCart: (deliveryMode: DeliveryMode) => void;
    onPersistToSession?: () => void;
  };

  onSelectNationalNumber: (ticket: NationalShowcaseItem) => void;
  onChangeNationalQuantity: (quantity: number) => void;
  onRandomNationalNumber: () => void;
  onClear: () => void;
}

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
  const [mockReservation, setMockReservation] = useState<{ number: string; drawLabel: string; drawDate: string } | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleReserve = () => {
    if (!selectedNationalNumber) return;
    setMockReservation({
      number: selectedNationalNumber,
      drawLabel: selectedNationalDraw.label,
      drawDate: selectedNationalDraw.nextDraw,
    });
    toast.success(`Reserva demo preparada para el nº ${selectedNationalNumber}`);
  };

  const drawType: NationalDrawType = game.id === 'loteria-navidad' ? 'navidad' :
                                     game.id === 'loteria-nino' ? 'nino' : 'ordinary';

  const deliveryLabel = deliveryMode === 'custody' ? 'Custodia digital' : 'Mensajería';

  return (
    <div className="space-y-6">
      {/* 1. Cabecera — título igual que en main */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-black text-base text-manises-blue">Configuración de tu jugada</h2>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-manises-blue/70">
            Visualiza y personaliza tu décimo
          </p>
        </div>

        {/* 2. Décimo visual — protagonista, siempre visible */}
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

      {/* 3. Selector de números — "Números en administración" */}
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

        <NationalNumberShowcase
          items={nationalShowcase.items}
          selectedNumber={selectedNationalNumber}
          onSelect={onSelectNationalNumber}
        />
      </section>

      {/* 4. Cantidad y acciones — solo cuando hay número seleccionado */}
      {selectedNationalNumber && (
        <NationalTicketQuantitySelector
          selectedNumber={selectedNationalNumber}
          selectedQuantity={selectedNationalQuantity}
          maxQuantity={maxNationalQuantity}
          decimoPrice={selectedNationalDraw.decimoPrice}
          firstPrize={selectedNationalDraw.firstPrize}
          onQuantityChange={onChangeNationalQuantity}
          onAddToCart={() => nationalCart.addSelectedToCart(deliveryMode)}
          onReserve={handleReserve}
        />
      )}

      {/* 5. Configuración de entrega — secundaria, colapsable */}
      <section className="stagger-item">
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="group w-full text-left rounded-[1.2rem] border border-slate-200/60 bg-white px-3.5 py-3 shadow-sm hover:border-manises-blue/20 hover:shadow-md transition-all active:scale-[0.99]"
          aria-expanded={isConfigOpen}
          aria-label="Configurar tipo de entrega"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-blue/[0.06]">
              <ControlSlider className="w-4 h-4 text-manises-blue/60" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[12px] font-black text-manises-blue leading-tight">
                Tipo de entrega
              </span>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400 truncate">
                {deliveryLabel} · {formatDate(selectedNationalDraw.nextDraw)}
              </p>
            </div>
            <span className={cn(
              'shrink-0 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-colors',
              isConfigOpen
                ? 'bg-manises-blue/10 text-manises-blue'
                : 'bg-manises-blue/[0.06] text-manises-blue/60 group-hover:bg-manises-blue/10 group-hover:text-manises-blue'
            )}>
              {isConfigOpen ? 'Cerrar' : 'Cambiar'}
            </span>
          </div>
        </button>

        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <NationalDeliverySelector
              selectedMode={deliveryMode}
              onChange={(mode) => { setDeliveryMode(mode); setIsConfigOpen(false); }}
            />
          </motion.div>
        )}
      </section>

      {/* 6. Búsqueda y filtros — secundaria */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-black text-sm text-manises-blue">Busca por número</h2>
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

      {/* 7. Reserva demo */}
      {mockReservation && (
        <section className="stagger-item">
          <NationalReservationCard
            number={mockReservation.number}
            drawLabel={mockReservation.drawLabel}
            drawDate={mockReservation.drawDate}
            onRemove={() => setMockReservation(null)}
          />
        </section>
      )}

      {/* 8. Cesta nacional */}
      <NationalCartSummary
        lines={nationalCart.lines}
        breakdown={nationalCart.breakdown}
        onRemove={nationalCart.removeLine}
        onUpdateQuantity={nationalCart.updateQuantity}
        onClear={nationalCart.clearCart}
        onPersistToSession={nationalCart.onPersistToSession}
      />
    </div>
  );
}
