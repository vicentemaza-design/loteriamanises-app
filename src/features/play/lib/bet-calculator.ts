/**
 * Lógica matemática para el cálculo de apuestas y precios (Lotería Manises).
 * Implementa combinatoria oficial para múltiples y tablas SELAE para reducidas.
 */

/**
 * Calcula combinaciones C(n, k)
 */
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return Math.round(res);
}

/**
 * Cálculo de apuestas múltiples para Loterías (Primitiva, Bonoloto, Euromillones)
 */
export function calculateMultipleBets(numsCount: number, starsCount: number = 0, gameType: string): number {
  switch (gameType) {
    case 'euromillones':
      // C(n, 5) * C(m, 2)
      return combinations(numsCount, 5) * combinations(starsCount, 2);
    
    case 'primitiva':
    case 'bonoloto':
      // C(n, 6)
      return combinations(numsCount, 6);
      
    case 'gordo':
      // C(n, 5) * C(m, 1) -> Aunque el Gordo suele tener 1 clave fija, la matriz permite múltiples si se definiera
      return combinations(numsCount, 5) * combinations(starsCount, 1);

    case 'eurodreams':
      // C(n, 6) * C(m, 1)
      return combinations(numsCount, 6) * combinations(starsCount, 1);

    default:
      return 1;
  }
}

/**
 * Tablas oficiales de reducidas para La Quiniela (SELAE)
 */
export const QUINIELA_REDUCED_TABLES = {
  'reducida_1': { dobles: 7, triples: 0, bets: 16,  label: 'Reducida 1 (7 Dobles)' },
  'reducida_2': { dobles: 0, triples: 4, bets: 9,   label: 'Reducida 2 (4 Triples)' },
  'reducida_3': { dobles: 11, triples: 0, bets: 132, label: 'Reducida 3 (11 Dobles)' },
} as const;

export type QuinielaReducedType = keyof typeof QUINIELA_REDUCED_TABLES;

/**
 * Calcula el importe total de una jugada
 */
export function calculateTotalPrice(unitPrice: number, betsCount: number, hasInsurance: boolean = false): number {
  const INSURANCE_PRICE = 0.50;
  return (unitPrice * betsCount) + (hasInsurance ? INSURANCE_PRICE : 0);
}
