import { Link } from '@fluentui/react-components';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { mergeClassNames } from './internal';
import { PageHeader } from './shell';
import type { PageHeaderProps } from './shell';

export interface KnowledgeShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  header?: ReactNode;
  navigation: ReactNode;
  article: ReactNode;
  onThisPage?: ReactNode;
  changePanel?: ReactNode;
  navigationLabel?: string;
  articleLabel?: string;
  contextLabel?: string;
}

export function KnowledgeShell({
  header,
  navigation,
  article,
  onThisPage,
  changePanel,
  navigationLabel = 'Documentation navigation',
  articleLabel = 'Knowledge article',
  contextLabel = 'On this page and source status',
  className,
  ...rest
}: KnowledgeShellProps) {
  return (
    <div
      className={mergeClassNames('dp-knowledge-shell', className)}
      data-has-context={onThisPage ? 'true' : 'false'}
      {...rest}
    >
      {header ? <div className="dp-knowledge-shell__header">{header}</div> : null}
      <aside className="dp-knowledge-shell__navigation" aria-label={navigationLabel}>
        {navigation}
      </aside>
      <article className="dp-knowledge-shell__article" aria-label={articleLabel}>
        {article}
        {changePanel ? <div className="dp-knowledge-shell__change">{changePanel}</div> : null}
      </article>
      {onThisPage ? (
        <aside className="dp-knowledge-shell__context" aria-label={contextLabel}>
          {onThisPage}
        </aside>
      ) : null}
    </div>
  );
}

export interface DocsNavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  label?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function DocsNavigation({
  title = 'Documentation',
  label = 'Documentation sections',
  children,
  footer,
  className,
  ...rest
}: DocsNavigationProps) {
  const titleId = useId();
  return (
    <nav
      className={mergeClassNames('dp-docs-navigation', className)}
      aria-label={label}
      aria-labelledby={titleId}
      {...rest}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="dp-docs-navigation__content">{children}</div>
      {footer ? <div className="dp-docs-navigation__footer">{footer}</div> : null}
    </nav>
  );
}

export interface OnThisPageProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  label?: string;
  children: ReactNode;
  metadata?: ReactNode;
}

export function OnThisPage({
  title = 'On this page',
  label = 'Article sections',
  children,
  metadata,
  className,
  ...rest
}: OnThisPageProps) {
  const titleId = useId();
  return (
    <nav
      className={mergeClassNames('dp-on-this-page', className)}
      aria-label={label}
      aria-labelledby={titleId}
      {...rest}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="dp-on-this-page__content">{children}</div>
      {metadata ? <div className="dp-on-this-page__metadata">{metadata}</div> : null}
    </nav>
  );
}

export interface KnowledgeHeaderProps extends Omit<PageHeaderProps, 'metadata'> {
  status?: ReactNode;
  version?: ReactNode;
  freshness?: ReactNode;
  verifiedAt?: ReactNode;
  verifiedLabel?: ReactNode;
  metadata?: ReactNode;
}

export function KnowledgeHeader({
  status,
  version,
  freshness,
  verifiedAt,
  verifiedLabel = 'Verified',
  metadata,
  ...rest
}: KnowledgeHeaderProps) {
  const combinedMetadata = status || version || freshness || verifiedAt || metadata ? (
    <div className="dp-knowledge-header__metadata">
      {status}
      {version}
      {freshness}
      {verifiedAt ? <span>{verifiedLabel}: {verifiedAt}</span> : null}
      {metadata}
    </div>
  ) : undefined;
  return <PageHeader metadata={combinedMetadata} {...rest} />;
}

export interface OfficialLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  externalLabel?: string;
}

export function OfficialLink({
  href,
  children,
  externalLabel = 'opens in a new tab',
  className,
  target = '_blank',
  rel = 'noreferrer noopener',
  ...rest
}: OfficialLinkProps) {
  return (
    <Link
      className={mergeClassNames('dp-official-link', className)}
      href={href}
      target={target}
      rel={rel}
      {...rest}
    >
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="dp-visually-hidden"> ({externalLabel})</span>
    </Link>
  );
}

export interface SourceListItem {
  id: string;
  title: ReactNode;
  href: string;
  publisher?: ReactNode;
  detail?: ReactNode;
  authority?: ReactNode;
}

export interface SourceListProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  sources: readonly SourceListItem[];
  emptyMessage?: ReactNode;
}

export function SourceList({
  title = 'Sources',
  sources,
  emptyMessage = 'No sources listed.',
  className,
  ...rest
}: SourceListProps) {
  const titleId = useId();
  return (
    <section
      className={mergeClassNames('dp-source-list', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <h2 id={titleId}>{title}</h2>
      {sources.length ? (
        <ul>
          {sources.map((source) => (
            <li key={source.id}>
              <OfficialLink href={source.href}>{source.title}</OfficialLink>
              {source.publisher || source.authority || source.detail ? (
                <div className="dp-source-list__meta">
                  {[source.publisher, source.authority, source.detail]
                    .filter((value) => value !== null && value !== undefined && value !== false)
                    .map((value, index) => <span key={index}>{value}</span>)}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="dp-source-list__empty">{emptyMessage}</div>
      )}
    </section>
  );
}

export interface RelatedKnowledgeProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  children: ReactNode;
}

export function RelatedKnowledge({
  title = 'Related knowledge',
  children,
  className,
  ...rest
}: RelatedKnowledgeProps) {
  const titleId = useId();
  return (
    <section
      className={mergeClassNames('dp-related-knowledge', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <h2 id={titleId}>{title}</h2>
      <div className="dp-related-knowledge__content">{children}</div>
    </section>
  );
}
