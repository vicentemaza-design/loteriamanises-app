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
// QUÉ SON LOS PORCENTAJES DE LAS COLUMNAS
// Cada porcentaje es la fracción de combinaciones ganadoras
// posibles —C(números jugados, aciertos del juego)— para las que
// se cumple la garantía de esa columna. Contrastado con las tres
// tablas publicadas que tenemos:
//
//   10 núm. al 5 (6/49):  C(10,6) =  210 →   18/210  =  8,57 %
//   12 núm. al 4 (6/49):  C(12,6) =  924 →   10/924  =  1,08 %
//                                            370/924  = 40,04 %
//   15 núm. al 2 (Euro):  C(15,5) = 3003 →    3/3003 =  0,10 %
//                                            153/3003 =  5,09 %
//                                           1503/3003 = 50,05 %
//
// La PRIMERA columna es siempre apuestas/C(n,m): la probabilidad
// de llevarte el premio máximo coincide con cuántas apuestas juega
// la reducción (lo dice la propia web del cliente). Esa se puede
// calcular con lo que ya tenemos en reduced-tables.ts.
//
// Las demás dependen de QUÉ columnas concretas juega la reducción,
// no solo de cuántas. Es decir: con el desarrollo real de la
// reducción, la tabla entera es calculable; sin él, no. Por eso el
// motor de reducciones y estas tablas son el mismo problema.
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
  /** De dónde salen estas cifras, para poder contrastarlas. */
  source: string;
}

// Primitiva y Bonoloto son el mismo 6/49 y comparten tabla de
// apuestas en reduced-tables.ts (solo cambia el precio por
// apuesta: 1 € frente a 0,50 €), así que comparten también las
// garantías. Si alguna vez dejaran de coincidir, separar aquí.
const LOTO_6_49_GUARANTEES: Record<string, Record<number, ReducedGuaranteeTable>> = {
  reducida_5: {
    10: {
      percentages: ['8,57 %', '100 %'],
      rows: [
        { category: '6 aciertos', prizeLabel: 'Premio 1', cells: [{ min: 1, max: 1 }, null] },
        { category: '5 aciertos', prizeLabel: 'Premio 2', cells: [null, { min: 1, max: 4 }] },
        { category: '4 aciertos', prizeLabel: 'Premio 3', cells: [{ min: 6, max: 14 }, { min: 5, max: 9 }] },
        { category: '3 aciertos', prizeLabel: 'Premio 4', cells: [{ min: 0, max: 8 }, { min: 6, max: 8 }] },
      ],
      highlight:
        'Si los 6 aciertos están dentro de la selección general, se garantizan los premios indicados en la siguiente tabla.',
      notes: [
        'La probabilidad de acertar 6 es del 8,57 % (18 apuestas sobre las 210 del sistema directo) y la de acertar 5 es del 100 %.',
        'Las apuestas se reducen asegurando los premios mínimos indicados y manteniendo tantas opciones a premio de 6 como apuestas juegue la reducción elegida.',
        'Los premios mínimos se garantizan siempre que entre los números seleccionados se acierten los 6 ganadores.',
      ],
      // En el original la fila del 100 % no trae la pareja de "De 6":
      // se interpreta como sin garantía, que es lo coherente con que
      // el 6 solo se asegure en el 8,57 %.
      source:
        'loteriamanises.com/blog/combinaciones-bonoloto-reducidas/ (captura de 2022-07-02 en web.archive.org).',
    },
  },
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
      source: 'Mejoras_septiembre_1.pptx (cliente, sept. 2025), lámina 1.',
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
      source: 'Mejoras_septiembre_1.pptx (cliente, sept. 2025), lámina 2.',
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
