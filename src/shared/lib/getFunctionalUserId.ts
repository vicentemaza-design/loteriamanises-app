import { RUNTIME_CONFIG } from '@/config/runtime';

/**
 * Resolves the userId key used for FUNCTIONAL data fetching (tickets,
 * plays, wallet movements...). Deliberately independent from the caller's
 * real identity: in a demo-enabled deployment the functional dataset is
 * always the shared demo fixtures, regardless of whether the session
 * belongs to a real Google/email account or the fictitious demo identity.
 * Never affects displayName/email/photoURL, which keep reflecting the real
 * signed-in identity when one exists.
 */
export function getFunctionalUserId(user: { uid: string } | null | undefined): string {
  if (RUNTIME_CONFIG.demoEnabled) return 'demo-user';
  return user?.uid || 'demo-user';
}
