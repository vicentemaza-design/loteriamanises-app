export type ReducedSystemId = string;

export interface ReducedSystemTable {
  unitPrice: number;
  rows: Record<number, Record<ReducedSystemId, number | null>>;
}

export const PRIMITIVA_REDUCED_TABLE: ReducedSystemTable = {
  unitPrice: 1,
  rows: {
    10: { reducida_5: 18, reducida_4: 5, reducida_3: null },
    11: { reducida_5: 34, reducida_4: 11, reducida_3: null },
    12: { reducida_5: 68, reducida_4: 10, reducida_3: 4 },
    13: { reducida_5: 116, reducida_4: 23, reducida_3: 7 },
    14: { reducida_5: 203, reducida_4: 23, reducida_3: 7 },
    15: { reducida_5: 315, reducida_4: 31, reducida_3: null },
    16: { reducida_5: 504, reducida_4: 53, reducida_3: 9 },
    17: { reducida_5: 588, reducida_4: 75, reducida_3: 14 },
    18: { reducida_5: 756, reducida_4: 104, reducida_3: 20 },
    19: { reducida_5: 988, reducida_4: 125, reducida_3: 28 },
    20: { reducida_5: 1336, reducida_4: 154, reducida_3: 30 },
    21: { reducida_5: 1800, reducida_4: 196, reducida_3: 26 },
    22: { reducida_5: 2437, reducida_4: 248, reducida_3: 77 },
    23: { reducida_5: 3249, reducida_4: 299, reducida_3: null },
    24: { reducida_5: 4316, reducida_4: 367, reducida_3: 74 },
    25: { reducida_5: 5632, reducida_4: 434, reducida_3: 78 },
    26: { reducida_5: 7318, reducida_4: 520, reducida_3: 80 },
    27: { reducida_5: 9350, reducida_4: 623, reducida_3: 86 },
    28: { reducida_5: null, reducida_4: 734, reducida_3: 91 },
    29: { reducida_5: null, reducida_4: 853, reducida_3: 94 },
    30: { reducida_5: null, reducida_4: 1005, reducida_3: 115 },
    31: { reducida_5: null, reducida_4: 1163, reducida_3: 125 },
    32: { reducida_5: null, reducida_4: 1331, reducida_3: 131 },
    33: { reducida_5: null, reducida_4: 1528, reducida_3: 139 },
    34: { reducida_5: null, reducida_4: 1737, reducida_3: 152 },
    35: { reducida_5: null, reducida_4: 1973, reducida_3: 164 },
    36: { reducida_5: null, reducida_4: 2240, reducida_3: 184 },
    37: { reducida_5: null, reducida_4: 2539, reducida_3: 199 },
    38: { reducida_5: null, reducida_4: 2836, reducida_3: 221 },
    39: { reducida_5: null, reducida_4: 3165, reducida_3: 244 },
    40: { reducida_5: null, reducida_4: 3533, reducida_3: 275 },
    41: { reducida_5: null, reducida_4: 3964, reducida_3: 285 },
    42: { reducida_5: null, reducida_4: 4385, reducida_3: 307 },
    43: { reducida_5: null, reducida_4: 4858, reducida_3: 330 },
    44: { reducida_5: null, reducida_4: 5368, reducida_3: 355 },
    45: { reducida_5: null, reducida_4: 5933, reducida_3: 380 },
    46: { reducida_5: null, reducida_4: 6509, reducida_3: 411 },
    47: { reducida_5: null, reducida_4: null, reducida_3: 440 },
    48: { reducida_5: null, reducida_4: 7835, reducida_3: 477 },
    49: { reducida_5: null, reducida_4: 8563, reducida_3: 496 },
  },
};

