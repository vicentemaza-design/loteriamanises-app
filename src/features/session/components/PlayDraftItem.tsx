import React from 'react';
import { Trash, EditPencil } from 'iconoir-react/regular';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import { GameBadge } from '@/shared/ui/GameBadge';
import type { PlayDraft } from '../types/session.types';

function renderSelectionLabel(draft: PlayDraft) {
  switch (draft.selection.type) {
    case 'national':
      return `${draft.selection.number} · ${draft.quantity} ${draft.quantity === 1 ? 'décimo' : 'décimos'}`;
    case 'quiniela':
      return `${draft.selection.matches.length} partidos${draft.selection.systemId ? ` · ${draft.selection.systemId}` : ''}`;
    case 'euromillones':
      return `${draft.selection.numbers.join(', ')} + ${draft.selection.stars.join(', ')}`;
    case 'gordo':
      return `${draft.selection.numbers.join(', ')} · Clave ${draft.selection.key}`;
    case 'eurodreams':
      return `${draft.selection.numbers.join(', ')} · Sueño ${draft.selection.dream}`;
    case 'primitiva':
    case 'bonoloto':
      return draft.selection.numbers.join(', ');
    default:
      return 'Selección preparada';
  }
}

export function PlayDraftItem({
  draft,
  onEdit,
  onRemove,
}: {
  draft: PlayDraft;
  onEdit: () => void;
  onRemove: () => void;
  key?: React.Key;
}): React.ReactElement {
  const game = LOTTERY_GAMES.find((entry) => entry.id === draft.gameId);
  const gameDisplay = game ?? {
    id: draft.gameId,
    name: draft.gameName,
    type: draft.gameType,
    color: '#0a4792',
    colorEnd: '#1e3a8a',
    icon: '',
    jackpot: 0,
    nextDraw: draft.drawDate,
    price: draft.unitPrice,
  };

  return (
    <div className="rounded-[1.6rem] border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <GameBadge game={gameDisplay} size="xs" tone="soft" className="mt-0.5 shadow-none" />
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {formatDate(draft.drawDate)}
              </span>
              <h3 className="mt-1 text-sm font-black text-manises-blue">
                {game?.name ?? draft.gameName}
              </h3>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                {renderSelectionLabel(draft)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-manises-blue">{formatCurrency(draft.totalPrice)}</p>
          <span
            className={cn(
              'mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]',
              draft.status === 'valid' || draft.status === 'editing'
                ? 'bg-emerald-50 text-emerald-700'
                : draft.status === 'stale'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-700'
            )}
          >
            {draft.status === 'stale' ? 'Sorteo cerrado' : draft.status === 'unavailable' ? 'No disponible' : 'Lista'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onEdit}>
          <EditPencil className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl text-rose-700 hover:bg-rose-50" onClick={onRemove}>
          <Trash className="h-4 w-4" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
