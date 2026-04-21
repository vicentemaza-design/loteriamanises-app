import type { ResultDto } from '../../contracts/results.contracts';

/**
 * Mock Results Adapter
 * Implementation of the results provider using local sample data.
 */

export const MOCK_RESULTS_DATA: ResultDto[] = [
  {
    gameId: 'euromillones',
    gameType: 'euromillones',
    date: '2026-04-08T21:00:00Z',
    numbers: [12, 23, 34, 45, 48],
    stars: [3, 7],
    jackpotNext: 130_000_000,
  },
  {
    gameId: 'primitiva',
    gameType: 'primitiva',
    date: '2026-04-08T21:30:00Z',
    numbers: [4, 15, 22, 31, 40, 49],
    complementario: 12,
    reintegro: 5,
    jackpotNext: 12_500_000,
  },
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-04-09T21:30:00Z',
    numbers: [1, 8, 14, 25, 33, 42],
    complementario: 3,
    reintegro: 0,
    jackpotNext: 1_200_000,
  },
  {
    gameId: 'gordo',
    gameType: 'gordo',
    date: '2026-04-06T13:00:00Z',
    numbers: [2, 17, 28, 35, 51],
    stars: [7],
    jackpotNext: 5_400_000,
  },
  {
    gameId: 'eurodreams',
    gameType: 'eurodreams',
    date: '2026-04-06T21:00:00Z',
    numbers: [4, 15, 22, 31, 38, 42],
    stars: [5],
    jackpotNext: 20_000,
  },
  {
    gameId: 'quiniela',
    gameType: 'quiniela',
    date: '2026-04-05T18:00:00Z',
    numbers: [1, 2, 1, 'X', 2, 1, 1, 'X', 1, 2, 1, 1, 'X', 2, 'M-1'],
    jackpotNext: 4_700_000,
  },
  {
    gameId: 'loteria-nacional',
    gameType: 'loteria-nacional',
    date: '2026-04-11T12:00:00Z',
    numbers: [6, 9, 8, 4, 4],
    jackpotNext: 60_000,
  },
];

export async function getLatestResultsMock(): Promise<ResultDto[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_RESULTS_DATA), 500);
  });
}

export async function getResultByIdMock(id: string): Promise<ResultDto | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = MOCK_RESULTS_DATA.find(r => r.gameId === id);
      resolve(result || null);
    }, 300);
  });
}
