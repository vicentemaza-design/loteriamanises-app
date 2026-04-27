import type { Ticket } from '@/shared/types/domain';
import { ReceiptNumbersBlock } from './ReceiptNumbersBlock';
import { ReceiptQuinielaTable } from './ReceiptQuinielaTable';
import { NationalDecimoCard } from './NationalDecimoCard';

interface GameReceiptVisualProps {
  ticket: Ticket;
  selectionSummary?: string;
}

export function GameReceiptVisual({ ticket, selectionSummary }: GameReceiptVisualProps) {
  const { gameType, numbers, stars } = ticket;

  // Dispatcher por tipo de juego
  switch (gameType) {
    case 'euromillones':
      return (
        <div className="space-y-6 py-4">
          <ReceiptNumbersBlock label="Combinación" numbers={numbers} />
          {stars && stars.length > 0 && (
            <ReceiptNumbersBlock label="Estrellas" numbers={stars} variant="circle" />
          )}
        </div>
      );

    case 'eurodreams':
      return (
        <div className="space-y-6 py-4">
          <ReceiptNumbersBlock label="Combinación" numbers={numbers} />
          {stars && stars.length > 0 && (
            <ReceiptNumbersBlock label="Sueño" numbers={[stars[0]]} variant="circle" />
          )}
        </div>
      );

    case 'gordo':
      return (
        <div className="space-y-6 py-4">
          <ReceiptNumbersBlock label="Números" numbers={numbers} />
          {stars && stars.length > 0 && (
            <ReceiptNumbersBlock label="Clave" numbers={[stars[0]]} variant="circle" />
          )}
        </div>
      );

    case 'primitiva':
    case 'bonoloto':
      return (
        <div className="py-4">
          <ReceiptNumbersBlock label="Combinación" numbers={numbers} />
        </div>
      );

    case 'quiniela': {
      // Intentamos recuperar los picks reales de la Quiniela. 
      // En la demo, si no están mapeados en numbers, usamos un placeholder descriptivo.
      // Si numbers tiene longitud > 0, asumimos que son los resultados mapeados (1, 0->X, 2).
      const picks = numbers.length > 0 
        ? numbers.map(n => n === 0 ? 'X' : n.toString())
        : (ticket.metadata?.picks as string[]) || [];

      return (
        <div className="py-4">
          <p className="mb-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pronóstico</p>
          {picks.length > 0 ? (
            <ReceiptQuinielaTable picks={picks} />
          ) : (
            <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-[11px] font-mono text-slate-400">Ver resumen en detalle expandido</p>
            </div>
          )}
        </div>
      );
    }

    case 'loteria-nacional':
    case 'navidad':
    case 'nino': {
      const displayNumber = (ticket.metadata?.nationalNumber as string) || numbers.join('');
      return (
        <div className="py-4">
          <NationalDecimoCard ticket={ticket} displayNumber={displayNumber} />
        </div>
      );
    }

    default:
      return (
        <div className="py-4 text-center text-sm font-bold tracking-wider text-manises-blue">
          {selectionSummary || numbers.join('  ')}
        </div>
      );
  }
}
