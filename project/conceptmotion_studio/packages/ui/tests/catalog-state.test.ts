import { describe, expect, it } from 'vitest';
import {
  filterAndSortCatalogItems,
  normalizeCatalogUrlState,
  parseCatalogUrlState,
  serializeCatalogUrlState,
  setCatalogFacetValues,
  toggleCatalogFacetValue,
  type CatalogUrlState
} from '../src/catalog-state';

const config = {
  defaultSort: 'featured',
  defaultView: 'cards' as const,
  allowedSorts: ['featured', 'title'],
  allowedFacets: ['kind', 'status']
};

describe('catalog URL state', () => {
  it('parses only allowed state and canonicalizes repeated facet values', () => {
    expect(parseCatalogUrlState('?facet.kind=learning&facet.kind=catalog&facet.kind=learning&facet.nope=x&q=sql&sort=title&view=table', config)).toEqual({
      query: 'sql',
      filters: { kind: ['catalog', 'learning'] },
      sort: 'title',
      view: 'table'
    });
  });

  it('serializes deterministically and omits configured defaults', () => {
    const state: CatalogUrlState = {
      query: 'data tools',
      filters: { status: ['active'], kind: ['learning', 'catalog'] },
      sort: 'title',
      view: 'table'
    };
    expect(serializeCatalogUrlState(state, config)).toBe('q=data+tools&facet.kind=catalog&facet.kind=learning&facet.status=active&sort=title&view=table');
    expect(serializeCatalogUrlState(normalizeCatalogUrlState({}, config), config)).toBe('');
  });

  it('updates and removes facet selections without mutating the source', () => {
    const state = normalizeCatalogUrlState({}, config);
    const selected = toggleCatalogFacetValue(state, 'kind', 'learning');
    const removed = setCatalogFacetValues(selected, 'kind', []);
    expect(state.filters).toEqual({});
    expect(selected.filters).toEqual({ kind: ['learning'] });
    expect(removed.filters).toEqual({});
  });
});

describe('generic catalog filtering and sorting', () => {
  const items = [
    { id: 'z', title: 'SQL Window Course', kind: 'learning', status: 'active', order: 2 },
    { id: 'a', title: 'SQL Project Catalog', kind: 'catalog', status: 'active', order: 1 },
    { id: 'b', title: 'Python Course', kind: 'learning', status: 'archived', order: 3 }
  ];

  it('applies token search, OR-within-facet, AND-across-facets, and a stable comparator', () => {
    const state: CatalogUrlState = {
      query: 'sql',
      filters: { kind: ['learning', 'catalog'], status: ['active'] },
      sort: 'order',
      view: 'cards'
    };
    expect(filterAndSortCatalogItems(items, state, {
      searchText: (item) => [item.title, item.id],
      facetValues: (item, facet) => facet === 'kind' ? [item.kind] : facet === 'status' ? [item.status] : [],
      sortComparators: { order: (left, right) => left.order - right.order }
    }).map((item) => item.id)).toEqual(['a', 'z']);
  });
});
