import type {
  LicenseInfo,
  LocalizedText,
  NotebookSpec,
} from '@datapass/content';

export const NOTEBOOK_IMPORTER_VERSION = '2.0.0' as const;

export type NotebookImportSeverity = 'error' | 'warning';

export interface NotebookImportIssue {
  readonly code: string;
  readonly severity: NotebookImportSeverity;
  readonly message: string;
  readonly path: string;
  readonly sourceFile: string;
  readonly cellIndex?: number;
  readonly cellId?: string;
  readonly mimeType?: string;
}

export interface ImportedMediaAsset {
  /** Deterministic application-relative output path. */
  readonly path: string;
  readonly mimeType: string;
  readonly sha256: string;
  readonly byteLength: number;
  /** Canonical base64 payload; the pure importer does not write to disk. */
  readonly contentBase64: string;
}

export interface NotebookImportOptions {
  readonly sourceFile: string;
  readonly id?: string;
  readonly title?: LocalizedText;
  readonly sourceId?: string;
  readonly attribution?: LocalizedText;
  readonly license?: LicenseInfo;
  /** Optional deterministic build metadata. The importer never reads the wall clock. */
  readonly importedAt?: string;
  readonly defaultLanguage?: string;
  readonly codeEditable?: boolean;
  readonly codeExecution?: 'none' | 'external' | 'browser';
  readonly runtimeTargetIds?: readonly string[];
  readonly mediaBasePath?: string;
  /** Optional caller-supplied local files; no filesystem access occurs in the importer. */
  readonly localMedia?: readonly NotebookLocalMediaInput[];
}

export interface NotebookLocalMediaInput {
  readonly sourcePath: string;
  readonly mimeType: string;
  readonly contentBase64: string;
}

export interface NotebookImportResult {
  readonly ok: boolean;
  readonly notebook?: NotebookSpec;
  readonly media: readonly ImportedMediaAsset[];
  readonly issues: readonly NotebookImportIssue[];
}

export type DeepnoteSqlExtractionStatus = 'extracted' | 'not-wrapper' | 'ambiguous';

export interface DeepnoteSqlExtraction {
  readonly status: DeepnoteSqlExtractionStatus;
  readonly originalSource: string;
  readonly sql?: string;
  readonly referencedPaths: readonly string[];
  readonly reason?: string;
}
