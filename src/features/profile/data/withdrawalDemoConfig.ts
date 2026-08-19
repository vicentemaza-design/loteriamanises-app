/**
 * Valores DEMO/PPT para la pantalla de revisión de retirada — no forman
 * parte de ningún contrato FE→BE ni de CreateWithdrawalResult (la revisión
 * ocurre ANTES de crear la solicitud, así que no pueden venir del DTO).
 *
 * Aislados aquí a propósito: cuando BE decida fee/netAmount/tiempo de
 * procesamiento reales, esto se sustituye sin tocar WithdrawalsPage más
 * allá de dejar de importar estas constantes.
 */
export const WITHDRAWAL_DEMO_FEE_LABEL = '0,00 € (Gratis)';
export const WITHDRAWAL_DEMO_PROCESSING_TIME_LABEL = '72 horas hábiles';
export const WITHDRAWAL_DEMO_PROCESSING_NOTE =
  'El saldo puede tardar aproximadamente 72 horas hábiles en reflejarse en tu extracto bancario.';
