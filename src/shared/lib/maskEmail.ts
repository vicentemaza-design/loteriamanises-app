/**
 * Masks an email address for display, e.g. "juan.perez@example.com" →
 * "ju***@example.com". UX-only — never used for validation or matching.
 * Mirrors the style of maskIban() in features/profile/lib/ibanValidation.ts.
 */
export function maskEmail(value: string): string {
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***${domain}`;
}
