import type { NationalCartLine, NationalOrderBreakdown } from '../contracts/national-play.contract';

export function buildNationalOrderBreakdown(lines: NationalCartLine[]): NationalOrderBreakdown {
  if (lines.length === 0) {
    return {
      lineCount: 0,
      totalDecimos: 0,
      drawsCount: 0,
      subtotal: 0,
      total: 0,
    };
  }

  const totalDecimos = lines.reduce((sum, line) => sum + line.quantity, 0);
  const drawsCount = lines.reduce((sum, line) => sum + Math.max(line.drawDates.length, 1), 0);
  const subtotal = lines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0);
  const total = lines.reduce((sum, line) => sum + line.totalPrice, 0);

  return {
    lineCount: lines.length,
    totalDecimos,
    drawsCount,
    subtotal,
    total,
  };
}
