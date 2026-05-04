import { useMemo, useState } from 'react';
import { buildNationalOrderBreakdown } from '../application/build-national-order-breakdown';
import type { NationalCartLine } from '../contracts/national-play.contract';

export const MAX_NATIONAL_DECIMOS = 50;

function getLineKey(line: Pick<NationalCartLine, 'number' | 'drawId'>): string {
  return `${line.drawId}:${line.number}`;
}

export function useNationalCart(initialLines: NationalCartLine[] = []) {
  const [lines, setLines] = useState<NationalCartLine[]>(initialLines);

  const addOrUpdateLine = (nextLine: NationalCartLine) => {
    setLines((current) => {
      const nextKey = getLineKey(nextLine);
      const existingIndex = current.findIndex((line) => getLineKey(line) === nextKey);
      const otherLines = existingIndex >= 0
        ? current.filter((_: NationalCartLine, i: number) => i !== existingIndex)
        : current;
      const otherTotal = otherLines.reduce((sum: number, l: NationalCartLine) => sum + l.quantity, 0);
      const remaining = MAX_NATIONAL_DECIMOS - otherTotal;
      const qty = Math.min(nextLine.quantity, remaining, nextLine.maxQuantity);
      const clamped: NationalCartLine = {
        ...nextLine,
        quantity: qty,
        totalPrice: nextLine.unitPrice * qty * nextLine.drawDates.length,
      };

      if (existingIndex === -1) {
        return qty > 0 ? [...current, clamped] : current;
      }
      return current.map((line, index) => index === existingIndex ? clamped : line);
    });
  };

  const removeLine = (number: string, drawId: NationalCartLine['drawId']) => {
    setLines((current) => current.filter((line) => getLineKey(line) !== `${drawId}:${number}`));
  };

  const clearCart = () => {
    setLines([]);
  };

  const updateQuantity = (number: string, drawId: NationalCartLine['drawId'], delta: number) => {
    setLines((current) => current.map((line) => {
      if (line.number === number && line.drawId === drawId) {
        const otherTotal = current
          .filter((l: NationalCartLine) => !(l.number === number && l.drawId === drawId))
          .reduce((sum: number, l: NationalCartLine) => sum + l.quantity, 0);
        const remaining = MAX_NATIONAL_DECIMOS - otherTotal;
        const nextQty = Math.min(line.maxQuantity, remaining, Math.max(1, line.quantity + delta));
        return {
          ...line,
          quantity: nextQty,
          totalPrice: line.unitPrice * nextQty * line.drawDates.length,
        };
      }
      return line;
    }));
  };

  const breakdown = useMemo(() => buildNationalOrderBreakdown(lines), [lines]);

  return {
    lines,
    addOrUpdateLine,
    removeLine,
    updateQuantity,
    clearCart,
    breakdown,
  };
}
