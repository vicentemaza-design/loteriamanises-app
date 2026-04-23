import * as React from 'react';
import { PlaySessionContext, type AddDraftResult } from './PlaySessionContext';
import { createEmptySession, deriveSessionStatus, getDraftSignature, normalizeDrafts, persistSession, readStoredSession } from '../lib/session.utils';
import type { PlayDraft, PlaySession, PlaySessionStatus } from '../types/session.types';

type State = {
  session: PlaySession;
  errorMessage: string | null;
};

type Action =
  | { type: 'hydrate'; session: PlaySession }
  | { type: 'replaceDrafts'; drafts: PlayDraft[]; status?: PlaySessionStatus; errorMessage?: string | null }
  | { type: 'openReview' }
  | { type: 'closeReview' }
  | { type: 'markConfirming' }
  | { type: 'markFailed'; message: string }
  | { type: 'clearSession' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { session: action.session, errorMessage: null };
    case 'replaceDrafts': {
      const drafts = normalizeDrafts(action.drafts);
      const nextSession: PlaySession = {
        ...state.session,
        drafts,
        status: action.status ?? deriveSessionStatus(state.session.status, drafts.length),
      };

      if (drafts.length === 0) {
        return { session: createEmptySession(), errorMessage: action.errorMessage ?? null };
      }

      return { session: nextSession, errorMessage: action.errorMessage ?? null };
    }
    case 'openReview':
      return {
        ...state,
        session: {
          ...state.session,
          status: state.session.drafts.length > 0 ? 'reviewing' : 'idle',
        },
      };
    case 'closeReview':
      return {
        ...state,
        session: {
          ...state.session,
          status: deriveSessionStatus('building', state.session.drafts.length),
        },
      };
    case 'markConfirming':
      return {
        ...state,
        errorMessage: null,
        session: {
          ...state.session,
          status: 'confirming',
        },
      };
    case 'markFailed':
      return {
        ...state,
        errorMessage: action.message,
        session: {
          ...state.session,
          status: state.session.drafts.length > 0 ? 'failed' : 'idle',
        },
      };
    case 'clearSession':
      return { session: createEmptySession(), errorMessage: null };
    default:
      return state;
  }
}

export function PlaySessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, () => ({
    session: readStoredSession(),
    errorMessage: null,
  }));

  React.useEffect(() => {
    persistSession(state.session);
  }, [state.session]);

  React.useEffect(() => {
    if (state.session.drafts.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({
        type: 'replaceDrafts',
        drafts: state.session.drafts,
        status: deriveSessionStatus(state.session.status, state.session.drafts.length),
        errorMessage: state.errorMessage,
      });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [state.errorMessage, state.session.drafts, state.session.status]);

  const addDrafts = React.useCallback((incomingDrafts: PlayDraft[]): AddDraftResult => {
    const knownSignatures = new Set(state.session.drafts.map(getDraftSignature));
    const acceptedDrafts: PlayDraft[] = [];
    let duplicateCount = 0;

    for (const draft of incomingDrafts) {
      const signature = getDraftSignature(draft);
      if (knownSignatures.has(signature)) {
        duplicateCount += 1;
        continue;
      }
      knownSignatures.add(signature);
      acceptedDrafts.push(draft);
    }

    if (acceptedDrafts.length === 0) {
      return { addedCount: 0, duplicateCount };
    }

    dispatch({
      type: 'replaceDrafts',
      drafts: [...state.session.drafts, ...acceptedDrafts],
      status: 'building',
      errorMessage: null,
    });

    return {
      addedCount: acceptedDrafts.length,
      duplicateCount,
    };
  }, [state.session.drafts]);

  const addDraft = React.useCallback((draft: PlayDraft) => addDrafts([draft]), [addDrafts]);

  const updateDraft = React.useCallback((draftId: string, nextDraft: PlayDraft) => {
    const nextSignature = getDraftSignature(nextDraft);
    const hasDuplicate = state.session.drafts.some((draft) => draft.id !== draftId && getDraftSignature(draft) === nextSignature);

    if (hasDuplicate) {
      return { updated: false, duplicate: true };
    }

    const drafts = state.session.drafts.map((draft) => draft.id === draftId ? nextDraft : draft);
    dispatch({
      type: 'replaceDrafts',
      drafts,
      status: 'building',
      errorMessage: null,
    });

    return { updated: true, duplicate: false };
  }, [state.session.drafts]);

  const removeDraft = React.useCallback((draftId: string) => {
    dispatch({
      type: 'replaceDrafts',
      drafts: state.session.drafts.filter((draft) => draft.id !== draftId),
      status: deriveSessionStatus(state.session.status, Math.max(0, state.session.drafts.length - 1)),
      errorMessage: null,
    });
  }, [state.session.drafts, state.session.status]);

  const clearSession = React.useCallback(() => {
    dispatch({ type: 'clearSession' });
  }, []);

  const openReview = React.useCallback(() => {
    dispatch({ type: 'openReview' });
  }, []);

  const closeReview = React.useCallback(() => {
    dispatch({ type: 'closeReview' });
  }, []);

  const markConfirming = React.useCallback(() => {
    dispatch({ type: 'markConfirming' });
  }, []);

  const resolveConfirmSuccess = React.useCallback((confirmedDraftIds: string[]) => {
    const confirmedSet = new Set(confirmedDraftIds);
    dispatch({
      type: 'replaceDrafts',
      drafts: state.session.drafts.filter((draft) => !confirmedSet.has(draft.id)),
      status: 'confirmed',
      errorMessage: null,
    });
  }, [state.session.drafts]);

  const resolveConfirmPartial = React.useCallback((confirmedDraftIds: string[], message: string) => {
    const confirmedSet = new Set(confirmedDraftIds);
    dispatch({
      type: 'replaceDrafts',
      drafts: state.session.drafts.filter((draft) => !confirmedSet.has(draft.id)),
      status: 'failed',
      errorMessage: message,
    });
  }, [state.session.drafts]);

  const resolveConfirmFailure = React.useCallback((message: string) => {
    dispatch({ type: 'markFailed', message });
  }, []);

  const refreshDraftStatuses = React.useCallback(() => {
    dispatch({
      type: 'replaceDrafts',
      drafts: state.session.drafts,
      status: deriveSessionStatus(state.session.status, state.session.drafts.length),
      errorMessage: state.errorMessage,
    });
  }, [state.errorMessage, state.session.drafts, state.session.status]);

  const contextValue = React.useMemo(() => ({
    session: state.session,
    drafts: state.session.drafts,
    status: state.session.status,
    errorMessage: state.errorMessage,
    addDraft,
    addDrafts,
    updateDraft,
    removeDraft,
    clearSession,
    openReview,
    closeReview,
    markConfirming,
    resolveConfirmSuccess,
    resolveConfirmPartial,
    resolveConfirmFailure,
    refreshDraftStatuses,
  }), [
    addDraft,
    addDrafts,
    clearSession,
    closeReview,
    markConfirming,
    openReview,
    refreshDraftStatuses,
    removeDraft,
    resolveConfirmPartial,
    resolveConfirmFailure,
    resolveConfirmSuccess,
    state.errorMessage,
    state.session,
    updateDraft,
  ]);

  return (
    <PlaySessionContext.Provider value={contextValue}>
      {children}
    </PlaySessionContext.Provider>
  );
}
