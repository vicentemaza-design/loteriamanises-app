import type { LotteryGame } from '@/shared/types/domain';
import { formatCurrency } from '@/shared/lib/utils';
import type { QuinielaReducedType } from './bet-calculator';
import { getReductionSystem } from './play-matrix';

type PlayMode = 'simple' | 'multiple' | 'reduced';

export interface GameHelpSection {
  title: string;
  bullets: string[];
}

export interface GameHelpContent {
  modeLabel: string;
  summary: string;
  quickFacts: Array<{ label: string; value: string }>;
  sections: GameHelpSection[];
  tip: string;
  warning?: string;
}

interface GetGameHelpContentInput {
  game: LotteryGame;
  mode: PlayMode;
  betsCount: number;
  totalPrice: number;
  reducedSystemId?: string;
}

function formatSelection(game: LotteryGame): string {
  const range = game.selectionRange;
  if (!range) return 'Consulta el detalle de este juego.';

  const base = `${range.numbers.min} ${range.numbers.min === 1 ? 'selección' : 'números'}`;
  if (!range.stars) return base;

  if (game.type === 'gordo') {
    return `${base} + 1 clave del 0 al 9`;
  }

  return `${base} + ${range.stars.min} ${range.stars.min === 1 ? 'estrella' : 'estrellas'}`;
}

function getMultipleSummary(game: LotteryGame, betsCount: number, totalPrice: number): GameHelpContent {
  const range = game.selectionRange;
  const starRange = range?.stars;
  const starLabel = game.type === 'gordo'
    ? 'La clave se mantiene y el sistema desarrolla todas las combinaciones posibles del bloque principal.'
    : starRange
      ? `Puedes ampliar también ${starRange.min === starRange.max ? 'las estrellas' : 'números y estrellas'} dentro del rango permitido.`
      : 'Amplías tu bloque de números y el sistema desarrolla todas las columnas posibles.';

  return {
    modeLabel: 'Múltiple',
    summary: `Estás jugando cobertura total: el sistema genera todas las columnas posibles a partir de tu selección ampliada.`,
    quickFacts: [
      { label: 'Cobertura', value: 'Total' },
      { label: 'Columnas', value: `${betsCount}` },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          `Partes de la base del juego y amplías la selección por encima del modo simple.`,
          starLabel,
          `Cada columna desarrollada se considera una apuesta real a precio unitario oficial.`,
        ],
      },
      {
        title: 'Precio y columnas',
        bullets: [
          `El total se calcula multiplicando el precio unitario por ${betsCount} columnas generadas.`,
          `Cuantos más números selecciones, más rápido crecerán el número de apuestas y el precio final.`,
        ],
      },
      {
        title: 'Qué te aporta',
        bullets: [
          `No hay reducción ni ahorro artificial: juegas todo el desarrollo completo.`,
          `Es el modo más fuerte si buscas cobertura total dentro de tu presupuesto.`,
        ],
      },
    ],
    tip: `Úsalo cuando quieras ampliar cobertura sin renunciar a ninguna combinación del desarrollo.`,
  };
}

function getSimpleSummary(game: LotteryGame, totalPrice: number): GameHelpContent {
  const range = game.selectionRange;
  const hasStars = Boolean(range?.stars);
  const extrasLabel = game.type === 'gordo'
    ? '1 clave'
    : hasStars
      ? `${range?.stars?.min} estrellas`
      : 'sin extras';

  return {
    modeLabel: 'Simple',
    summary: `Es la jugada base del ${game.name.toLowerCase()}: una sola apuesta con la selección mínima oficial.`,
    quickFacts: [
      { label: 'Selección', value: formatSelection(game) },
      { label: 'Columnas', value: '1' },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          `Seleccionas ${range?.numbers.min ?? 0} números y ${extrasLabel}.`,
          `El sistema registra una única columna sin desarrollo adicional.`,
          `Es la opción más rápida y directa para jugar sin ampliar cobertura.`,
        ],
      },
      {
        title: 'Precio y alcance',
        bullets: [
          `Pagas exactamente el precio unitario oficial del juego.`,
          `No incluye combinaciones extra ni garantías más allá de la propia apuesta base.`,
        ],
      },
    ],
    tip: `Ideal para jugar rápido, controlar el gasto y repetir sorteos sin complicarte.`,
  };
}

function getQuinielaSimpleSummary(totalPrice: number): GameHelpContent {
  return {
    modeLabel: 'Simple',
    summary: 'Marcas un único signo por partido y el sistema genera una sola columna completa para la jornada.',
    quickFacts: [
      { label: 'Pronóstico', value: '14 partidos' },
      { label: 'Columnas', value: '1' },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          'Eliges 1, X o 2 en cada partido.',
          'No hay desarrollo de dobles o triples: toda la jornada queda resuelta en una sola combinación.',
          'Es la forma más simple de entrar en La Quiniela desde la app.',
        ],
      },
      {
        title: 'Qué debes tener en cuenta',
        bullets: [
          'Cada fallo en un partido afecta directamente a la columna completa.',
          'Si quieres ampliar cobertura, tendrás que pasar a una reducida oficial.',
        ],
      },
    ],
    tip: 'Buena opción si ya tienes un pronóstico claro y quieres mantener el coste al mínimo.',
  };
}

