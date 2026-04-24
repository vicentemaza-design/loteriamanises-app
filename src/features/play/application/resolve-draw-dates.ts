import type { ScheduleMode } from '@/features/play/config/draw-schedule.config';
import { getDrawsForCurrentWeek, getUpcomingDraws } from '@/features/play/lib/draw-schedule';
import type { GameType } from '@/shared/types/domain';
import { getBusinessDate } from '@/shared/lib/timezone';

export function getNextWeekdayIso(targetWeekday: number, hour: number, now: Date = new Date()): string {
  const currentWeekday = now.getDay();
  const delta = (targetWeekday - currentWeekday + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + delta);
  date.setHours(hour, 0, 0, 0);

  if (date <= now) {
    date.setDate(date.getDate() + 7);
  }

  return date.toISOString();
}

export interface ResolveDrawDatesOptions {
  gameType: GameType;
  gameNextDraw: string;
  isNationalLottery: boolean;
  isExplicitNationalProduct: boolean;
  supportsTimeSelection: boolean;
  scheduleMode: ScheduleMode;
  selectedDrawDates: string[];
  selectedWeeksCount: number;
  selectedNationalDrawNextDraw: string;
  availableNationalDates: string[];
  now?: Date;
}

export interface ResolvedDrawDates {
  drawDates: string[];
  scheduleMode: ScheduleMode;
  weeksCount: number;
}

export function getAvailableNationalDrawDates(
  gameId: string | undefined,
  isNationalLottery: boolean,
  isExplicitNationalProduct: boolean,
  now: Date = new Date()
): string[] {
  if (!isNationalLottery || !isExplicitNationalProduct) {
    return [];
  }

  const baseDraw = gameId === 'loteria-nacional-jueves'
    ? getNextWeekdayIso(4, 21, now)
    : getNextWeekdayIso(6, 13, now);

  const dates = [baseDraw];
  for (let index = 1; index < 5; index += 1) {
    const date = new Date(baseDraw);
    date.setDate(date.getDate() + (index * 7));
    dates.push(date.toISOString());
  }
  return dates;
}

export function inferScheduleModeFromDrawDates(
  draftDates: string[],
  gameType: GameType,
  now: Date = new Date()
): ScheduleMode {
  const currentWeekDraws = getDrawsForCurrentWeek(gameType, now);
  const currentWeekDates = currentWeekDraws.map((draw) => draw.drawDate);

  if (draftDates.length === 1) {
    return 'next_draw';
  }

  if (
    draftDates.length === currentWeekDates.length &&
    draftDates.every((drawDate) => currentWeekDates.includes(drawDate))
  ) {
    return 'full_week';
  }

  return 'specific_days';
}

function resolveWeeksCount(scheduleMode: ScheduleMode, selectedWeeksCount: number): number {
  if (scheduleMode === 'custom_weeks') {
    return selectedWeeksCount;
  }

  if (scheduleMode === 'two_weeks') {
    return 2;
  }

  return 1;
}

export function resolveDrawDates({
  gameType,
  gameNextDraw,
  isNationalLottery,
  isExplicitNationalProduct,
  supportsTimeSelection,
  scheduleMode,
  selectedDrawDates,
  selectedWeeksCount,
  selectedNationalDrawNextDraw,
  availableNationalDates,
  now = new Date(),
}: ResolveDrawDatesOptions): ResolvedDrawDates {
  const fallbackDrawDate = getBusinessDate(isNationalLottery ? selectedNationalDrawNextDraw : gameNextDraw);
  const weeksCount = resolveWeeksCount(scheduleMode, selectedWeeksCount);

  if (!supportsTimeSelection) {
    return {
      drawDates: [fallbackDrawDate],
      scheduleMode: 'next_draw',
      weeksCount: 1,
    };
  }

  if (isExplicitNationalProduct) {
    const validDates = selectedDrawDates.filter((drawDate) => availableNationalDates.includes(drawDate));
    return {
      drawDates: validDates.length > 0
        ? validDates
        : availableNationalDates.length > 0
          ? [availableNationalDates[0]]
          : [fallbackDrawDate],
      scheduleMode,
      weeksCount,
    };
  }

  if (scheduleMode === 'specific_days') {
    const nextDrawDates = getUpcomingDraws(gameType, now, 1).slice(0, 1).map((draw) => draw.drawDate);
    return {
      drawDates: selectedDrawDates.length > 0
        ? selectedDrawDates
        : nextDrawDates.length > 0
          ? nextDrawDates
          : [fallbackDrawDate],
      scheduleMode,
      weeksCount,
    };
  }

  if (scheduleMode === 'next_draw') {
    const nextDrawDates = getUpcomingDraws(gameType, now, 1).slice(0, 1).map((draw) => draw.drawDate);
    return {
      drawDates: nextDrawDates.length > 0 ? nextDrawDates : [fallbackDrawDate],
      scheduleMode,
      weeksCount,
    };
  }

  if (scheduleMode === 'full_week' || scheduleMode === 'current_week') {
    const currentWeekDates = getDrawsForCurrentWeek(gameType, now).map((draw) => draw.drawDate);
    return {
      drawDates: currentWeekDates.length > 0 ? currentWeekDates : [fallbackDrawDate],
      scheduleMode,
      weeksCount,
    };
  }

  const upcomingDrawDates = getUpcomingDraws(gameType, now, weeksCount).map((draw) => draw.drawDate);
  return {
    drawDates: upcomingDrawDates.length > 0 ? upcomingDrawDates : [fallbackDrawDate],
    scheduleMode,
    weeksCount,
  };
}
