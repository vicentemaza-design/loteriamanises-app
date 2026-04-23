import { createContext, useContext } from 'react';
import type { PlayDraft, PlaySession, PlaySessionStatus } from '../types/session.types';

export interface AddDraftResult {
  addedCount: number;
  duplicateCount: number;
}

export interface PlaySessionContextValue {
  session: PlaySession;
  drafts: PlayDraft[];
  status: PlaySessionStatus;
  errorMessage: string | null;
  addDraft: (draft: PlayDraft) => AddDraftResult;
  addDrafts: (drafts: PlayDraft[]) => AddDraftResult;
  updateDraft: (draftId: string, nextDraft: PlayDraft) => { updated: boolean; duplicate: boolean };
  removeDraft: (draftId: string) => void;
  clearSession: () => void;
  openReview: () => void;
  closeReview: () => void;
  markConfirming: () => void;
  resolveConfirmSuccess: (confirmedDraftIds: string[]) => void;
  resolveConfirmPartial: (confirmedDraftIds: string[], message: string) => void;
  resolveConfirmFailure: (message: string) => void;
  refreshDraftStatuses: () => void;
}

export const PlaySessionContext = createContext<PlaySessionContextValue | null>(null);

export function usePlaySessionContext() {
  const context = useContext(PlaySessionContext);
  if (!context) {
    throw new Error('usePlaySessionContext must be used within PlaySessionProvider');
  }
  return context;
}
