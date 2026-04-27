import { useMemo, useState } from 'react';
import { buildNationalOrderBreakdown } from '../application/build-national-order-breakdown';
import type { NationalCartLine } from '../contracts/national-play.contract';

function getLineKey(line: Pick<NationalCartLine, 'number' | 'drawId'>): string {
  return `${line.drawId}:${line.number}`;
}

export function useNationalCart(initialLines: NationalCartLine[] = []) {
  const [lines, setLines] = useState<NationalCartLine[]>(initialLines);

  const addOrUpdateLine = (nextLine: NationalCartLine) => {
    setLines((current) => {
      const nextKey = getLineKey(nextLine);
      const existingIndex = current.findIndex((line) => getLineKey(line) === nextKey);

      if (existingIndex === -1) {
        return [...current, nextLine];
      }

      return current.map((line, index) => index === existingIndex ? nextLine : line);
    });
  };

  const removeLine = (number: string, drawId: NationalCartLine['drawId']) => {
    setLines((current) => current.filter((line) => getLineKey(line) !== `${drawId}:${number}`));
  };

  const clearCart = () => {
    setLines([]);
  };

  const breakdown = useMemo(() => buildNationalOrderBreakdown(lines), [lines]);

  return {
    lines,
    addOrUpdateLine,
    removeLine,
    clearCart,
    breakdown,
  };
}
