/**
 * Dirección de envío de la cesta de Lotería.
 *
 * PUENTE, NO DESTINO. El sitio correcto de este dato es el perfil del usuario
 * en backend, pero hoy no existe: `ShippingAddress` es un tipo de UI y ni el
 * dominio (`shared/types/domain.ts` solo la guarda DENTRO de un décimo ya
 * comprado, como metadato de ese envío) ni los contratos de API tienen un
 * concepto de "dirección guardada del usuario". Definir aquí ese contrato
 * sería inventarle al backend una forma que aún no ha decidido — ver la
 * sección 3 de docs/fe-handoff/mejoras-y-paso-a-produccion.md.
 *
 * Mientras tanto se guarda en el dispositivo, porque la alternativa es que el
 * usuario reescriba nombre, teléfono, email y dirección cada vez que abre la
 * cesta: `LotteryCartPanel` se desmonta al cerrarla.
 *
 * Son datos personales, así que:
 *   - se borran al cerrar sesión (ver AuthProvider.logout), para no dejarlos
 *     al siguiente que use el móvil;
 *   - viven solo en este dispositivo, nunca se envían a ningún sitio por su
 *     cuenta: solo viajan cuando el usuario confirma una compra.
 *
 * Cuando el backend defina el contrato, esto se sustituye por una lectura y
 * escritura de perfil y este fichero desaparece.
 */
export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  cp: string;
  city: string;
  province: string;
  country: string;
}

const SHIPPING_ADDRESS_STORAGE_KEY = 'app_lottery_shipping_address';

/** Una dirección sin nombre ni calle es la que deja el botón de "Eliminar". */
function isEmpty(address: ShippingAddress | null): boolean {
  return !address || (!address.name.trim() && !address.street.trim());
}

export function getShippingAddress(): ShippingAddress | null {
  try {
    const raw = localStorage.getItem(SHIPPING_ADDRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShippingAddress;
    return isEmpty(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function saveShippingAddress(address: ShippingAddress | null): void {
  try {
    if (isEmpty(address)) {
      localStorage.removeItem(SHIPPING_ADDRESS_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SHIPPING_ADDRESS_STORAGE_KEY, JSON.stringify(address));
  } catch {
    // Almacenamiento bloqueado: la dirección sigue viva en memoria mientras
    // la cesta esté abierta, solo no sobrevive a cerrarla.
  }
}

export function clearShippingAddress(): void {
  try {
    localStorage.removeItem(SHIPPING_ADDRESS_STORAGE_KEY);
  } catch {
    // Nada que hacer: si no se puede escribir, tampoco se pudo guardar.
  }
}
