import type { LotteryGame } from '@/shared/types/domain';
import { formatCurrency } from '@/shared/lib/utils';
import { QUINIELA_REDUCED_TABLES, type QuinielaReducedType } from './bet-calculator';

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
  reducedType?: QuinielaReducedType;
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
  reducedType: QuinielaReducedType | undefined,
  betsCount: number,
  totalPrice: number
): GameHelpContent {
  const config = QUINIELA_REDUCED_TABLES[reducedType ?? 'reducida_1'];

  return {
    modeLabel: 'Reducida oficial',
    summary: `Estás usando ${config.label}. La app te guía para introducir exactamente ${config.dobles} dobles y ${config.triples} triples del sistema oficial.`,
    quickFacts: [
      { label: 'Patrón', value: `${config.dobles}D · ${config.triples}T` },
      { label: 'Columnas', value: `${betsCount}` },
      { label: 'Precio actual', value: formatCurrency(totalPrice) },
    ],
    sections: [
      {
        title: 'Cómo funciona',
        bullets: [
          'Tu pronóstico general incluye dobles y triples, pero no se desarrolla completo.',
          `El sistema lo reduce a ${config.bets} columnas siguiendo una tabla oficial.`,
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
          `El total actual sale de ${config.bets} columnas a 0,75 € cada una.`,
          'La app valida automáticamente que el patrón de dobles y triples sea correcto antes de dejarte jugar.',
        ],
      },
    ],
    tip: 'La reducida oficial es la forma más sensata de subir cobertura en Quiniela sin disparar el número de columnas.',
    warning: 'La garantía depende de que tu pronóstico general contenga el acierto real de la jornada.',
  };
}

export function getGameHelpContent({
  game,
  mode,
  betsCount,
  totalPrice,
  reducedType,
}: GetGameHelpContentInput): GameHelpContent {
  if (game.type === 'quiniela') {
    return mode === 'reduced'
      ? getQuinielaReducedSummary(reducedType, betsCount, totalPrice)
      : getQuinielaSimpleSummary(totalPrice);
  }

  if (mode === 'multiple') {
    return getMultipleSummary(game, betsCount, totalPrice);
  }

  return getSimpleSummary(game, totalPrice);
}
