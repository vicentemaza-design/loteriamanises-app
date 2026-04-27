export interface DeliveredPrize {
  id: string;
  year: number;
  game: string;
  amount: number;
  description: string;
}

export const MOCK_DELIVERED_PRIZES: DeliveredPrize[] = [
  {
    id: 'prize-2024-1',
    year: 2024,
    game: 'Euromillones',
    amount: 300_000,
    description: 'Décimo de primera categoría vendido en nuestra administración.',
  },
  {
    id: 'prize-2024-2',
    year: 2024,
    game: 'La Primitiva',
    amount: 12_450,
    description: 'Boleto de segunda categoría con 5 aciertos más reintegro.',
  },
  {
    id: 'prize-2023-1',
    year: 2023,
    game: 'Lotería Nacional',
    amount: 1_200_000,
    description: 'Décimo premiado del sorteo extraordinario de El Niño.',
  },
  {
    id: 'prize-2023-2',
    year: 2023,
    game: 'Bonoloto',
    amount: 8_320,
    description: 'Boleto ganador de segunda categoría.',
  },
  {
    id: 'prize-2022-1',
    year: 2022,
    game: 'Lotería de Navidad',
    amount: 200_000,
    description: 'Décimo del sorteo de Navidad vendido en nuestra administración.',
  },
];
