import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CatalogView,
  EntityCard,
  EntityTable,
  FacetFilter,
  FreshnessStamp,
  MetricStrip,
  SortControl,
  TagList,
  ViewToggle
} from '../src/index';

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<FluentProvider theme={webLightTheme}>{node}</FluentProvider>);
}

describe('explorer primitives', () => {
  it('renders an accessible selectable entity card and compact tag overflow', () => {
    const html = render(
      <EntityCard
        entityId="project-hub"
        title="Project Hub"
        description="Canonical sites"
        selected
        onSelect={() => undefined}
        tags={[{ id: 'react' }, { id: 'fluent' }, { id: 'typescript' }]}
      />
    );
    expect(html).toContain('data-entity-id="project-hub"');
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Project Hub');
    expect(render(<TagList tags={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} maxVisible={2} />)).toContain('+1');
  });

  it('renders metrics, facets, sorting, and view controls with labels', () => {
    const html = render(<>
      <MetricStrip metrics={[{ id: 'projects', label: 'Projects', value: 12, detail: '9 active', tone: 'informative' }]} />
      <FacetFilter label="Kind" options={[{ value: 'learning', label: 'Learning', count: 3 }]} selectedValues={['learning']} onChange={() => undefined} />
      <SortControl value="title" options={[{ value: 'title', label: 'Title' }]} onChange={() => undefined} />
      <ViewToggle value="cards" onChange={() => undefined} />
    </>);
    expect(html).toContain('Summary metrics');
    expect(html).toContain('Projects');
    expect(html).toContain('Learning');
    expect(html).toContain('Sort by');
    expect(html).toContain('aria-label="View"');
  });

  it('renders a thin Fluent table with stable row IDs and empty state', () => {
    const columns = [{ id: 'title', header: 'Title', renderCell: (item: { id: string; title: string }) => item.title }];
    const html = render(<EntityTable items={[{ id: 'one', title: 'First' }]} columns={columns} getRowId={(item) => item.id} selectedRowId="one" onRowSelect={() => undefined} />);
    expect(html).toContain('data-row-id="one"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('First');
    expect(render(<EntityTable items={[]} columns={columns} getRowId={(item) => item.id} emptyState="Nothing here" />)).toContain('Nothing here');
  });

  it('renders deterministic UTC freshness metadata', () => {
    const html = render(<FreshnessStamp verifiedAt="2026-09-04T23:30:00-07:00" locale="en" state="current" />);
    expect(html).toContain('dateTime="2026-09-05T06:30:00.000Z"');
    expect(html).toContain('Verified');
    expect(html).toContain('Current');
  });

  it('composes card and table catalog modes without owning domain data', () => {
    const items = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Beta' }];
    const cards = render(
      <CatalogView
        items={items}
        getItemId={(item) => item.id}
        renderCard={(item) => <EntityCard entityId={item.id} title={item.title} />}
        query=""
        onQueryChange={() => undefined}
      />
    );
    expect(cards).toContain('2 results');
    expect(cards).toContain('data-entity-id="a"');
    const table = render(
      <CatalogView
        items={items}
        getItemId={(item) => item.id}
        renderCard={(item) => item.title}
        renderTable={(rows) => <div data-testid="dense-table">{rows.length}</div>}
        view="table"
        query=""
        onQueryChange={() => undefined}
      />
    );
    expect(table).toContain('data-testid="dense-table"');
  });
});
