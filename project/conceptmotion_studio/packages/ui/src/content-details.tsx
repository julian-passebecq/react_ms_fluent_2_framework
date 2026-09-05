import type { DetailsHTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from './internal';

export interface ContentDetailsProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  summary?: ReactNode;
}

/** Audit metadata is available on demand; required attribution belongs outside. */
export function ContentDetails({ summary = 'Details & sources', children, className, ...rest }: ContentDetailsProps) {
  return <details className={mergeClassNames('dp-content-details', className)} {...rest}>
    <summary>{summary}</summary>
    <div className="dp-content-details__body">{children}</div>
  </details>;
}
