import { Badge } from '@fluentui/react-components';
import type { HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { mergeClassNames } from './internal';

export type StatusTone = 'neutral' | 'informative' | 'success' | 'warning' | 'danger';

export interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  label: ReactNode;
  tone?: StatusTone;
}

export function StatusBadge({ label, tone = 'neutral', className, ...rest }: StatusBadgeProps) {
  return (
    <Badge
      appearance="outline"
      size="small"
      className={mergeClassNames('dp-status-badge', className)}
      data-tone={tone}
      {...rest}
    >
      {label}
    </Badge>
  );
}

export type ProductStatus = 'ga' | 'preview' | 'deprecated' | 'retired' | 'unknown';

const productStatusPresentation: Record<ProductStatus, { label: string; tone: StatusTone }> = {
  ga: { label: 'GA', tone: 'success' },
  preview: { label: 'Preview', tone: 'informative' },
  deprecated: { label: 'Deprecated', tone: 'warning' },
  retired: { label: 'Retired', tone: 'danger' },
  unknown: { label: 'Status unknown', tone: 'neutral' },
};

export interface FeatureStatusBadgeProps extends Omit<StatusBadgeProps, 'label' | 'tone'> {
  status: ProductStatus;
  labels?: Partial<Record<ProductStatus, string>>;
}

export function FeatureStatusBadge({ status, labels, ...rest }: FeatureStatusBadgeProps) {
  const presentation = productStatusPresentation[status];
  return (
    <StatusBadge
      label={labels?.[status] ?? presentation.label}
      tone={presentation.tone}
      {...rest}
    />
  );
}

export interface VersionBadgeProps extends Omit<StatusBadgeProps, 'label' | 'tone' | 'prefix'> {
  version: ReactNode;
  prefix?: ReactNode;
}

export function VersionBadge({ version, prefix = 'Version', ...rest }: VersionBadgeProps) {
  return <StatusBadge label={<>{prefix} {version}</>} tone="neutral" {...rest} />;
}

export type FreshnessState = 'current' | 'needs-review' | 'stale' | 'unknown';

const freshnessPresentation: Record<FreshnessState, { label: string; tone: StatusTone }> = {
  current: { label: 'Current', tone: 'success' },
  'needs-review': { label: 'Needs review', tone: 'warning' },
  stale: { label: 'Stale', tone: 'danger' },
  unknown: { label: 'Freshness unknown', tone: 'neutral' },
};

export interface FreshnessBadgeProps extends Omit<StatusBadgeProps, 'label' | 'tone'> {
  state: FreshnessState;
  labels?: Partial<Record<FreshnessState, string>>;
}

export function FreshnessBadge({ state, labels, ...rest }: FreshnessBadgeProps) {
  const presentation = freshnessPresentation[state];
  return (
    <StatusBadge label={labels?.[state] ?? presentation.label} tone={presentation.tone} {...rest} />
  );
}

export interface ChangeImpactPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  summary: ReactNode;
  impactedItems?: readonly ReactNode[];
  action?: ReactNode;
  tone?: Extract<StatusTone, 'informative' | 'warning' | 'danger'>;
}

export function ChangeImpactPanel({
  title = 'What changed',
  summary,
  impactedItems,
  action,
  tone = 'warning',
  className,
  ...rest
}: ChangeImpactPanelProps) {
  const titleId = useId();
  return (
    <section
      className={mergeClassNames('dp-change-impact-panel', className)}
      data-tone={tone}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="dp-change-impact-panel__body">
        <h2 id={titleId}>{title}</h2>
        <div className="dp-change-impact-panel__summary">{summary}</div>
        {impactedItems?.length ? (
          <ul>
            {impactedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {action ? <div className="dp-change-impact-panel__action">{action}</div> : null}
    </section>
  );
}
