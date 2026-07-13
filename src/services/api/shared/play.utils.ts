/**
 * Distributes a total amount across N draws using banker's rounding
 * to avoid floating-point drift. The first draw absorbs any remainder cents.
 */
export function splitAmountAcrossDraws(totalAmount: number, drawsCount: number): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / drawsCount);
  let remainder = totalCents - baseCents * drawsCount;

  return Array.from({ length: drawsCount }, () => {
    const cents = baseCents + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return cents / 100;
  });
}
