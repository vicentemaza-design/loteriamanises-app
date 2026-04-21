import type { LotteryGame } from '@/shared/types/domain';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { calculateMultipleBets, QUINIELA_REDUCED_TABLES, type QuinielaReducedType } from './bet-calculator';
import { getReducedBetsCount, getSupportedNumbersForReducedSystem } from './reduced-tables';

export type PlayMode = 'simple' | 'multiple' | 'reduced';
export type MatrixStatus = 'implemented' | 'planned';
export type GuaranteeKind = 'none' | 'direct_full_coverage' | 'conditional_minimum';

export interface PlaySelectionShape {
  numbers: { min: number; max: number; total: number };
  stars?: { min: number; max: number; total: number; label?: string };
}

export interface ReductionSystemDefinition {
  id: string;
  label: string;
  status: MatrixStatus;
  guaranteeLabel: string;
  guaranteeCondition: string;
  supportedNumbers?: number[];
  requiredPattern?: { dobles: number; triples: number };
  fixedBetsCount?: number;
}

export interface GameModeDefinition {
  mode: PlayMode;
  label: string;
  status: MatrixStatus;
  systemFamily: 'direct' | 'official' | 'manises';
  guaranteeType: GuaranteeKind;
  guaranteeCondition?: string;
  productLimit?: string;
  selection: PlaySelectionShape | null;
  reductionSystems?: ReductionSystemDefinition[];
}

export interface GamePlayDefinition {
  gameId: LotteryGame['id'];
  modes: GameModeDefinition[];
}

export interface PlayQuoteInput {
  game: LotteryGame;
  mode: PlayMode;
  numbersCount: number;
  starsCount: number;
  reducedSystemId?: string;
}

export interface PlayQuote {
  betsCount: number;
  guaranteeType: GuaranteeKind;
  guaranteeCondition?: string;
  modeDefinition: GameModeDefinition;
  reductionSystem?: ReductionSystemDefinition;
}

function buildNumberSelection(numbers: PlaySelectionShape['numbers'], stars?: PlaySelectionShape['stars']): PlaySelectionShape {
  return { numbers, stars };
}

