import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type CatalogViewMode = 'cards' | 'table';

export interface CatalogUrlState {
  readonly query: string;
  readonly filters: Readonly<Record<string, readonly string[]>>;
  readonly sort: string;
  readonly view: CatalogViewMode;
}

export interface CatalogUrlConfig {
  readonly queryParam?: string;
  readonly sortParam?: string;
  readonly viewParam?: string;
  readonly facetPrefix?: string;
  readonly defaultSort?: string;
  readonly defaultView?: CatalogViewMode;
  readonly allowedSorts?: readonly string[];
  readonly allowedFacets?: readonly string[];
}

export interface CatalogUrlAdapter {
  /** Returns a query string with or without the leading question mark. */
  readSearch(): string;
  /** Receives a query string with a leading question mark, or an empty string. */
  replaceSearch(search: string): void;
  subscribe?(listener: () => void): () => void;
}

export interface UseCatalogUrlStateOptions {
  readonly config?: CatalogUrlConfig;
  readonly adapter?: CatalogUrlAdapter | null;
  readonly initialSearch?: string;
}

export interface CatalogItemAccessors<T> {
  readonly searchText: (item: T) => string | readonly string[];
  readonly facetValues?: (item: T, facetId: string) => readonly string[];
  readonly sortComparators?: Readonly<Record<string, (left: T, right: T) => number>>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))].sort(compareText);
}

function paramsFrom(source: string | URLSearchParams): URLSearchParams {
  if (source instanceof URLSearchParams) return new URLSearchParams(source);
  const question = source.indexOf('?');
  const fragment = source.indexOf('#', question < 0 ? 0 : question);
  const start = question >= 0 ? question + 1 : source.startsWith('?') ? 1 : 0;
  const end = fragment >= 0 ? fragment : source.length;
  return new URLSearchParams(source.slice(start, end));
}

export function normalizeCatalogUrlState(state: Partial<CatalogUrlState>, config: CatalogUrlConfig = {}): CatalogUrlState {
  const allowedFacets = config.allowedFacets ? new Set(config.allowedFacets) : undefined;
  const filters: Record<string, readonly string[]> = {};
  Object.keys(state.filters ?? {}).sort(compareText).forEach((facetId) => {
    if (allowedFacets && !allowedFacets.has(facetId)) return;
    const values = uniqueSorted(state.filters?.[facetId] ?? []);
    if (values.length > 0) filters[facetId] = values;
  });
  const defaultSort = config.defaultSort ?? '';
  const requestedSort = state.sort ?? defaultSort;
  const sort = config.allowedSorts && !config.allowedSorts.includes(requestedSort) ? defaultSort : requestedSort;
  return {
    query: state.query ?? '',
    filters,
    sort,
    view: state.view === 'table' || state.view === 'cards' ? state.view : (config.defaultView ?? 'cards')
  };
}

export function parseCatalogUrlState(source: string | URLSearchParams, config: CatalogUrlConfig = {}): CatalogUrlState {
  const params = paramsFrom(source);
  const queryParam = config.queryParam ?? 'q';
  const sortParam = config.sortParam ?? 'sort';
  const viewParam = config.viewParam ?? 'view';
  const facetPrefix = config.facetPrefix ?? 'facet.';
  const filters: Record<string, string[]> = {};
  params.forEach((value, key) => {
    if (!key.startsWith(facetPrefix)) return;
    const facetId = key.slice(facetPrefix.length);
    if (!facetId) return;
    (filters[facetId] ??= []).push(value);
  });
  const requestedView = params.get(viewParam);
  return normalizeCatalogUrlState({
    query: params.get(queryParam) ?? '',
    filters,
    sort: params.get(sortParam) ?? config.defaultSort ?? '',
    view: requestedView === 'table' ? 'table' : requestedView === 'cards' ? 'cards' : config.defaultView
  }, config);
}

