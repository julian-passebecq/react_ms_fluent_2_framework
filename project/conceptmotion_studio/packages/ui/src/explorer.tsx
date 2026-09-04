import {
  Badge,
  Button,
  Card,
  Checkbox,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Dropdown,
  Field,
  Option,
  OverlayDrawer,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text
} from '@fluentui/react-components';
import { useId } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { CatalogShell, SearchFilterBar } from './catalog';
import type { CatalogViewMode } from './catalog-state';
import { mergeClassNames } from './internal';
import { FreshnessBadge } from './status';
import type { FreshnessState } from './status';

export interface EntityCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onSelect'> {
  readonly entityId: string;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly media?: ReactNode;
  readonly metadata?: ReactNode;
  readonly tags?: readonly TagListItem[];
  readonly actions?: ReactNode;
  readonly footer?: ReactNode;
  readonly selected?: boolean;
  readonly onSelect?: (entityId: string) => void;
}

export function EntityCard({
  entityId,
  title,
  description,
  eyebrow,
  media,
  metadata,
  tags,
  actions,
  footer,
  selected = false,
  onSelect,
  className,
  onClick,
  onKeyDown,
  ...rest
}: EntityCardProps) {
  const activate = () => onSelect?.(entityId);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && onSelect && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      activate();
    }
  };
  return (
    <Card
      className={mergeClassNames('dp-entity-card', className)}
      data-entity-id={entityId}
      data-selected={selected ? 'true' : 'false'}
      aria-pressed={onSelect ? selected : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) activate();
      }}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {media ? <div className="dp-entity-card__media">{media}</div> : null}
      <div className="dp-entity-card__body">
        {eyebrow ? <div className="dp-entity-card__eyebrow">{eyebrow}</div> : null}
        <h3 className="dp-entity-card__title">{title}</h3>
        {description ? <div className="dp-entity-card__description">{description}</div> : null}
        {metadata ? <div className="dp-entity-card__metadata">{metadata}</div> : null}
        {tags?.length ? <TagList tags={tags} aria-label="Tags" /> : null}
      </div>
      {actions || footer ? (
        <footer className="dp-entity-card__footer">
          <div>{footer}</div>
          {actions ? <div className="dp-entity-card__actions">{actions}</div> : null}
        </footer>
      ) : null}
    </Card>
  );
}

export type MetricTone = 'neutral' | 'informative' | 'success' | 'warning' | 'danger';

export interface MetricProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly detail?: ReactNode;
  readonly tone?: MetricTone;
}

export function Metric({ label, value, detail, tone = 'neutral', className, ...rest }: MetricProps) {
  return (
    <div className={mergeClassNames('dp-metric', className)} data-tone={tone} {...rest}>
      <dt className="dp-metric__label">{label}</dt>
      <dd className="dp-metric__value">{value}</dd>
      {detail ? <dd className="dp-metric__detail">{detail}</dd> : null}
    </div>
  );
}

export interface MetricItem extends MetricProps {
  readonly id: string;
}

export interface MetricStripProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  readonly metrics: readonly MetricItem[];
  readonly label?: string;
}

export function MetricStrip({ metrics, label = 'Summary metrics', className, ...rest }: MetricStripProps) {
  return (
    <dl className={mergeClassNames('dp-metric-strip', className)} aria-label={label} {...rest}>
      {metrics.map(({ id, ...metric }) => <Metric key={id} {...metric} />)}
    </dl>
  );
}

export interface FacetFilterOption {
  readonly value: string;
  readonly label: ReactNode;
  readonly count?: number;
  readonly disabled?: boolean;
}

export interface FacetFilterProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  readonly label: ReactNode;
  readonly options: readonly FacetFilterOption[];
  readonly selectedValues: readonly string[];
  readonly onChange: (values: readonly string[]) => void;
  readonly clearLabel?: string;
}

export function FacetFilter({ label, options, selectedValues, onChange, clearLabel = 'Clear', className, ...rest }: FacetFilterProps) {
  const selected = new Set(selectedValues);
  const toggle = (value: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(value);
    else next.delete(value);
    onChange([...next].sort());
  };
  return (
    <fieldset className={mergeClassNames('dp-facet-filter', className)} {...rest}>
      <legend>{label}</legend>
      <div className="dp-facet-filter__options">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={selected.has(option.value)}
            disabled={option.disabled}
            label={<span>{option.label}{option.count === undefined ? null : <span className="dp-facet-filter__count">{option.count}</span>}</span>}
            onChange={(_, data) => toggle(option.value, data.checked === true)}
          />
        ))}
      </div>
      {selected.size > 0 ? <Button appearance="subtle" size="small" onClick={() => onChange([])}>{clearLabel}</Button> : null}
    </fieldset>
  );
}

