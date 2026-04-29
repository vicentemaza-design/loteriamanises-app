export type DrawStatusState = 'open' | 'closingSoon' | 'closed';

export interface ResolveDrawStatusOptions {
  drawDate: string;
  salesCloseAt?: string | null;
  now?: Date;
  demoCutoffOffsetMinutes?: number;
}

export interface ResolvedDrawStatus {
  state: DrawStatusState;
  drawDate: string;
  salesCloseAt: string;
  isDemoCutoff: boolean;
  millisecondsUntilClose: number;
}
