import { Button, Card, Text } from '@fluentui/react-components';
import type { RuntimeTarget } from '@datapass/content';
import { useId, type ReactNode } from 'react';
import { resolveLearningText, type LearningLocale } from './localization';

export interface RuntimeTargetValidation {
  readonly valid: boolean;
  readonly href?: string;
  readonly issues: readonly string[];
}

function isSafeDownloadPath(path: string): boolean {
  const value = path.trim();
  if (!value || value.includes('\\') || value.includes('\0') || value.startsWith('//')) return false;
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return false;
  try {
    const pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    return !pathname.split('/').some((segment) => segment === '..');
  } catch {
    return false;
  }
}

function validateHttpsUrl(source: string): string | undefined {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/**
 * Validates one explicitly configured launch target. This function never combines a
 * lesson-provided path with a provider base URL.
 */
export function validateRuntimeTarget(target: RuntimeTarget): RuntimeTargetValidation {
  const issues: string[] = [];
  if (!target.id.trim()) issues.push('Runtime target ID must be non-empty.');

  if (target.kind === 'download') {
    if (!target.downloadPath || !isSafeDownloadPath(target.downloadPath)) {
      issues.push('Download targets require a safe local or repository-relative path.');
    }
    if (target.url) issues.push('Download targets must use downloadPath rather than url.');
    if (target.executesExternally) issues.push('A download target cannot claim external execution.');
    return {
      valid: issues.length === 0,
      ...(issues.length === 0 ? { href: target.downloadPath!.trim() } : {}),
      issues,
    };
  }

  if (target.downloadPath) issues.push('External runtime targets must use url rather than downloadPath.');
  const href = target.url ? validateHttpsUrl(target.url) : undefined;
  if (!href) issues.push('External runtime targets require an absolute HTTPS URL without credentials.');
  return { valid: issues.length === 0, ...(issues.length === 0 ? { href } : {}), issues };
}

export interface RuntimeLauncherProps {
  readonly targets: readonly RuntimeTarget[];
  readonly locale?: LearningLocale;
  readonly title?: ReactNode;
  readonly emptyState?: ReactNode;
  readonly className?: string;
}

export function RuntimeLauncher({
  targets,
  locale = 'en',
  title = 'Continue in a configured runtime',
  emptyState = 'No runtime target is configured for this lesson.',
  className,
}: RuntimeLauncherProps) {
  const titleId = useId();
  if (targets.length === 0) {
    return <div className={className ?? 'dp-runtime-launcher'} data-runtime-count="0">{emptyState}</div>;
  }

  return (
    <section className={className ?? 'dp-runtime-launcher'} aria-labelledby={titleId}>
      <header className="dp-runtime-launcher__header">
        <h2 id={titleId}>{title}</h2>
        <Text size={200}>Nothing runs in this site. Only the configured destinations below can be opened.</Text>
      </header>
      <div className="dp-runtime-launcher__targets">
        {targets.map((target) => {
          const validation = validateRuntimeTarget(target);
          const label = resolveLearningText(target.label, locale);
          const description = target.description ? resolveLearningText(target.description, locale) : undefined;
          if (!validation.valid || !validation.href) {
            return (
              <Card key={target.id || label} className="dp-runtime-target" data-runtime-rejected="true">
                <strong>{label || 'Unavailable runtime target'}</strong>
                <Text size={200}>This target is unavailable because its configured destination is unsafe or incomplete.</Text>
                <ul>{validation.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
              </Card>
            );
          }
          const isDownload = target.kind === 'download';
          return (
            <Card
              key={target.id}
              className="dp-runtime-target"
              data-runtime-id={target.id}
              data-executes-externally={target.executesExternally ? 'true' : 'false'}
            >
              <div>
                <strong>{label}</strong>
                {description ? <p>{description}</p> : null}
                <Text size={200}>
                  {isDownload
                    ? 'Downloads the configured artifact; it is not executed here.'
                    : target.executesExternally
                      ? 'Opens a separate service. Any execution happens there, under that service’s controls.'
                      : 'Opens configured external guidance. Nothing is executed here.'}
                </Text>
              </div>
              {target.runtimeRequirements?.length ? (
                <ul className="dp-runtime-target__requirements">
                  {target.runtimeRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
                </ul>
              ) : null}
              <Button
                as="a"
                appearance="primary"
                href={validation.href}
                {...(isDownload
                  ? { download: '' }
                  : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {isDownload ? `Download ${label}` : `Open ${label}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
