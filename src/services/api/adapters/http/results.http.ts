import type { ResultDto } from '../../contracts/results.contracts';

/**
 * HTTP Results Adapter (Stub)
 * Implementation for a future REST API integration.
 */

export async function getLatestResultsHttp(): Promise<ResultDto[]> {
  console.warn('getLatestResultsHttp: Not implemented yet, returning empty array.');
  return [];
}

export async function getResultByIdHttp(id: string): Promise<ResultDto | null> {
  console.warn('getResultByIdHttp: Not implemented yet, returning null.');
  return null;
}
