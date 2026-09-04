import { Badge } from '@fluentui/react-components';
import type { HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { mergeClassNames } from './internal';

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export interface CodeDiagnostic {
  id?: string;
  severity: DiagnosticSeverity;
  message: string;
  code?: string;
  source?: string;
  line?: number;
  column?: number;
  detail?: ReactNode;
}

export interface CodeDiagnosticsProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  diagnostics?: readonly CodeDiagnostic[] | null;
  title?: ReactNode;
  emptyState?: never;
}

export function CodeDiagnostics({
  diagnostics,
  title = 'Diagnostics',
  className,
  ...rest
}: CodeDiagnosticsProps) {
  const titleId = useId();
  if (!diagnostics?.length) return null;

  return (
    <section
      className={mergeClassNames('dp-code-diagnostics', className)}
      aria-labelledby={titleId}
      aria-live="polite"
      {...rest}
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <Badge appearance="outline" size="small">
          {diagnostics.length}
        </Badge>
      </header>
      <ul>
        {diagnostics.map((diagnostic, index) => {
          const location = diagnostic.line
            ? `Line ${diagnostic.line}${diagnostic.column ? `, column ${diagnostic.column}` : ''}`
            : undefined;
          return (
            <li
              key={diagnostic.id ?? `${diagnostic.code ?? diagnostic.severity}-${index}`}
              data-severity={diagnostic.severity}
            >
              <StatusLabel severity={diagnostic.severity} />
              <div>
                <div className="dp-code-diagnostics__message">{diagnostic.message}</div>
                {location || diagnostic.code || diagnostic.source ? (
                  <div className="dp-code-diagnostics__meta">
                    {[location, diagnostic.code, diagnostic.source].filter(Boolean).join(' · ')}
                  </div>
                ) : null}
                {diagnostic.detail ? (
                  <div className="dp-code-diagnostics__detail">{diagnostic.detail}</div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="dp-code-diagnostics__disclaimer">
        Static diagnostics do not prove semantic correctness.
      </p>
    </section>
  );
}

function StatusLabel({ severity }: { severity: DiagnosticSeverity }) {
  return (
    <Badge appearance="outline" size="small" className="dp-code-diagnostics__severity" data-tone={severity}>
      {severity}
    </Badge>
  );
}
