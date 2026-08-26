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

// Format-only patterns. PASSPORT stays format-only on purpose — passports
// are issued by many countries with no single universal checksum, so no
// control-letter algorithm is applied to it. BE must still perform the
// definitive validation server-side for all three.
const DOCUMENT_PATTERNS: Record<DocumentType, RegExp> = {
  NIF: /^\d{8}[A-Za-z]$/,
  NIE: /^[XYZxyz]\d{7}[A-Za-z]$/,
  PASSPORT: /^[A-Za-z0-9]{5,15}$/,
};

// Official Spanish NIF/NIE control-letter table: resto = número % 23,
// indexed into this 23-letter table. Same table for both document types —
// only how the 8-digit number is derived differs (see below).
const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function controlLetterForNumber(number: number): string {
  return CONTROL_LETTERS[number % 23];
}

function hasValidNifControlLetter(normalizedNif: string): boolean {
  const number = parseInt(normalizedNif.slice(0, 8), 10);
  const letter = normalizedNif.slice(8);
  return controlLetterForNumber(number) === letter;
}

// NIE control letter: the leading X/Y/Z stands in for 0/1/2 to form the same
// 8-digit number the NIF algorithm expects, then reuses controlLetterForNumber.
const NIE_PREFIX_DIGIT: Record<string, string> = { X: '0', Y: '1', Z: '2' };

function hasValidNieControlLetter(normalizedNie: string): boolean {
  const prefixDigit = NIE_PREFIX_DIGIT[normalizedNie[0]];
  const number = parseInt(prefixDigit + normalizedNie.slice(1, 8), 10);
  const letter = normalizedNie.slice(8);
  return controlLetterForNumber(number) === letter;
}

export function normalizeDocumentNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '');
}

/** Format-only check (8 digits + letter for NIF, etc.) — no checksum. */
export function hasValidDocumentFormat(type: DocumentType, value: string): boolean {
  return DOCUMENT_PATTERNS[type].test(normalizeDocumentNumber(value));
}

/**
 * Full validity check. NIF and NIE additionally verify their control letter
 * via the official checksum (resto = número % 23, same table); PASSPORT
 * remains format-only, matching hasValidDocumentFormat exactly.
 */
export function isValidDocumentNumber(type: DocumentType, value: string): boolean {
  const normalized = normalizeDocumentNumber(value);
  if (!DOCUMENT_PATTERNS[type].test(normalized)) return false;
  if (type === 'NIF') return hasValidNifControlLetter(normalized);
  if (type === 'NIE') return hasValidNieControlLetter(normalized);
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
