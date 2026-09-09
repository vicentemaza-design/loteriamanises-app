// ============================================================
// REDUCIDAS — TABLAS DE GARANTÍAS
// ============================================================
// Complementa a reduced-tables.ts: allí está CUÁNTAS apuestas
// genera cada reducción; aquí, QUÉ premios garantiza.
//
// Una tabla depende de las tres cosas a la vez:
//   juego  ·  sistema reducido  ·  cuántos números se juegan
// La misma "Reducida al 4" garantiza cosas distintas con 12
// números que con 20, así que no se puede indexar solo por el
// id del sistema.
//
// ⚠️ ESTADO DE LOS DATOS — LEER ANTES DE AMPLIAR
// Solo hay cargadas las DOS combinaciones que el cliente
// documentó (ver GUARANTEE_SOURCE). Las 164 restantes (93 de
// 6/49 + 71 de Euromillones, contadas sobre reduced-tables.ts)
// están pendientes de que nos pasen el origen oficial. Mientras
// una combinación no esté aquí, la UI NO inventa números: enseña
// la condición de garantía en texto y avisa de que el detalle
// todavía no está disponible. No rellenar "a ojo": son cifras de
// premios en una app de juego con dinero real.
//
// Para integración con BE: sustituir GUARANTEES por una llamada
// a tu API → fetch(`/api/reducidas/garantias?game=${gameId}
// &system=${systemId}&numbers=${numbersCount}`), respetando la
// forma de ReducedGuaranteeTable.
// ============================================================

/** Un mínimo/máximo garantizado para una categoría y un porcentaje. */
export interface GuaranteeCell {
  min: number;
  max: number;
}

export interface ReducedGuaranteeRow {
  /** Categoría de premio tal y como la nombra el juego. */
  category: string;
  /** Etiqueta secundaria del juego ("Premio 1"), si la tiene. */
  prizeLabel?: string;
  /** Mismo orden y longitud que `percentages`; null = sin garantía ("—"). */
  cells: Array<GuaranteeCell | null>;
}

export interface ReducedGuaranteeTable {
  /** Columnas de porcentaje de garantía, ya formateadas para mostrar. */
  percentages: string[];
  rows: ReducedGuaranteeRow[];
  /** Mensaje destacado sobre la tabla. */
  highlight: string;
  /** Notas aclaratorias bajo la tabla. */
  notes: string[];
}

/** De dónde salen los datos cargados, para poder contrastarlos. */
export const GUARANTEE_SOURCE =
  'Mejoras_septiembre_1.pptx (cliente, septiembre 2025) — láminas 1 y 2.';

// Primitiva y Bonoloto son el mismo 6/49 y comparten tabla de
// apuestas en reduced-tables.ts (solo cambia el precio por
// apuesta: 1 € frente a 0,50 €), así que comparten también las
// garantías. Si alguna vez dejaran de coincidir, separar aquí.
const LOTO_6_49_GUARANTEES: Record<string, Record<number, ReducedGuaranteeTable>> = {
  reducida_4: {
    12: {
      percentages: ['1,08 %', '40,04 %', '100 %'],
      rows: [
        { category: '6 aciertos', prizeLabel: 'Premio 1', cells: [{ min: 1, max: 1 }, null, null] },
        { category: '5 aciertos', prizeLabel: 'Premio 2', cells: [null, { min: 1, max: 1 }, null] },
        { category: '4 aciertos', prizeLabel: 'Premio 3', cells: [null, { min: 0, max: 4 }, { min: 1, max: 5 }] },
        { category: '3 aciertos', prizeLabel: 'Premio 4', cells: [{ min: 5, max: 8 }, { min: 0, max: 7 }, { min: 0, max: 8 }] },
      ],
      highlight:
        'Si los 6 aciertos están dentro de la selección general, se garantizan los premios indicados en la siguiente tabla.',
      notes: [
        'La probabilidad de 5+1-0 (6 aciertos) es del 1,08 % (acertando el complementario).',
        'Las apuestas se reducen asegurando los premios mínimos indicados y manteniendo tantas opciones a premio de 6 como apuestas juegue la reducción elegida.',
        'Los premios mínimos se garantizan siempre que entre los números seleccionados se acierten los 6 ganadores.',
      ],
    },
  },
};

const EUROMILLONES_GUARANTEES: Record<string, Record<number, ReducedGuaranteeTable>> = {
  reducida_2: {
    15: {
      percentages: ['0,1 %', '5,09 %', '50,05 %', '100 %'],
      rows: [
        { category: '5 aciertos', cells: [{ min: 1, max: 1 }, null, null, null] },
        { category: '4 aciertos', cells: [null, { min: 1, max: 1 }, null, null] },
        { category: '3 aciertos', cells: [null, null, { min: 1, max: 1 }, null] },
        { category: '2 aciertos', cells: [null, null, { min: 0, max: 1 }, { min: 2, max: 2 }] },
        { category: '1 acierto',  cells: [null, { min: 1, max: 1 }, { min: 0, max: 2 }, { min: 1, max: 1 }] },
      ],
      highlight:
        'Premios mínimos y máximos garantizados por categoría, siempre que entre los números jugados se acierten los 5 números ganadores.',
      notes: [
        'Las apuestas se reducen asegurando premios mínimos y manteniendo tantas opciones al premio de 5 como apuestas juegue la reducción elegida.',
        'La probabilidad de conseguir premio de 5 siempre coincide con el número de apuestas que juega la reducción.',
        'Los premios mínimos se aseguran cuando entre los números jugados se aciertan los 5 ganadores. Por eso, a más números jugados, más posibilidades de conseguir premios.',
      ],
    },
  },
};

const GUARANTEES: Record<string, Record<string, Record<number, ReducedGuaranteeTable>>> = {
  primitiva: LOTO_6_49_GUARANTEES,
  bonoloto: LOTO_6_49_GUARANTEES,
  euromillones: EUROMILLONES_GUARANTEES,
};

/**
 * Devuelve la tabla de garantías de una combinación concreta, o
 * `null` si todavía no está cargada. `null` NO es un error: es el
 * estado normal de las 164 combinaciones pendientes, y la UI debe
 * tratarlo mostrando la condición en texto, nunca cifras propias.
 */
export function getReducedGuaranteeTable(
  gameId: string,
  systemId: string,
  numbersCount: number
): ReducedGuaranteeTable | null {
  return GUARANTEES[gameId]?.[systemId]?.[numbersCount] ?? null;
}

/** Combinaciones con tabla cargada, para diagnóstico y para la matriz técnica. */
export function getLoadedGuaranteeCombinations(): Array<{
  gameId: string;
  systemId: string;
  numbersCount: number;
}> {
  return Object.entries(GUARANTEES).flatMap(([gameId, systems]) =>
    Object.entries(systems).flatMap(([systemId, sizes]) =>
      Object.keys(sizes).map((numbersCount) => ({
        gameId,
        systemId,
        numbersCount: Number(numbersCount),
      }))
    )
  );
}
