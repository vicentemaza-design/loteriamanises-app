import type { ApiErrorDto } from '../../contracts/common.contracts';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

if (!BASE_URL && import.meta.env.VITE_API_PROVIDER === 'http') {
  throw new Error('[HttpAdapter] VITE_API_BASE_URL is required when VITE_API_PROVIDER=http. Set it in .env.local.');
}

/** Centralized request timeout — applies to every apiGet/apiPost/apiPatch/apiDelete call. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Thrown when a request is aborted for exceeding REQUEST_TIMEOUT_MS — distinct from a network/offline failure or an HTTP 4xx/5xx response. */
export class HttpTimeoutError extends Error {
  constructor(path: string) {
    super('La solicitud está tardando demasiado. Inténtalo de nuevo.');
    this.name = 'HttpTimeoutError';
    Object.assign(this, { path, timeoutMs: REQUEST_TIMEOUT_MS });
  }
}

/** Thrown when fetch itself fails before getting any HTTP response (offline, DNS, CORS) — distinct from a timeout or an HTTP 4xx/5xx response. */
export class HttpNetworkError extends Error {
  constructor(path: string) {
    super('No se pudo conectar. Comprueba tu conexión a internet.');
    this.name = 'HttpNetworkError';
    Object.assign(this, { path });
  }
}

/**
 * Coherent, user-facing copy for a real connectivity failure (timeout or
 * network) — returns `null` for any other error so callers keep their own
 * fallback message. Used by financial flows (purchase/withdrawal/top-up) to
 * distinguish "we couldn't reach the server" from a generic unexpected
 * error, WITHOUT ever suggesting an automatic retry — a client-side timeout
 * never proves the server didn't process the operation, so callers keep
 * their normal manual "try again" action (the same submit button), never an
 * automatic resend.
 */
export function getConnectivityErrorMessage(error: unknown): string | null {
  if (error instanceof HttpTimeoutError || error instanceof HttpNetworkError) {
    return 'No hemos podido conectar. Comprueba tu conexión e inténtalo de nuevo.';
  }
  return null;
}

/**
 * Wraps fetch with a single AbortController-based timeout so no individual
 * endpoint has to implement its own — every apiGet/apiPost/apiPatch/apiDelete
 * call goes through this. Deliberately does NOT retry: retrying a financial
 * operation (purchase/withdrawal/top-up) automatically risks a duplicate
 * charge/submission if the first attempt actually reached the server before
 * timing out locally — callers keep their own explicit "try again" action
 * instead (see isSubmitting/isProcessing guards already used across the app).
 */
async function fetchWithTimeout(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${BASE_URL}${path}`, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpTimeoutError(path);
    }
    throw new HttpNetworkError(path);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns the Bearer token for authenticated requests.
 *
 * Currently uses the Firebase ID token.
 * When migrating to a custom JWT (MySQL backend), replace with:
 *   return localStorage.getItem('jwt_token');
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('@/shared/config/firebase');
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<Error> {
  try {
    const dto: ApiErrorDto = await res.json();
    const err = new Error(dto.message);
    Object.assign(err, { code: dto.code, status: res.status, details: dto.details });
    return err;
  } catch {
    return new Error(`HTTP ${res.status} — ${res.statusText}`);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: 'GET',
    headers: await buildHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: 'PATCH',
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: 'DELETE',
    headers: await buildHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
