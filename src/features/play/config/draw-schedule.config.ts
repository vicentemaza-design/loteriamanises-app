import type { GameType } from '@/shared/types/domain';

export type ScheduleMode = 'next_draw' | 'current_week' | 'two_weeks' | 'custom_weeks';

export interface DrawScheduleConfig {
  drawWeekdays: number[];
  drawHour: number;
  drawMinute: number;
  maxWeeksSelectable: number;
  supportsMultipleDrawSelection: boolean;
  supportsSubscription: boolean;
}

const DEFAULT_MAX_WEEKS_SELECTABLE = 4;

export const DRAW_SCHEDULE_CONFIG: Partial<Record<GameType, DrawScheduleConfig>> = {
  euromillones: {
    drawWeekdays: [2, 5],
    drawHour: 21,
    drawMinute: 0,
    maxWeeksSelectable: DEFAULT_MAX_WEEKS_SELECTABLE,
    supportsMultipleDrawSelection: true,
    supportsSubscription: true,
  },
  primitiva: {
    drawWeekdays: [1, 4, 6],
    drawHour: 21,
    drawMinute: 30,
    maxWeeksSelectable: DEFAULT_MAX_WEEKS_SELECTABLE,
    supportsMultipleDrawSelection: true,
    supportsSubscription: true,
  },
  'loteria-nacional': {
    drawWeekdays: [4, 6],
    drawHour: 12,
    drawMinute: 0,
    maxWeeksSelectable: DEFAULT_MAX_WEEKS_SELECTABLE,
    supportsMultipleDrawSelection: false,
    supportsSubscription: true,
  },
  quiniela: {
    drawWeekdays: [],
    drawHour: 18,
    drawMinute: 0,
    maxWeeksSelectable: 1,
    supportsMultipleDrawSelection: false,
    supportsSubscription: false,
  },
};

export function getDrawScheduleConfig(gameType: GameType): DrawScheduleConfig | null {
  return DRAW_SCHEDULE_CONFIG[gameType] ?? null;
}