function getQuinielaReducedSummary(
  game: LotteryGame,
  reducedType: QuinielaReducedType | undefined,
  betsCount: number,
  totalPrice: number
): GameHelpContent {
  const system = getReductionSystem(game.id, reducedType ?? 'reducida_1');
  const pattern = system?.requiredPattern
    ? `${system.requiredPattern.dobles} dobles y ${system.requiredPattern.triples} triples`
    : 'un patrón oficial';
  const label = system?.label ?? 'Reducida oficial';

  return {
    modeLabel: 'Reducida oficial',
    summary: `Estás usando ${label}. La app te guía para introducir exactamente ${pattern} del sistema oficial.`,
    quickFacts: [
      { label: 'Patrón', value: system?.requiredPattern ? `${system.requiredPattern.dobles}D · ${system.requiredPattern.triples}T` : 'Oficial' },
      { label: 'Columnas', value: `${betsCount}` },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          'Tu pronóstico general incluye dobles y triples, pero no se desarrolla completo.',
          `El sistema lo reduce a ${system?.fixedBetsCount ?? betsCount} columnas siguiendo una tabla oficial.`,
          'Así reduces coste frente al múltiple total, a cambio de una garantía condicionada.',
        ],
      },
      {
        title: 'Garantía y condición',
        bullets: [
          'Si el pronóstico general contiene los aciertos necesarios, la reducida asegura una categoría mínima según el sistema.',
          'No equivale a cobertura total: algunas columnas del desarrollo completo no se juegan.',
        ],
      },
      {
        title: 'Precio y uso',
        bullets: [
          `El total actual sale de ${system?.fixedBetsCount ?? betsCount} columnas a 0,75 € cada una.`,
          'La app valida automáticamente que el patrón de dobles y triples sea correcto antes de dejarte jugar.',
        ],
      },
    ],
    tip: 'La reducida oficial es la forma más sensata de subir cobertura en Quiniela sin disparar el número de columnas.',
    warning: 'La garantía depende de que tu pronóstico general contenga el acierto real de la jornada.',
  };
}

function getGenericReducedSummary(
  game: LotteryGame,
  reducedSystemId: string | undefined,
  betsCount: number,
  totalPrice: number
): GameHelpContent {
  const system = getReductionSystem(game.id, reducedSystemId);
  const supportedNumbers = system?.supportedNumbers ?? [];
  const supportedLabel = supportedNumbers.length > 0
    ? `${supportedNumbers[0]}–${supportedNumbers[supportedNumbers.length - 1]} números`
    : 'selección compatible';

  return {
    modeLabel: 'Reducida',
    summary: `Estás usando ${system?.label ?? 'un sistema reducido'} de ${game.name}. El sistema recorta columnas frente al múltiple completo para bajar coste con una garantía condicionada.`,
    quickFacts: [
      { label: 'Garantía', value: system?.guaranteeLabel ?? 'Condicional' },
      { label: 'Columnas', value: betsCount > 0 ? `${betsCount}` : 'Según tabla' },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          `Seleccionas un bloque general de números y eliges una reducción concreta.`,
          `La tabla del sistema transforma esa selección en menos columnas que el múltiple directo.`,
          `En ${game.name}, el sistema activo trabaja con ${supportedLabel}.`,
        ],
      },
      {
        title: 'Garantía y condición',
        bullets: [
          system?.guaranteeCondition ?? 'La garantía depende de que la combinación premiada quede contenida dentro de la selección general.',
          'No equivale a cobertura total: ahorras columnas a cambio de una protección mínima concreta.',
        ],
      },
      {
        title: 'Precio y uso',
        bullets: [
          betsCount > 0
            ? `Con tu selección actual se generan ${betsCount} columnas reducidas.`
            : 'La app calculará las columnas cuando la selección encaje en una fila válida de la tabla.',
          'Es el modo adecuado si buscas más cobertura que una simple, pero sin llegar al coste del múltiple completo.',
        ],
      },
    ],
    tip: 'Primero elige la reducida y luego ajusta el número total de bolas hasta entrar en una fila válida de la tabla.',
    warning: 'Si la selección no coincide con una fila soportada por la tabla, la app no dejará confirmar la jugada.',
  };
}

export function getGameHelpContent({
  game,
  mode,
  betsCount,
  totalPrice,
  reducedSystemId,
}: GetGameHelpContentInput): GameHelpContent {
  if (game.type === 'quiniela') {
    return mode === 'reduced'
      ? getQuinielaReducedSummary(game, reducedSystemId as QuinielaReducedType | undefined, betsCount, totalPrice)
      : getQuinielaSimpleSummary(totalPrice);
  }

  if (mode === 'reduced') {
    return getGenericReducedSummary(game, reducedSystemId, betsCount, totalPrice);
  }

  if (mode === 'multiple') {
    return getMultipleSummary(game, betsCount, totalPrice);
  }

  return getSimpleSummary(game, totalPrice);
}
