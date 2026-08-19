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

// Format-only checks — NOT a checksum/validity algorithm (no NIF/NIE control
// letter verification implemented on purpose, per explicit scope for this
// phase). BE must perform the definitive validation server-side.
const DOCUMENT_PATTERNS: Record<DocumentType, RegExp> = {
  NIF: /^\d{8}[A-Za-z]$/,
  NIE: /^[XYZxyz]\d{7}[A-Za-z]$/,
  PASSPORT: /^[A-Za-z0-9]{5,15}$/,
};

export function normalizeDocumentNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '');
}

export function isValidDocumentNumber(type: DocumentType, value: string): boolean {
  return DOCUMENT_PATTERNS[type].test(normalizeDocumentNumber(value));
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
