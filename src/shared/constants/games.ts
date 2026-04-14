import type { LotteryGame } from '@/shared/types/domain';

/**
 * MOCK DATA — Lotería Manises Demo
 * 
 * ⚠️ BACKEND INTEGRATION POINT:
 * Reemplazar este array por una llamada a la API:
 *   GET /api/games → LotteryGame[]
 * 
 * Las fechas se generan dinámicamente a partir de "hoy" para mantener
 * la demo siempre funcional sin necesitar actualizaciones manuales.
 */

/** Devuelve una fecha ISO con N días desde hoy a una hora específica */
function nextDate(daysFromNow: number, hour = 21, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const LOTTERY_GAMES: LotteryGame[] = [
  {
    id: 'euromillones',
    name: 'Euromillones',
    type: 'euromillones',
    jackpot: 105_000_000,
    nextDraw: nextDate(1, 21, 0),   // Mañana a las 21:00
    color: '#2563eb',
    colorEnd: '#1e3a8a',
    icon: 'Euro',
    price: 2.50,
    description: 'El mayor bote de Europa',
    frequency: 'Mar y Vie',
  },
  {
    id: 'primitiva',
    name: 'La Primitiva',
    type: 'primitiva',
    jackpot: 3_000_000,
    nextDraw: nextDate(2, 21, 30),  // En 2 días
    color: '#16a34a',
    colorEnd: '#14532d',
    icon: 'Dice5',
    price: 1.00,
    description: '6 números del 1 al 49',
    frequency: 'Jue y Sáb',
  },
  {
    id: 'bonoloto',
    name: 'Bonoloto',
    type: 'bonoloto',
    jackpot: 300_000,
    nextDraw: nextDate(0, 21, 30),  // Hoy a las 21:30
    color: '#0891b2',
    colorEnd: '#164e63',
    icon: 'CircleDot',
    price: 0.50,
    description: 'El más económico, cada día',
    frequency: 'Lun a Vie',
  },
  {
    id: 'gordo',
    name: 'El Gordo',
    type: 'gordo',
    jackpot: 5_300_000,
    nextDraw: nextDate(3, 13, 0),   // En 3 días (domingo)
    color: '#ea580c',
    colorEnd: '#7c2d12',
    icon: 'Star',
    price: 1.50,
    description: '5 números + clave del 0 al 9',
    frequency: 'Domingo',
  },
  {
    id: 'eurodreams',
    name: 'EuroDreams',
    type: 'eurodreams',
    jackpot: 20_000,
    nextDraw: nextDate(0, 21, 0),   // Hoy a las 21:00
    color: '#7c3aed',
    colorEnd: '#3b0764',
    icon: 'CloudMoon',
    price: 2.00,
    description: '20.000 € al mes de por vida',
    frequency: 'Lun y Jue',
    isMonthly: true,
  },
  {
    id: 'quiniela',
    name: 'La Quiniela',
    type: 'quiniela',
    jackpot: 4_700_000,
    nextDraw: nextDate(4, 18, 0),   // En 4 días (sábado)
    color: '#dc2626',
    colorEnd: '#7f1d1d',
    icon: 'Trophy',
    price: 0.50,
    description: 'Fútbol con 1X2',
    frequency: 'Sábados y jornadas',
  },
  {
    id: 'loteria-nacional',
    name: 'Lotería Nacional',
    type: 'loteria-nacional',
    jackpot: 60_000,
    nextDraw: nextDate(5, 12, 0),   // En 5 días (jueves)
    color: '#0A192F',
    colorEnd: '#1e293b',
    icon: 'Landmark',
    price: 3.00,
    description: 'Décimos de 5 cifras (jueves y sábado)',
    frequency: 'Jueves y Sábados',
  },
  {
    id: 'loteria-navidad',
    name: 'Lotería Navidad',
    type: 'navidad',
    jackpot: 2_870_000_000,
    nextDraw: (() => {
      // Siempre apunta al próximo 22 de diciembre
      const now = new Date();
      const year = now.getMonth() >= 11 && now.getDate() > 22 ? now.getFullYear() + 1 : now.getFullYear();
      return new Date(year, 11, 22, 9, 0, 0).toISOString();
    })(),
    color: '#991b1b',
    colorEnd: '#450a0a',
    icon: 'Gift',
    price: 20.00,
    description: 'El mayor sorteo del mundo',
    frequency: '22 de Diciembre',
  },
  {
    id: 'loteria-nino',
    name: 'El Niño',
    type: 'nino',
    jackpot: 700_000_000,
    nextDraw: (() => {
      // Siempre apunta al próximo 6 de enero
      const now = new Date();
      const year = now.getMonth() === 0 && now.getDate() <= 6 ? now.getFullYear() : now.getFullYear() + 1;
      return new Date(year, 0, 6, 12, 0, 0).toISOString();
    })(),
    color: '#1e40af',
    colorEnd: '#1e3a8a',
    icon: 'Baby',
    price: 20.00,
    description: 'La segunda oportunidad',
    frequency: '6 de Enero',
  },
];
