/**
 * Modo de entrega elegido en la cesta de Lotería.
 *
 * Vive fuera del componente porque `LotteryCartPanel` se DESMONTA al cerrar la
 * cesta (`if (!isOpen) return null`), así que un `useState` local volvía a
 * 'custodia' en cada apertura por mucho que el usuario hubiera elegido
 * mensajería la vez anterior.
 *
 * Es solo una preferencia de UI: no contiene datos personales, a diferencia de
 * la dirección de envío, que sigue siendo estado local a propósito. Mismo
 * patrón que features/profile/lib/security.ts.
 */
export type LotteryDeliveryMode = 'custodia' | 'mensajeria';

const DELIVERY_MODE_STORAGE_KEY = 'app_lottery_delivery_mode';
const DEFAULT_DELIVERY_MODE: LotteryDeliveryMode = 'custodia';

export function getDeliveryMode(): LotteryDeliveryMode {
  try {
    const raw = localStorage.getItem(DELIVERY_MODE_STORAGE_KEY);
    return raw === 'custodia' || raw === 'mensajeria' ? raw : DEFAULT_DELIVERY_MODE;
  } catch {
    return DEFAULT_DELIVERY_MODE;
  }
}

export function saveDeliveryMode(mode: LotteryDeliveryMode): void {
  try {
    localStorage.setItem(DELIVERY_MODE_STORAGE_KEY, mode);
  } catch {
    // Modo privado o almacenamiento bloqueado: la preferencia se pierde, pero
    // la cesta sigue funcionando con el modo elegido en esta sesión.
  }
}
