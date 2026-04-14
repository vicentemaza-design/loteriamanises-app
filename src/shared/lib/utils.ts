import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un importe de bote de lotería de forma consistente en toda la app.
 * < 100M → "12,5M €"
 * >= 100M → "130M €"
 * < 1M → "125.000 €"
 * Modalidad renta (EuroDreams) → "X.000 €/mes"
 */
export function formatJackpot(amount: number, isMonthly = false): string {
  if (isMonthly) {
    return `${amount.toLocaleString('es-ES')} €/mes`
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    const formatted = millions % 1 === 0
      ? millions.toFixed(0)
      : millions.toFixed(1)
    return `${formatted}M €`
  }
  return `${amount.toLocaleString('es-ES')} €`
}

/**
 * Formatea un importe monetario como moneda española.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha ISO a formato español corto: "jue 10 abr"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Retorna el tiempo restante hasta una fecha en forma legible.
 * Si es hoy → "Hoy · HH:MM"
 * Si es mañana → "Mañana · HH:MM"
 * Si es dentro de menos de 7 días → "jue · HH:MM"
 */
export function formatDrawTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const timeStr = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (diffDays < 0) return 'Sorteo pasado'
  if (diffDays === 0) return `Hoy · ${timeStr}`
  if (diffDays === 1) return `Mañana · ${timeStr}`

  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' })
  return `${weekday} · ${timeStr}`
}

/**
 * Calcula la cuenta atrás hasta una fecha y retorna un objeto con días, horas, minutos, segundos.
 */
export function getCountdown(iso: string): {
  days: number; hours: number; minutes: number; seconds: number; isPast: boolean
} {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  }
}
