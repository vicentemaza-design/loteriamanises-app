/**
 * Utilidades para el manejo consistente de fechas y zonas horarias.
 * Garantiza que toda la plataforma opere bajo 'Europe/Madrid' y 
 * que el día de negocio se calcule sin ambigüedades.
 */

export const BUSINESS_TIMEZONE = 'Europe/Madrid';

/**
 * Retorna el día lógico de un evento (sorteo, ticket, resultado) en formato YYYY-MM-DD
 * basándose explícitamente en la zona horaria Europe/Madrid.
 */
export function getBusinessDate(dateInput: Date | string | number = new Date()): string {
  const date = new Date(dateInput);
  
  // Usar en-CA (Canadá Inglés) es el estándar de Intl para garantizar YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(date);
}

/**
 * Retorna la fecha actual local como día de negocio YYYY-MM-DD.
 */
export function getTodayBusinessDate(): string {
  return getBusinessDate(new Date());
}
