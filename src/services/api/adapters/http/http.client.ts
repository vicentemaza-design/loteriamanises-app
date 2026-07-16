import type { ApiErrorDto } from '../../contracts/common.contracts';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

if (!BASE_URL && import.meta.env.VITE_API_PROVIDER === 'http') {
  throw new Error('[HttpAdapter] VITE_API_BASE_URL is required when VITE_API_PROVIDER=http. Set it in .env.local.');
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
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: await buildHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await buildHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