export const PLAY_MATRIX: Record<string, GamePlayDefinition> = {
  euromillones: {
    gameId: 'euromillones',
    modes: [
      {
        mode: 'simple',
        label: 'Simple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'none',
        selection: buildNumberSelection(
          { min: 5, max: 5, total: 50 },
          { min: 2, max: 2, total: 12, label: 'estrellas' }
        ),
      },
      {
        mode: 'multiple',
        label: 'Múltiple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'direct_full_coverage',
        guaranteeCondition: 'El sistema desarrolla todas las combinaciones posibles de números y estrellas dentro de la selección elegida.',
        productLimit: '2520 ap.',
        selection: buildNumberSelection(
          { min: 5, max: 10, total: 50 },
          { min: 2, max: 5, total: 12, label: 'estrellas' }
        ),
      },
      {
        mode: 'reduced',
        label: 'Reducida',
        status: 'planned',
        systemFamily: 'manises',
        guaranteeType: 'conditional_minimum',
        guaranteeCondition: 'La garantía dependerá de la tabla oficial validada para cada sistema reducido.',
        selection: buildNumberSelection(
          { min: 5, max: 10, total: 50 },
          { min: 2, max: 5, total: 12, label: 'estrellas' }
        ),
        reductionSystems: [
          { id: 'reducida_4', label: 'Reducida al 4', status: 'planned', guaranteeLabel: 'Mínimo 4', guaranteeCondition: 'Si la combinación premiada queda contenida dentro de la selección general.' },
          { id: 'reducida_3', label: 'Reducida al 3', status: 'planned', guaranteeLabel: 'Mínimo 3', guaranteeCondition: 'Si la combinación premiada queda contenida dentro de la selección general.' },
          { id: 'reducida_2', label: 'Reducida al 2', status: 'planned', guaranteeLabel: 'Mínimo 2', guaranteeCondition: 'Si la combinación premiada queda contenida dentro de la selección general.' },
          { id: 'reducida_1', label: 'Reducida al 1', status: 'planned', guaranteeLabel: 'Mínimo 1', guaranteeCondition: 'Si la combinación premiada queda contenida dentro de la selección general.' },
        ],
      },
    ],
  },
  primitiva: {
    gameId: 'primitiva',
    modes: [
      {
        mode: 'simple',
        label: 'Simple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'none',
        selection: buildNumberSelection({ min: 6, max: 6, total: 49 }),
      },
      {
        mode: 'multiple',
        label: 'Múltiple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'direct_full_coverage',
        guaranteeCondition: 'El sistema desarrolla todas las columnas posibles a partir del bloque de números seleccionado.',
        productLimit: '462 ap.',
        selection: buildNumberSelection({ min: 6, max: 11, total: 49 }),
      },
      {
        mode: 'reduced',
        label: 'Reducida',
        status: 'implemented',
        systemFamily: 'manises',
        guaranteeType: 'conditional_minimum',
        guaranteeCondition: 'La garantía dependerá de la tabla reducida elegida y de que el resultado esté contenido en la selección general.',
        selection: buildNumberSelection({ min: 10, max: 49, total: 49 }),
        reductionSystems: [
          {
            id: 'reducida_5',
            label: 'Reducida al 5',
            status: 'implemented',
            guaranteeLabel: 'Mínimo 5',
            guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.',
            supportedNumbers: getSupportedNumbersForReducedSystem('primitiva', 'reducida_5'),
          },
          {
            id: 'reducida_4',
            label: 'Reducida al 4',
            status: 'implemented',
            guaranteeLabel: 'Mínimo 4',
            guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.',
            supportedNumbers: getSupportedNumbersForReducedSystem('primitiva', 'reducida_4'),
          },
          {
            id: 'reducida_3',
            label: 'Reducida al 3',
            status: 'implemented',
            guaranteeLabel: 'Mínimo 3',
            guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.',
            supportedNumbers: getSupportedNumbersForReducedSystem('primitiva', 'reducida_3'),
          },
        ],
      },
    ],
  },
  bonoloto: {
    gameId: 'bonoloto',
    modes: [
      {
        mode: 'simple',
        label: 'Simple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'none',
        selection: buildNumberSelection({ min: 6, max: 6, total: 49 }),
      },
      {
        mode: 'multiple',
        label: 'Múltiple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'direct_full_coverage',
        guaranteeCondition: 'El sistema desarrolla todas las columnas posibles a partir del bloque de números seleccionado.',
        productLimit: '462 ap.',
        selection: buildNumberSelection({ min: 6, max: 11, total: 49 }),
      },
      {
        mode: 'reduced',
        label: 'Reducida',
        status: 'planned',
        systemFamily: 'manises',
        guaranteeType: 'conditional_minimum',
        guaranteeCondition: 'La garantía dependerá de la tabla reducida elegida y de que el resultado esté contenido en la selección general.',
        selection: buildNumberSelection({ min: 10, max: 49, total: 49 }),
        reductionSystems: [
          { id: 'reducida_5', label: 'Reducida al 5', status: 'planned', guaranteeLabel: 'Mínimo 5', guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.' },
          { id: 'reducida_4', label: 'Reducida al 4', status: 'planned', guaranteeLabel: 'Mínimo 4', guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.' },
          { id: 'reducida_3', label: 'Reducida al 3', status: 'planned', guaranteeLabel: 'Mínimo 3', guaranteeCondition: 'Si los 6 aciertos están dentro de la selección general.' },
        ],
      },
    ],
  },
  gordo: {
    gameId: 'gordo',
    modes: [
      {
        mode: 'simple',
        label: 'Simple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'none',
        selection: buildNumberSelection(
          { min: 5, max: 5, total: 54 },
          { min: 1, max: 1, total: 10, label: 'clave' }
        ),
      },
      {
        mode: 'multiple',
        label: 'Múltiple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'direct_full_coverage',
        guaranteeCondition: 'El sistema desarrolla todas las combinaciones posibles del bloque principal manteniendo la clave seleccionada.',
        productLimit: '462 ap.',
        selection: buildNumberSelection(
          { min: 5, max: 11, total: 54 },
          { min: 1, max: 1, total: 10, label: 'clave' }
        ),
      },
      {
        mode: 'reduced',
        label: 'Reducida',
        status: 'planned',
        systemFamily: 'manises',
        guaranteeType: 'conditional_minimum',
        guaranteeCondition: 'La garantía dependerá de la tabla reducida validada para El Gordo.',
        selection: buildNumberSelection(
          { min: 5, max: 11, total: 54 },
          { min: 1, max: 1, total: 10, label: 'clave' }
        ),
        reductionSystems: [
          { id: 'reducida_general', label: 'Reducida', status: 'planned', guaranteeLabel: 'Pendiente de tabla', guaranteeCondition: 'La condición exacta se activará cuando se validen las tablas de El Gordo.' },
        ],
      },
    ],
  },
  quiniela: {
    gameId: 'quiniela',
    modes: [
      {
        mode: 'simple',
        label: 'Simple',
        status: 'implemented',
        systemFamily: 'direct',
        guaranteeType: 'none',
        selection: null,
      },
      {
        mode: 'reduced',
        label: 'Reducida oficial',
        status: 'implemented',
        systemFamily: 'official',
        guaranteeType: 'conditional_minimum',
        guaranteeCondition: 'La garantía depende de que el pronóstico general contenga los aciertos necesarios de la jornada.',
        productLimit: '132 ap.',
        selection: null,
        reductionSystems: (Object.entries(QUINIELA_REDUCED_TABLES) as Array<[QuinielaReducedType, typeof QUINIELA_REDUCED_TABLES[QuinielaReducedType]]>).map(
          ([id, config]) => ({
            id,
            label: config.label,
            status: 'implemented',
            guaranteeLabel: 'Condicional',
            guaranteeCondition: 'Si el pronóstico general contiene los aciertos necesarios, el sistema garantiza una categoría mínima.',
            requiredPattern: { dobles: config.dobles, triples: config.triples },
            fixedBetsCount: config.bets,
          })
        ),
      },
    ],
  },
};

export function getGamePlayDefinition(gameId: string): GamePlayDefinition | null {
  return PLAY_MATRIX[gameId] ?? null;
}

export function getAvailableModesForGame(gameId: string): PlayMode[] {
  const definition = getGamePlayDefinition(gameId);
  if (!definition) return ['simple'];
  return definition.modes.filter((mode) => mode.status === 'implemented').map((mode) => mode.mode);
}

export function getModeDefinition(gameId: string, mode: PlayMode): GameModeDefinition | null {
  const definition = getGamePlayDefinition(gameId);
  return definition?.modes.find((entry) => entry.mode === mode) ?? null;
}

export function getReductionSystem(gameId: string, reductionSystemId?: string): ReductionSystemDefinition | null {
  if (!reductionSystemId) return null;
  const definition = getGamePlayDefinition(gameId);
  return definition?.modes.flatMap((mode) => mode.reductionSystems ?? []).find((system) => system.id === reductionSystemId) ?? null;
}

export function getReductionSystemsForMode(gameId: string, mode: PlayMode): ReductionSystemDefinition[] {
  const modeDefinition = getModeDefinition(gameId, mode);
  return modeDefinition?.reductionSystems ?? [];
}

export function quotePlay({ game, mode, numbersCount, starsCount, reducedSystemId }: PlayQuoteInput): PlayQuote {
  const modeDefinition = getModeDefinition(game.id, mode) ?? {
    mode,
    label: mode,
    status: 'implemented',
    systemFamily: 'direct',
    guaranteeType: 'none',
    selection: null,
  };

  const reductionSystem = getReductionSystem(game.id, reducedSystemId);

  let betsCount = 1;
  if (mode === 'multiple') {
    betsCount = calculateMultipleBets(numbersCount, starsCount, game.type);
  } else if (mode === 'reduced' && reducedSystemId) {
    const reducedBetsCount = getReducedBetsCount(game.id, reducedSystemId, numbersCount);
    if (reducedBetsCount != null) {
      betsCount = reducedBetsCount;
    } else if (reductionSystem?.fixedBetsCount) {
      betsCount = reductionSystem.fixedBetsCount;
    } else {
      betsCount = 0;
    }
  } else if (mode === 'reduced' && reductionSystem?.fixedBetsCount) {
    betsCount = reductionSystem.fixedBetsCount;
  }

  return {
    betsCount,
    guaranteeType: modeDefinition.guaranteeType,
    guaranteeCondition: reductionSystem?.guaranteeCondition ?? modeDefinition.guaranteeCondition,
    modeDefinition,
    reductionSystem: reductionSystem ?? undefined,
  };
}

export function getPhase1MatrixGames(): Array<LotteryGame & { playDefinition: GamePlayDefinition | null }> {
  return LOTTERY_GAMES
    .filter((game) => game.productionPhase1)
    .map((game) => ({
      ...game,
      playDefinition: getGamePlayDefinition(game.id),
    }));
}
