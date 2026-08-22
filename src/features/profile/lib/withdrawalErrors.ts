import { getConnectivityErrorMessage } from '@/services/api/adapters/http/http.client';

export type WithdrawalErrorCode = 'rate_limited' | 'service_unavailable' | 'technical_error';

/**
 * Structured error thrown by IApiProvider.wallet.createWithdrawal on
 * technical/transport failure. Carries a stable `code` so the UI can render
 * a consistent message regardless of which adapter threw it. This is
 * separate from WithdrawalStatus ('rejected'/'failed' below) — those are
 * successful responses describing the request's own outcome, not a failure
 * to even create it.
 */
export class WithdrawalError extends Error {
  code: WithdrawalErrorCode;

  constructor(code: WithdrawalErrorCode, message?: string) {
    super(message ?? WITHDRAWAL_ERROR_MESSAGES[code]);
    this.name = 'WithdrawalError';
    this.code = code;
  }
}

export const WITHDRAWAL_ERROR_MESSAGES: Record<WithdrawalErrorCode, string> = {
  rate_limited: 'Demasiadas solicitudes. Espera unos minutos antes de volver a intentarlo.',
  service_unavailable: 'El servicio de retiradas no está disponible ahora mismo.',
  technical_error: 'Ha ocurrido un error técnico. Inténtalo de nuevo.',
};

/** Maps any thrown value to a user-facing Spanish message, defaulting to a generic technical error. */
export function getWithdrawalErrorMessage(error: unknown): string {
  const connectivityMessage = getConnectivityErrorMessage(error);
  if (connectivityMessage) {
    return connectivityMessage;
  }
  if (error instanceof WithdrawalError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return WITHDRAWAL_ERROR_MESSAGES.technical_error;
}
