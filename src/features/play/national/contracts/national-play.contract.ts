export type NationalDrawId = 'jueves' | 'sabado' | 'especial';

export interface NationalDrawConfig {
  id: NationalDrawId;
  label: string;
  weekday: number;
  hour: number;
  decimoPrice: number;
  firstPrize: number;
  secondPrize: number;
}

export interface NationalShowcaseItem {
  number: string;
  available: number;
  drawId: NationalDrawId;
  drawLabel: string;
  decimoPrice: number;
  stockLabel: string;
  badge?: 'ultimo' | 'destacado' | 'agotandose';
}

export interface NationalSearchState {
  query: string;
  sortBy: 'featured' | 'availability' | 'number';
  onlyAvailable: boolean;
}

export interface NationalCartLine {
  number: string;
  drawId: NationalDrawId;
  drawLabel: string;
  drawDates: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface NationalOrderBreakdown {
  lineCount: number;
  totalDecimos: number;
  drawsCount: number;
  subtotal: number;
  total: number;
}
