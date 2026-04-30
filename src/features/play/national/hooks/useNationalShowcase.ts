import { useMemo, useState } from 'react';
import { searchNationalShowcase } from '../application/search-national-showcase';
import type { NationalDrawId, NationalSearchState } from '../contracts/national-play.contract';
import { DEFAULT_NATIONAL_SEARCH_STATE, getNationalShowcaseItems } from '../mocks/national-showcase.mock';

export function useNationalShowcase(initialDrawId: NationalDrawId = 'jueves') {
  const [drawId, setDrawId] = useState<NationalDrawId>(initialDrawId);
  const [searchState, setSearchState] = useState<NationalSearchState>(DEFAULT_NATIONAL_SEARCH_STATE);

  const baseItems = useMemo(() => getNationalShowcaseItems(drawId), [drawId]);
  const items = useMemo(() => searchNationalShowcase(baseItems, searchState), [baseItems, searchState]);

  return {
    drawId,
    setDrawId,
    searchState,
    setSearchState,
    items,
    totalItems: items.length,
  };
}
