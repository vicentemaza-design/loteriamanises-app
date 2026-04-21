import type { ResultDto } from '../../contracts/results.contracts';

/**
 * Firebase Results Adapter (Stub)
 * Implementation for a real Firebase datasource.
 */

export async function getLatestResultsFirebase(): Promise<ResultDto[]> {
  console.warn('getLatestResultsFirebase: Not implemented yet, returning empty array.');
  return [];
}

export async function getResultByIdFirebase(id: string): Promise<ResultDto | null> {
  console.warn('getResultByIdFirebase: Not implemented yet, returning null.');
  return null;
}
