import { Button, Input, Toolbar } from '@fluentui/react-components';
import type { HTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from './internal';

export interface CatalogShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'results'> {
  header?: ReactNode;
  filters?: ReactNode;
  results: ReactNode;
  detail?: ReactNode;
  filtersLabel?: string;
  resultsLabel?: string;
}

export function CatalogShell({
  header,
  filters,
  results,
  detail,
  filtersLabel = 'Catalog filters',
  resultsLabel = 'Catalog results',
  className,
  ...rest
}: CatalogShellProps) {
  return (
    <div className={mergeClassNames('dp-catalog-shell', className)} data-has-filters={filters ? 'true' : 'false'} {...rest}>
      {header ? <div className="dp-catalog-shell__header">{header}</div> : null}
      {filters ? <aside className="dp-catalog-shell__filters" aria-label={filtersLabel}>{filters}</aside> : null}
      <section className="dp-catalog-shell__results" aria-label={resultsLabel}>
        {results}
      </section>
      {detail ? <section className="dp-catalog-shell__detail">{detail}</section> : null}
    </div>
  );
}

export interface SearchFilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  query: string;
  onQueryChange(query: string): void;
  placeholder?: string;
  label?: string;
  clearLabel?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function SearchFilterBar({
  query,
  onQueryChange,
  placeholder = 'Search',
  label = 'Search catalog',
  clearLabel = 'Clear search',
  filters,
  actions,
  className,
  ...rest
}: SearchFilterBarProps) {
  return (
    <div className={mergeClassNames('dp-search-filter-bar', className)} {...rest}>
      <div className="dp-search-filter-bar__search">
        <Input
          className="dp-search-filter-bar__input"
          type="search"
          value={query}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
        />
        {query ? (
          <Button appearance="subtle" size="small" type="button" onClick={() => onQueryChange('')}>
            {clearLabel}
          </Button>
        ) : null}
      </div>
      {filters ? <div className="dp-search-filter-bar__filters">{filters}</div> : null}
      {actions ? (
        <Toolbar className="dp-search-filter-bar__actions" aria-label="Catalog actions">
          {actions}
        </Toolbar>
      ) : null}
    </div>
  );
}
