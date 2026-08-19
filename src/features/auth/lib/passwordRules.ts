export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

/** Shown to the user as a live checklist while typing — see PasswordRequirementsList. */
export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'Una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Una minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
