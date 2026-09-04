export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
  readonly severity: ValidationSeverity;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export function createValidationResult(issues: readonly ValidationIssue[]): ValidationResult {
  const stableIssues = [...issues].sort((left, right) =>
    left.path.localeCompare(right.path) || left.code.localeCompare(right.code) || left.message.localeCompare(right.message)
  );
  return {
    valid: !stableIssues.some((issue) => issue.severity === 'error'),
    issues: stableIssues
  };
}

export function validationError(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message, severity: 'error' };
}

export function validationWarning(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message, severity: 'warning' };
}

export function formatValidationIssues(result: ValidationResult): string {
  return result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
}