export function serializeCatalogUrlState(state: CatalogUrlState, config: CatalogUrlConfig = {}): string {
  const normalized = normalizeCatalogUrlState(state, config);
  const params = new URLSearchParams();
  const queryParam = config.queryParam ?? 'q';
  const sortParam = config.sortParam ?? 'sort';
  const viewParam = config.viewParam ?? 'view';
  const facetPrefix = config.facetPrefix ?? 'facet.';
  if (normalized.query) params.append(queryParam, normalized.query);
  Object.keys(normalized.filters).sort(compareText).forEach((facetId) => {
    normalized.filters[facetId].forEach((value) => params.append(`${facetPrefix}${facetId}`, value));
  });
  if (normalized.sort && normalized.sort !== (config.defaultSort ?? '')) params.append(sortParam, normalized.sort);
  if (normalized.view !== (config.defaultView ?? 'cards')) params.append(viewParam, normalized.view);
  return params.toString();
}

export function setCatalogQuery(state: CatalogUrlState, query: string): CatalogUrlState {
  return { ...state, query };
}

export function setCatalogSort(state: CatalogUrlState, sort: string): CatalogUrlState {
  return { ...state, sort };
}

export function setCatalogView(state: CatalogUrlState, view: CatalogViewMode): CatalogUrlState {
  return { ...state, view };
}

export function setCatalogFacetValues(state: CatalogUrlState, facetId: string, values: readonly string[]): CatalogUrlState {
  if (!facetId.trim()) throw new Error('facetId must be non-empty.');
  const next = { ...state.filters };
  const normalized = uniqueSorted(values);
  if (normalized.length > 0) next[facetId] = normalized;
  else delete next[facetId];
  return { ...state, filters: Object.fromEntries(Object.keys(next).sort(compareText).map((key) => [key, next[key]])) };
}

export function toggleCatalogFacetValue(state: CatalogUrlState, facetId: string, value: string): CatalogUrlState {
  const current = new Set(state.filters[facetId] ?? []);
  if (current.has(value)) current.delete(value);
  else current.add(value);
  return setCatalogFacetValues(state, facetId, [...current]);
}

export function filterAndSortCatalogItems<T>(
  items: readonly T[],
  state: CatalogUrlState,
  accessors: CatalogItemAccessors<T>
): readonly T[] {
  const tokens = state.query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  const filters = Object.entries(state.filters).filter(([, values]) => values.length > 0);
  const indexed = items.map((item, index) => ({ item, index })).filter(({ item }) => {
    const searchValues = [accessors.searchText(item)].flat().map((value) => String(value).toLocaleLowerCase());
    if (!tokens.every((token) => searchValues.some((value) => value.includes(token)))) return false;
    return filters.every(([facetId, selected]) => {
      const actual = new Set(accessors.facetValues?.(item, facetId) ?? []);
      return selected.some((value) => actual.has(value));
    });
  });
  const comparator = accessors.sortComparators?.[state.sort];
  if (comparator) indexed.sort((left, right) => comparator(left.item, right.item) || left.index - right.index);
  return indexed.map(({ item }) => item);
}

export function createBrowserCatalogUrlAdapter(): CatalogUrlAdapter | null {
  if (typeof window === 'undefined') return null;
  return {
    readSearch: () => window.location.search,
    replaceSearch(search) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${search}${window.location.hash}`);
    },
    subscribe(listener) {
      window.addEventListener('popstate', listener);
      return () => window.removeEventListener('popstate', listener);
    }
  };
}

export function useCatalogUrlState(options: UseCatalogUrlStateOptions = {}): readonly [CatalogUrlState, Dispatch<SetStateAction<CatalogUrlState>>] {
  const browserAdapter = useMemo(
    () => options.adapter === undefined ? createBrowserCatalogUrlAdapter() : null,
    [options.adapter]
  );
  const adapter = options.adapter === undefined ? browserAdapter : options.adapter;
  const config = options.config ?? {};
  const [state, setState] = useState<CatalogUrlState>(() =>
    parseCatalogUrlState(adapter?.readSearch() ?? options.initialSearch ?? '', config)
  );

  useEffect(() => adapter?.subscribe?.(() => setState(parseCatalogUrlState(adapter.readSearch(), config))), [adapter, config]);

  const setUrlState = useCallback<Dispatch<SetStateAction<CatalogUrlState>>>((nextValue) => {
    setState((current) => {
      const requested = typeof nextValue === 'function' ? nextValue(current) : nextValue;
      const normalized = normalizeCatalogUrlState(requested, config);
      const search = serializeCatalogUrlState(normalized, config);
      adapter?.replaceSearch(search ? `?${search}` : '');
      return normalized;
    });
  }, [adapter, config]);

  return [state, setUrlState] as const;
}