export const BONOLOTO_REDUCED_TABLE: ReducedSystemTable = {
  unitPrice: 0.5,
  rows: {
    10: { reducida_5: 18, reducida_4: 5, reducida_3: null },
    11: { reducida_5: 34, reducida_4: 11, reducida_3: null },
    12: { reducida_5: 68, reducida_4: 10, reducida_3: 4 },
    13: { reducida_5: 116, reducida_4: 23, reducida_3: 4 },
    14: { reducida_5: 203, reducida_4: 23, reducida_3: 7 },
    15: { reducida_5: 315, reducida_4: 31, reducida_3: null },
    16: { reducida_5: 504, reducida_4: 53, reducida_3: 9 },
    17: { reducida_5: 588, reducida_4: 75, reducida_3: 14 },
    18: { reducida_5: 756, reducida_4: 104, reducida_3: 20 },
    19: { reducida_5: 988, reducida_4: 125, reducida_3: 28 },
    20: { reducida_5: 1336, reducida_4: 154, reducida_3: 30 },
    21: { reducida_5: 1800, reducida_4: 196, reducida_3: 26 },
    22: { reducida_5: 2437, reducida_4: 248, reducida_3: 77 },
    23: { reducida_5: 3249, reducida_4: 299, reducida_3: null },
    24: { reducida_5: 4316, reducida_4: 367, reducida_3: 74 },
    25: { reducida_5: 5632, reducida_4: 434, reducida_3: 78 },
    26: { reducida_5: 7318, reducida_4: 520, reducida_3: 80 },
    27: { reducida_5: 9350, reducida_4: 623, reducida_3: 86 },
    28: { reducida_5: null, reducida_4: 734, reducida_3: 91 },
    29: { reducida_5: null, reducida_4: 853, reducida_3: 94 },
    30: { reducida_5: null, reducida_4: 1005, reducida_3: 115 },
    31: { reducida_5: null, reducida_4: 1163, reducida_3: 125 },
    32: { reducida_5: null, reducida_4: 1331, reducida_3: 131 },
    33: { reducida_5: null, reducida_4: 1528, reducida_3: 139 },
    34: { reducida_5: null, reducida_4: 1737, reducida_3: 152 },
    35: { reducida_5: null, reducida_4: 1973, reducida_3: 164 },
    36: { reducida_5: null, reducida_4: 2240, reducida_3: 184 },
    37: { reducida_5: null, reducida_4: 2539, reducida_3: 199 },
    38: { reducida_5: null, reducida_4: 2836, reducida_3: 221 },
    39: { reducida_5: null, reducida_4: 3165, reducida_3: 244 },
    40: { reducida_5: null, reducida_4: 3533, reducida_3: 275 },
    41: { reducida_5: null, reducida_4: 3964, reducida_3: 285 },
    42: { reducida_5: null, reducida_4: 4385, reducida_3: 307 },
    43: { reducida_5: null, reducida_4: 4858, reducida_3: 330 },
    44: { reducida_5: null, reducida_4: 5368, reducida_3: 355 },
    45: { reducida_5: null, reducida_4: 5933, reducida_3: 380 },
    46: { reducida_5: null, reducida_4: 6509, reducida_3: 411 },
    47: { reducida_5: null, reducida_4: null, reducida_3: 440 },
    48: { reducida_5: null, reducida_4: 7835, reducida_3: 477 },
    49: { reducida_5: null, reducida_4: 8563, reducida_3: 496 },
  },
};

export const EUROMILLONES_REDUCED_TABLE: ReducedSystemTable = {
  unitPrice: 2.5,
  rows: {
    10: { reducida_4: 14, reducida_3: 2, reducida_2: null, reducida_1: null },
    11: { reducida_4: 37, reducida_3: 5, reducida_2: 3, reducida_1: null },
    12: { reducida_4: 56, reducida_3: 9, reducida_2: 3, reducida_1: null },
    13: { reducida_4: 111, reducida_3: 13, reducida_2: 3, reducida_1: null },
    14: { reducida_4: 156, reducida_3: 18, reducida_2: 3, reducida_1: null },
    15: { reducida_4: 246, reducida_3: 22, reducida_2: 3, reducida_1: null },
    16: { reducida_4: 325, reducida_3: 26, reducida_2: 4, reducida_1: null },
    17: { reducida_4: 412, reducida_3: 34, reducida_2: 4, reducida_1: null },
    18: { reducida_4: 537, reducida_3: 42, reducida_2: 4, reducida_1: null },
    19: { reducida_4: 662, reducida_3: 52, reducida_2: 4, reducida_1: null },
    20: { reducida_4: 836, reducida_3: 61, reducida_2: 4, reducida_1: null },
    21: { reducida_4: 1027, reducida_3: 76, reducida_2: 9, reducida_1: 5 },
    22: { reducida_4: 1203, reducida_3: 93, reducida_2: 11, reducida_1: 5 },
    23: { reducida_4: 1470, reducida_3: 115, reducida_2: 17, reducida_1: 5 },
    24: { reducida_4: 1739, reducida_3: 132, reducida_2: 21, reducida_1: 5 },
    25: { reducida_4: 2039, reducida_3: 149, reducida_2: 25, reducida_1: 5 },
    26: { reducida_4: 2491, reducida_3: null, reducida_2: 25, reducida_1: 6 },
    27: { reducida_4: 2855, reducida_3: 198, reducida_2: 29, reducida_1: 6 },
    28: { reducida_4: 3328, reducida_3: 223, reducida_2: 31, reducida_1: 6 },
    29: { reducida_4: 3820, reducida_3: 245, reducida_2: 34, reducida_1: 6 },
    30: { reducida_4: 4375, reducida_3: 273, reducida_2: 35, reducida_1: 6 },
  },
};

export const REDUCED_TABLES: Record<string, ReducedSystemTable> = {
  primitiva: PRIMITIVA_REDUCED_TABLE,
  bonoloto: BONOLOTO_REDUCED_TABLE,
  euromillones: EUROMILLONES_REDUCED_TABLE,
};

export function getReducedBetsCount(
  gameId: string,
  systemId: ReducedSystemId,
  numbersCount: number
): number | null {
  const table = REDUCED_TABLES[gameId];
  if (!table) return null;
  return table.rows[numbersCount]?.[systemId] ?? null;
}

export function getSupportedNumbersForReducedSystem(gameId: string, systemId: ReducedSystemId): number[] {
  const table = REDUCED_TABLES[gameId];
  if (!table) return [];

  return Object.entries(table.rows)
    .filter(([, systems]) => systems[systemId] != null)
    .map(([numbersCount]) => Number(numbersCount))
    .sort((a, b) => a - b);
}
