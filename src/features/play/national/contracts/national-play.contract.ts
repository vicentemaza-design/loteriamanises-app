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

/**
 * Representa la intención de transformar una línea de la cesta en borradores reales.
 */
export interface NationalCartDraftIntentLine {
  number: string;
  drawId: NationalDrawId;
  drawLabel: string;
  drawDates: string[];
  quantity: number;
}

/**
 * Contrato de intención completo para la futura persistencia en PlaySession.
 */
export interface NationalCartDraftIntent {
  lines: NationalCartDraftIntentLine[];
  gameId: string;
  gameType: string;
}

/**
 * Previsualización de un borrador nacional antes de su persistencia.
 * Estructuralmente compatible con PlayDraft.
 */
export interface NationalDraftPreview {
  gameId: string;
  drawDate: string;
  number: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  drawLabel: string;
}

/**
 * Agrupación de previsualizaciones por intención original.
 */
export interface NationalDraftPreviewSummary {
  items: NationalDraftPreview[];
  totalAmount: number;
  totalDecimos: number;
}