export interface SortOption {
  readonly value: string;
  readonly label: string;
}

export interface SortControlProps {
  readonly label?: string;
  readonly value: string;
  readonly options: readonly SortOption[];
  readonly onChange: (value: string) => void;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function SortControl({ label = 'Sort by', value, options, onChange, className, disabled }: SortControlProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';
  return (
    <Field className={mergeClassNames('dp-sort-control', className)} label={label} orientation="horizontal">
      <Dropdown
        value={selectedLabel}
        selectedOptions={value ? [value] : []}
        disabled={disabled}
        onOptionSelect={(_, data) => data.optionValue !== undefined && onChange(data.optionValue)}
      >
        {options.map((option) => <Option key={option.value} value={option.value}>{option.label}</Option>)}
      </Dropdown>
    </Field>
  );
}

export interface ViewToggleOption {
  readonly value: CatalogViewMode;
  readonly label: ReactNode;
  readonly icon?: ReactElement;
}

export interface ViewToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  readonly value: CatalogViewMode;
  readonly onChange: (value: CatalogViewMode) => void;
  readonly options?: readonly ViewToggleOption[];
  readonly label?: string;
}

const defaultViewOptions: readonly ViewToggleOption[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'table', label: 'Table' }
];

export function ViewToggle({ value, onChange, options = defaultViewOptions, label = 'View', className, ...rest }: ViewToggleProps) {
  return (
    <div className={mergeClassNames('dp-view-toggle', className)} role="group" aria-label={label} {...rest}>
      {options.map((option) => (
        <Button
          key={option.value}
          appearance={value === option.value ? 'primary' : 'subtle'}
          aria-pressed={value === option.value}
          icon={option.icon}
          size="small"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export interface TagListItem {
  readonly id: string;
  readonly label?: ReactNode;
  readonly tone?: MetricTone;
}

export interface TagListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  readonly tags: readonly TagListItem[];
  readonly maxVisible?: number;
  readonly overflowLabel?: (hiddenCount: number) => string;
}

export function TagList({ tags, maxVisible = Number.POSITIVE_INFINITY, overflowLabel = (count) => `+${count}`, className, ...rest }: TagListProps) {
  const visible = tags.slice(0, Math.max(0, maxVisible));
  const hidden = Math.max(0, tags.length - visible.length);
  return (
    <ul className={mergeClassNames('dp-tag-list', className)} {...rest}>
      {visible.map((tag) => <li key={tag.id}><Badge appearance="outline" size="small" data-tone={tag.tone}>{tag.label ?? tag.id}</Badge></li>)}
      {hidden > 0 ? <li><Badge appearance="tint" size="small">{overflowLabel(hidden)}</Badge></li> : null}
    </ul>
  );
}

export interface EntityTableColumn<T> {
  readonly id: string;
  readonly header: ReactNode;
  readonly renderCell: (item: T) => ReactNode;
}

export interface EntityTableProps<T> {
  readonly items: readonly T[];
  readonly columns: readonly EntityTableColumn<T>[];
  readonly getRowId: (item: T) => string;
  readonly selectedRowId?: string;
  readonly onRowSelect?: (item: T) => void;
  readonly label?: string;
  readonly emptyState?: ReactNode;
  readonly className?: string;
}

export function EntityTable<T>({ items, columns, getRowId, selectedRowId, onRowSelect, label = 'Catalog table', emptyState = 'No results', className }: EntityTableProps<T>) {
  const labelId = useId();
  return (
    <div className={mergeClassNames('dp-entity-table', className)}>
      <span className="dp-visually-hidden" id={labelId}>{label}</span>
      <Table aria-labelledby={labelId} size="small">
        <TableHeader>
          <TableRow>{columns.map((column) => <TableHeaderCell key={column.id}>{column.header}</TableHeaderCell>)}</TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow><TableCell colSpan={Math.max(1, columns.length)}>{emptyState}</TableCell></TableRow>
          ) : items.map((item) => {
            const id = getRowId(item);
            const selected = id === selectedRowId;
            return (
              <TableRow
                key={id}
                data-row-id={id}
                data-selected={selected ? 'true' : 'false'}
                aria-selected={onRowSelect ? selected : undefined}
                tabIndex={onRowSelect ? 0 : undefined}
                onClick={() => onRowSelect?.(item)}
                onKeyDown={(event) => {
                  if (onRowSelect && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onRowSelect(item);
                  }
                }}
              >
                {columns.map((column) => <TableCell key={column.id}>{column.renderCell(item)}</TableCell>)}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export interface DetailDrawerProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly position?: 'start' | 'end';
}

export function DetailDrawer({ open, onOpenChange, title, description, actions, footer, children, closeLabel = 'Close details', position = 'end' }: DetailDrawerProps) {
  return (
    <OverlayDrawer open={open} position={position} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance="subtle" aria-label={closeLabel} onClick={() => onOpenChange(false)}>×</Button>}>
          {title}
        </DrawerHeaderTitle>
        {description ? <div className="dp-detail-drawer__description">{description}</div> : null}
        {actions ? <div className="dp-detail-drawer__actions">{actions}</div> : null}
      </DrawerHeader>
      <DrawerBody>{children}</DrawerBody>
      {footer ? <footer className="dp-detail-drawer__footer">{footer}</footer> : null}
    </OverlayDrawer>
  );
}

export interface FreshnessStampProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'prefix'> {
  readonly verifiedAt?: string | number | Date;
  readonly prefix?: ReactNode;
  readonly unknownLabel?: ReactNode;
  readonly locale?: string;
  readonly state?: FreshnessState;
}

export function FreshnessStamp({ verifiedAt, prefix = 'Verified', unknownLabel = 'Verification date unknown', locale = 'en', state, className, ...rest }: FreshnessStampProps) {
  const date = verifiedAt instanceof Date ? verifiedAt : verifiedAt === undefined ? undefined : new Date(verifiedAt);
  const valid = date !== undefined && Number.isFinite(date.getTime());
  const iso = valid ? date.toISOString() : undefined;
  const label = valid ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date) : unknownLabel;
  return (
    <span className={mergeClassNames('dp-freshness-stamp', className)} {...rest}>
      <Text size={200}>{valid ? <>{prefix} <time dateTime={iso}>{label}</time></> : label}</Text>
      {state ? <FreshnessBadge state={state} /> : null}
    </span>
  );
}

export interface CatalogViewProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly items: readonly T[];
  readonly getItemId: (item: T) => string;
  readonly renderCard: (item: T) => ReactNode;
  readonly renderTable?: (items: readonly T[]) => ReactNode;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly view?: CatalogViewMode;
  readonly header?: ReactNode;
  readonly metrics?: ReactNode;
  readonly facets?: ReactNode;
  readonly controls?: ReactNode;
  readonly actions?: ReactNode;
  readonly detail?: ReactNode;
  readonly emptyState?: ReactNode;
  readonly searchLabel?: string;
  readonly searchPlaceholder?: string;
  readonly clearSearchLabel?: string;
  readonly resultsLabel?: string;
  readonly filtersLabel?: string;
  readonly resultCountLabel?: (count: number) => ReactNode;
}

export function CatalogView<T>({
  items,
  getItemId,
  renderCard,
  renderTable,
  query,
  onQueryChange,
  view = 'cards',
  header,
  metrics,
  facets,
  controls,
  actions,
  detail,
  emptyState = 'No matching items',
  searchLabel = 'Search catalog',
  searchPlaceholder = 'Search',
  clearSearchLabel = 'Clear search',
  resultsLabel = 'Catalog results',
  filtersLabel = 'Catalog filters',
  resultCountLabel = (count) => `${count} result${count === 1 ? '' : 's'}`,
  className,
  ...rest
}: CatalogViewProps<T>) {
  const results = items.length === 0
    ? <div className="dp-catalog-view__empty">{emptyState}</div>
    : view === 'table' && renderTable
      ? renderTable(items)
      : <div className="dp-catalog-view__cards">{items.map((item) => <div key={getItemId(item)}>{renderCard(item)}</div>)}</div>;
  return (
    <div className={mergeClassNames('dp-catalog-view', className)} {...rest}>
      <CatalogShell
        header={<>
          {header}
          {metrics ? <div className="dp-catalog-view__metrics">{metrics}</div> : null}
          <SearchFilterBar
            query={query}
            onQueryChange={onQueryChange}
            label={searchLabel}
            placeholder={searchPlaceholder}
            clearLabel={clearSearchLabel}
            filters={controls}
            actions={actions}
          />
        </>}
        filters={facets}
        filtersLabel={filtersLabel}
        results={<>
          <div className="dp-catalog-view__count" role="status" aria-live="polite">{resultCountLabel(items.length)}</div>
          {results}
        </>}
        resultsLabel={resultsLabel}
        detail={detail}
      />
    </div>
  );
}
