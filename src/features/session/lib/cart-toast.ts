import { toast } from 'sonner';
import type { AddDraftResult } from '../context/PlaySessionContext';

const LUCK_MESSAGES = [
  'Te deseamos mucha suerte 🍀',
  'Que la suerte te acompañe 🍀',
  '¡Mucha suerte en el sorteo! 🍀',
  'Cruza los dedos, ya está en juego 🍀',
];

function randomLuckMessage(): string {
  return LUCK_MESSAGES[Math.floor(Math.random() * LUCK_MESSAGES.length)];
}

/**
 * Notificación al añadir jugadas a la cesta: confirma el guardado y desea suerte,
 * con acceso directo a la cesta en vez del aviso genérico anterior.
 */
export function notifyAddedToCart(result: AddDraftResult, openReview?: () => void, singularLabel = 'Jugada') {
  if (result.addedCount === 0) return;

  const title = result.duplicateCount > 0
    ? `${result.addedCount} ${result.addedCount === 1 ? 'añadida' : 'añadidas'} (${result.duplicateCount} duplicadas)`
    : result.addedCount === 1
      ? `${singularLabel} añadida a tu cesta`
      : `${result.addedCount} jugadas añadidas a tu cesta`;

  toast.success(title, {
    description: randomLuckMessage(),
    action: openReview ? { label: 'Ver cesta', onClick: openReview } : undefined,
  });
}

/** Notificación al confirmar/pagar la sesión: el momento real de "suerte" ya que la jugada queda en firme. */
export function notifyPurchaseConfirmed(count: number) {
  toast.success(count === 1 ? 'Jugada confirmada' : `${count} jugadas confirmadas`, {
    description: randomLuckMessage(),
  });
}
