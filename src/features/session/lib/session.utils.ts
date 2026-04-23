import type { GameSelection, PlayDraft, PlaySession, PlaySessionStatus } from '../types/session.types';

const SESSION_STORAGE_KEY = 'play_session_v1';

function isPastDraw(drawDate: string) {
  return new Date(drawDate).getTime() <= Date.now();
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function serializeSelection(selection: GameSelection) {
  return JSON.stringify(sortObjectKeys(selection));
}

export function getDraftSignature(draft: Pick<PlayDraft, 'gameId' | 'drawDate' | 'selection'>) {
  return `${draft.gameId}::${draft.drawDate}::${serializeSelection(draft.selection)}`;
}

export function normalizeDraft(draft: PlayDraft): PlayDraft {
  if (draft.status === 'unavailable') {
    return draft;
  }

  return {
    ...draft,
    status: isPastDraw(draft.drawDate) ? 'stale' : draft.status === 'editing' ? 'editing' : 'valid',
  };
}

export function normalizeDrafts(drafts: PlayDraft[]) {
  return drafts.map(normalizeDraft).sort((a, b) => a.addedAt.localeCompare(b.addedAt));
}

export function deriveSessionStatus(status: PlaySessionStatus, draftCount: number): PlaySessionStatus {
  if (draftCount === 0) {
    return status === 'confirming' ? status : 'idle';
  }

  if (status === 'confirming' || status === 'reviewing' || status === 'failed') {
    return status;
  }

  return 'building';
}

export function createEmptySession(): PlaySession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    drafts: [],
    status: 'idle',
    createdAt: now,
  };
}

export function readStoredSession(): PlaySession {
  if (typeof window === 'undefined') {
    return createEmptySession();
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return createEmptySession();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlaySession>;
    const drafts = normalizeDrafts(parsed.drafts ?? []);
    return {
      id: parsed.id || crypto.randomUUID(),
      createdAt: parsed.createdAt || new Date().toISOString(),
      drafts,
      status: deriveSessionStatus('building', drafts.length),
    };
  } catch {
    return createEmptySession();
  }
}

export function persistSession(session: PlaySession) {
  if (typeof window === 'undefined') {
    return;
  }

  if (session.drafts.length === 0) {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id: session.id,
    drafts: session.drafts,
    createdAt: session.createdAt,
  }));
}

export function distributeAmount(totalAmount: number, itemsCount: number) {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / itemsCount);
  let remainder = totalCents - (baseCents * itemsCount);

  return Array.from({ length: itemsCount }, () => {
    const cents = baseCents + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return cents / 100;
  });
}
