import { useEffect, useRef } from 'react';

interface UseDialogA11yOptions {
  /** Whether the dialog/sheet is currently open/mounted. */
  active: boolean;
  /** Called on Escape while the dialog is open. */
  onClose: () => void;
}

/**
 * Minimal accessibility wiring for the app's hand-rolled dialogs/sheets
 * (no dialog library in this project — see docs/be-handoff). On open it
 * remembers whatever had focus and moves focus into the dialog container;
 * on close it restores focus to that element. Escape also closes.
 *
 * This is NOT a full focus trap (Tab can still leave the dialog) — the
 * remaining gap is tracked as P2 in the point-11 accessibility audit.
 */
export function useDialogA11y<T extends HTMLElement>({ active, onClose }: UseDialogA11yOptions) {
  const dialogRef = useRef<T>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Move focus in on open, restore it on close — depends only on `active`
  // so re-renders while the dialog stays open never re-steal focus from
  // whatever the user is currently interacting with inside it.
  useEffect(() => {
    if (!active) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      triggerRef.current?.focus?.();
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return dialogRef;
}
