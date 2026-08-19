import type { AuthErrorCode } from '@/services/api/contracts/auth.contracts';

/**
 * Structured error thrown by IApiProvider.auth operations (loginWithEmail,
 * requestPasswordReset, register). Carries a stable `code` so the UI can
 * render a consistent message regardless of which adapter (mock/firebase/http) threw it.
 */
export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? AUTH_ERROR_MESSAGES[code]);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  validation_error: 'Revisa los datos introducidos.',
  technical_error: 'Ha ocurrido un error técnico. Inténtalo de nuevo.',
  rate_limited: 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
  service_unavailable: 'El acceso con email estará disponible próximamente. Usa Google para entrar.',
  email_already_in_use: 'Ya existe una cuenta con este email.',
  underage: 'Debes ser mayor de 18 años para crear una cuenta.',
};

/** Maps any thrown value to a user-facing Spanish message, defaulting to a generic technical error. */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return AUTH_ERROR_MESSAGES.technical_error;
}
