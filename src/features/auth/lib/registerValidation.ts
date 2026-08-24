import { differenceInYears, isValid, parseISO } from 'date-fns';
import type { DocumentType } from '@/services/api/contracts/auth.contracts';

export const MIN_REGISTRATION_AGE = 18;

export function passwordsMatch(password: string, repeatPassword: string): boolean {
  return password.length > 0 && password === repeatPassword;
}

/**
 * UX-only age check — considers month/day, not just year subtraction.
 * BE MUST re-validate age server-side before completing registration;
 * this only prevents an obviously-underage user from submitting the form.
 */
export function isAdult(birthDateIso: string, minAge = MIN_REGISTRATION_AGE): boolean {
  if (!birthDateIso) return false;
  const date = parseISO(birthDateIso);
  if (!isValid(date) || date > new Date()) return false;
  return differenceInYears(new Date(), date) >= minAge;
}

// Format-only patterns. NIE and PASSPORT stay format-only on purpose (no
// control-letter/checksum algorithm) — explicit client decision, do not
// extend the NIF algorithm below to them. BE must still perform the
// definitive validation server-side for all three.
const DOCUMENT_PATTERNS: Record<DocumentType, RegExp> = {
  NIF: /^\d{8}[A-Za-z]$/,
  NIE: /^[XYZxyz]\d{7}[A-Za-z]$/,
  PASSPORT: /^[A-Za-z0-9]{5,15}$/,
};

// Official Spanish NIF control-letter algorithm: resto = número % 23,
// indexed into this 23-letter table.
const NIF_CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function hasValidNifControlLetter(normalizedNif: string): boolean {
  const number = parseInt(normalizedNif.slice(0, 8), 10);
  const letter = normalizedNif.slice(8);
  return NIF_CONTROL_LETTERS[number % 23] === letter;
}

export function normalizeDocumentNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '');
}

/** Format-only check (8 digits + letter for NIF, etc.) — no checksum. */
export function hasValidDocumentFormat(type: DocumentType, value: string): boolean {
  return DOCUMENT_PATTERNS[type].test(normalizeDocumentNumber(value));
}

/**
 * Full validity check. NIF additionally verifies its control letter via the
 * official checksum (resto = número % 23); NIE and PASSPORT remain
 * format-only, matching hasValidDocumentFormat exactly for those two types.
 */
export function isValidDocumentNumber(type: DocumentType, value: string): boolean {
  const normalized = normalizeDocumentNumber(value);
  if (!DOCUMENT_PATTERNS[type].test(normalized)) return false;
  if (type === 'NIF') return hasValidNifControlLetter(normalized);
  return true;
}

/**
 * Lenient Spanish mobile/landline check (9 digits, optional +34/0034
 * prefix). Deliberately not stricter — BE owns the definitive normalization
 * once the real backend is connected.
 */
export function isValidPhone(value: string): boolean {
  const normalized = value.trim().replace(/[\s-]/g, '').replace(/^(\+34|0034)/, '');
  return /^[6789]\d{8}$/.test(normalized);
}
