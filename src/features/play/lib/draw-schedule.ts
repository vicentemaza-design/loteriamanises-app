import type { GameType } from '@/shared/types/domain';
import { getDrawScheduleConfig } from '@/features/play/config/draw-schedule.config';

export interface ScheduledDraw {
  gameId: GameType;
  drawDate: string;
  label: string;
  weekLabel: string;
  isClosed: boolean;
}

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  const weekday = next.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + offset);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfWeek(date: Date): Date {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

function createScheduledDate(baseDate: Date, weekday: number, hour: number, minute: number): Date {
  const next = new Date(baseDate);
  const baseWeekday = next.getDay();
  const offset = (weekday - baseWeekday + 7) % 7;
  next.setDate(next.getDate() + offset);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function formatWeekLabel(date: Date): string {
  const weekStart = startOfWeek(date);
  return `Semana del ${weekStart.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })}`;
}

export function getUpcomingDraws(gameId: GameType, fromDate: Date | string, weeksAhead = 1): ScheduledDraw[] {
  const config = getDrawScheduleConfig(gameId);
  if (!config || config.drawWeekdays.length === 0) {
    return [];
  }

  const origin = typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate);
  const baseWeekStart = startOfWeek(origin);
  const draws: ScheduledDraw[] = [];

  for (let weekOffset = 0; weekOffset < weeksAhead; weekOffset += 1) {
    const weekBase = new Date(baseWeekStart);
    weekBase.setDate(weekBase.getDate() + (weekOffset * 7));

    for (const weekday of config.drawWeekdays) {
      const scheduledDate = createScheduledDate(weekBase, weekday, config.drawHour, config.drawMinute);
      if (scheduledDate < origin) {
        continue;
      }

      draws.push({
        gameId,
        drawDate: scheduledDate.toISOString(),
        label: scheduledDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }),
        weekLabel: formatWeekLabel(scheduledDate),
        isClosed: scheduledDate <= new Date(),
      });
    }
  }

  return draws.sort((left, right) => left.drawDate.localeCompare(right.drawDate));
}

export function groupDrawsByWeek(draws: ScheduledDraw[]): Record<string, ScheduledDraw[]> {
  return draws.reduce<Record<string, ScheduledDraw[]>>((acc, draw) => {
    if (!acc[draw.weekLabel]) {
      acc[draw.weekLabel] = [];
    }
    acc[draw.weekLabel].push(draw);
    return acc;
  }, {});
}

export function getDrawsForCurrentWeek(gameId: GameType, fromDate: Date | string): ScheduledDraw[] {
  const origin = typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate);
  const weekEnd = endOfWeek(origin);
  return getUpcomingDraws(gameId, origin, 1).filter((draw) => new Date(draw.drawDate) <= weekEnd);
}
