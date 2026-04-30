export interface DeliveredPrize {
  id: string;
  year: number;
  game: string;
  amount: number;
  description: string;
  highlightLabel: string;
}

export const MOCK_DELIVERED_PRIZES: DeliveredPrize[] = [
  {
    id: 'prize-2024-1',
    year: 2024,
    game: 'Euromillones',
    amount: 300_000,
    description: 'Contenido informativo demo para destacar una entrega relevante en campañas recientes.',
    highlightLabel: 'Premio destacado',
  },
  {
    id: 'prize-2024-2',
    year: 2024,
    game: 'La Primitiva',
    amount: 12_450,
    description: 'Ejemplo demo de combinación premiada mostrada como referencia de comunicación.',
    highlightLabel: 'Aviso informativo',
  },
  {
    id: 'prize-2023-1',
    year: 2023,
    game: 'Lotería Nacional',
    amount: 1_200_000,
    description: 'Contenido demo para ilustrar premios destacados dentro del historial visible en la app.',
    highlightLabel: 'Campaña destacada',
  },
  {
    id: 'prize-2023-2',
    year: 2023,
    game: 'Bonoloto',
    amount: 8_320,
    description: 'Importe demo utilizado para poblar el bloque de premios entregados.',
    highlightLabel: 'Histórico demo',
  },
  {
    id: 'prize-2022-1',
    year: 2022,
    game: 'Lotería de Navidad',
    amount: 200_000,
    description: 'Caso visual demo para comunicar campañas con mejor rendimiento histórico.',
    highlightLabel: 'Navidad demo',
  },
];

export function getDeliveredPrizesTotalAmount(): number {
  return MOCK_DELIVERED_PRIZES.reduce((sum, prize) => sum + prize.amount, 0);
}

export function getDeliveredPrizeHighlights(limit = 3): DeliveredPrize[] {
  return [...MOCK_DELIVERED_PRIZES]
    .sort((left, right) => right.amount - left.amount)
    .slice(0, limit);
}
