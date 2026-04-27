import type {
  NationalDrawConfig,
  NationalDrawId,
  NationalSearchState,
  NationalShowcaseItem,
} from '../contracts/national-play.contract';

export const NATIONAL_DRAW_CONFIG: NationalDrawConfig[] = [
  { id: 'jueves', label: 'Jueves', weekday: 4, hour: 21, decimoPrice: 3, firstPrize: 30_000, secondPrize: 6_000 },
  { id: 'sabado', label: 'Sábado', weekday: 6, hour: 13, decimoPrice: 6, firstPrize: 60_000, secondPrize: 12_000 },
];

const BASE_NATIONAL_NUMBERS: Array<{
  number: string;
  available: number;
  badge?: NationalShowcaseItem['badge'];
}> = [
  { number: '69844', available: 8, badge: 'destacado' },
  { number: '15432', available: 12 },
  { number: '90877', available: 5 },
  { number: '44501', available: 10 },
  { number: '77123', available: 3, badge: 'agotandose' },
  { number: '23019', available: 7 },
  { number: '58264', available: 9 },
  { number: '11038', available: 6 },
  { number: '32741', available: 2, badge: 'ultimo' },
  { number: '48390', available: 11 },
  { number: '90712', available: 4, badge: 'agotandose' },
  { number: '26518', available: 1, badge: 'ultimo' },
];

function resolveStockLabel(available: number): string {
  if (available <= 1) return 'Último décimo';
  if (available <= 4) return 'Pocas unidades';
  return 'Disponible';
}

function buildDrawShowcase(draw: NationalDrawConfig): NationalShowcaseItem[] {
  return BASE_NATIONAL_NUMBERS.map((item) => ({
    number: item.number,
    available: item.available,
    drawId: draw.id,
    drawLabel: draw.label,
    decimoPrice: draw.decimoPrice,
    stockLabel: resolveStockLabel(item.available),
    badge: item.badge,
  }));
}

export const NATIONAL_SHOWCASE_ITEMS: NationalShowcaseItem[] = NATIONAL_DRAW_CONFIG.flatMap(buildDrawShowcase);

export const NATIONAL_SPECIAL_SHOWCASE_ITEMS: NationalShowcaseItem[] = BASE_NATIONAL_NUMBERS.map((item) => ({
  number: item.number,
  available: item.available,
  drawId: 'especial',
  drawLabel: 'Especial',
  decimoPrice: 20,
  stockLabel: resolveStockLabel(item.available),
  badge: item.badge,
}));

export const DEFAULT_NATIONAL_SEARCH_STATE: NationalSearchState = {
  query: '',
  sortBy: 'featured',
  onlyAvailable: true,
};

export function getNationalShowcaseItems(drawId: NationalDrawId): NationalShowcaseItem[] {
  if (drawId === 'especial') {
    return NATIONAL_SPECIAL_SHOWCASE_ITEMS;
  }

  return NATIONAL_SHOWCASE_ITEMS.filter((item) => item.drawId === drawId);
}
