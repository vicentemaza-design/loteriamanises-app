import type {
  ResolveDrawStatusOptions,
  ResolvedDrawStatus,
  DrawStatusState,
} from '../contracts/draw-status.contract';

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const MINUTE_IN_MILLISECONDS = 60 * 1000;
const DEFAULT_DEMO_CUTOFF_OFFSET_MINUTES = 30;

export function resolveDrawStatus({
  drawDate,
  salesCloseAt,
  now = new Date(),
  demoCutoffOffsetMinutes = DEFAULT_DEMO_CUTOFF_OFFSET_MINUTES,
}: ResolveDrawStatusOptions): ResolvedDrawStatus {
  const drawAt = new Date(drawDate);
  const hasIntegratedCutoff = typeof salesCloseAt === 'string' && !Number.isNaN(new Date(salesCloseAt).getTime());
  const resolvedSalesCloseAt = hasIntegratedCutoff
    ? salesCloseAt
    : new Date(drawAt.getTime() - (demoCutoffOffsetMinutes * MINUTE_IN_MILLISECONDS)).toISOString();
  const cutoffAt = new Date(resolvedSalesCloseAt);
  const millisecondsUntilClose = cutoffAt.getTime() - now.getTime();

  let state: DrawStatusState = 'closed';
  if (millisecondsUntilClose > HOUR_IN_MILLISECONDS) {
    state = 'open';
  } else if (millisecondsUntilClose >= 0) {
    state = 'closingSoon';
  }

  return {
    state,
    drawDate,
    salesCloseAt: cutoffAt.toISOString(),
    isDemoCutoff: !hasIntegratedCutoff,
    millisecondsUntilClose,
  };
}
