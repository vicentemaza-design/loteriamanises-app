/**
 * Validates that a post-login redirect target is a same-app internal path —
 * never an absolute URL, protocol-relative URL (`//evil.com`) or any other
 * externally-controlled destination. Used to restore the page a logged-out
 * user was trying to reach before RequireAuth sent them to Login, without
 * opening an open-redirect vector.
 */
export function getSafeInternalPath(candidate: unknown, fallback: string): string {
  if (typeof candidate !== 'string') return fallback;
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//')) return fallback;
  if (candidate.includes('://')) return fallback;
  // Login itself (or empty) would just bounce back — never a valid restore target.
  if (candidate === '/' || candidate === '') return fallback;
  return candidate;
}
