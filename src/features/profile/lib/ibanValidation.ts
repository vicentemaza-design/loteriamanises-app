/**
 * IBAN — UX-level validation only. This never replaces server-side
 * validation; BE must re-validate format, checksum and ownership
 * server-side before persisting anything.
 */

const SPANISH_IBAN_PATTERN = /^ES\d{22}$/;

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

/** Reformats as the user types, grouping in blocks of 4 for readability. */
export function formatIbanForDisplay(value: string): string {
  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function maskIban(value: string): string {
  const clean = normalizeIban(value);
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)} **** **** **** ${clean.slice(-4)}`;
}

export function isValidSpanishIbanFormat(value: string): boolean {
  return SPANISH_IBAN_PATTERN.test(normalizeIban(value));
}

/**
 * MOD-97 checksum per ISO 7064 (the IBAN standard algorithm): move the first
 * 4 characters to the end, convert letters to numbers (A=10..Z=35), then the
 * resulting numeric string must be ≡ 1 (mod 97). Computed in chunks to stay
 * within safe integer range.
 */
export function isValidIbanChecksum(value: string): boolean {
  const clean = normalizeIban(value);
  if (clean.length < 4) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
}

export function isValidSpanishIban(value: string): boolean {
  return isValidSpanishIbanFormat(value) && isValidIbanChecksum(value);
}
