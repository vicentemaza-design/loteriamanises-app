import type { NationalSearchState, NationalShowcaseItem } from '../contracts/national-play.contract';

function getFeaturedScore(item: NationalShowcaseItem): number {
  if (item.badge === 'destacado') return 3;
  if (item.badge === 'agotandose') return 2;
  if (item.badge === 'ultimo') return 1;
  return 0;
}

export function searchNationalShowcase(
  items: NationalShowcaseItem[],
  searchState: NationalSearchState
): NationalShowcaseItem[] {
  const normalizedQuery = searchState.query.trim();

  const filtered = items.filter((item) => {
    // Filtro por cantidad mínima requerida (stock demo)
    if (item.available < searchState.minQuantity) {
      return false;
    }

    if (searchState.onlyAvailable && item.available <= 0) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return item.number === normalizedQuery || item.number.endsWith(normalizedQuery) || item.number.includes(normalizedQuery);
  });

  return [...filtered].sort((left, right) => {
    if (normalizedQuery) {
      const score = (item: NationalShowcaseItem) => {
        if (item.number === normalizedQuery) return 3;
        if (item.number.endsWith(normalizedQuery)) return 2;
        if (item.number.includes(normalizedQuery)) return 1;
        return 0;
      };
      const scoreDiff = score(right) - score(left);
      if (scoreDiff !== 0) return scoreDiff;
    }

    if (searchState.sortBy === 'availability') {
      return right.available - left.available || left.number.localeCompare(right.number);
    }

    if (searchState.sortBy === 'number') {
      return left.number.localeCompare(right.number);
    }

    return getFeaturedScore(right) - getFeaturedScore(left) || right.available - left.available || left.number.localeCompare(right.number);
  });
}
