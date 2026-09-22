import type { FailedVerificationOutcome } from '@/features/profile/types/profile.types';

/**
 * Alias reservados que provocan cada desenlace de la verificación de
 * titularidad en la variante DEMO.
 *
 * Existen porque en demo no hay banco detrás: sin ellos la verificación
 * siempre sale bien y no hay forma de recorrer el camino del fallo, que es
 * justo el que hay que poder enseñar. Antes estaban escondidos dentro del
 * mock y había que saberse la palabra exacta; ahora el formulario de alta
 * los ofrece como atajo cuando el modo demo está activo.
 *
 * Fuente única: los consume el formulario (para ofrecerlos) y el mock (para
 * interpretarlos). No forman parte de ningún contrato FE→BE — en producción
 * el desenlace lo decide el proveedor bancario y el alias es un alias.
 */
export interface DemoVerificationAlias {
  alias: string;
  label: string;
  outcome: FailedVerificationOutcome;
}

export const DEMO_VERIFICATION_ALIASES: DemoVerificationAlias[] = [
  { alias: 'demo mismatch',    label: 'Titular no coincide', outcome: 'mismatch' },
  { alias: 'demo unavailable', label: 'Servicio caído',      outcome: 'unavailable' },
  { alias: 'demo error',       label: 'Error inesperado',    outcome: 'error' },
];

/** Mapa alias → desenlace, en minúsculas, para el mock. */
export const DEMO_ALIAS_OUTCOMES: Record<string, FailedVerificationOutcome> =
  Object.fromEntries(DEMO_VERIFICATION_ALIASES.map(a => [a.alias, a.outcome]));
