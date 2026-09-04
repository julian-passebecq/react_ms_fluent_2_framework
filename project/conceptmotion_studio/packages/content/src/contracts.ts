import type { JsonPrimitive, JsonValue } from './json';
import type { Locale, LocalizedText } from './localization';

export type ContentId = string;

export interface LicenseInfo {
  readonly id: string;
  readonly name?: string;
  readonly url?: string;
  readonly requiresAttribution?: boolean;
}

export interface ContentSource {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly url?: string;
  readonly attribution?: LocalizedText;
  readonly license?: LicenseInfo;
}

export type FigureKind = 'concept' | 'diagram' | 'workflow' | 'lineage' | 'chart' | 'geo' | 'static';
export type FigureProfile = 'professional' | 'editorial' | 'sketch';

export interface FigureSpec {
  readonly id: ContentId;
  readonly kind: FigureKind;
  readonly rendererId: string;
  readonly title: LocalizedText;
  readonly subtitle?: LocalizedText;
  readonly takeaway?: LocalizedText;
  readonly spec: JsonValue;
  readonly sourceIds?: readonly ContentId[];
  readonly conceptIds?: readonly ContentId[];
  readonly featureIds?: readonly ContentId[];
  readonly verifiedAt?: string;
  readonly status?: string;
  readonly fallbackText: LocalizedText;
  readonly reducedMotionState?: string | number;
  readonly staticState?: string | number;
  readonly profile?: FigureProfile;
}

export type RuntimeTargetKind =
  | 'download'
  | 'colab'
  | 'databricks'
  | 'vscode'
  | 'voila'
  | 'mercury'
  | 'external';
export type RuntimeTargetId = ContentId;

export interface RuntimeTarget {
  readonly id: RuntimeTargetId;
  readonly kind: RuntimeTargetKind;
  readonly label: LocalizedText;
  readonly description?: LocalizedText;
  /** A configured absolute HTTPS URL. Content renderers must not derive arbitrary provider base URLs. */
  readonly url?: string;
  /** A repository-relative or download-route path for an original artifact. */
  readonly downloadPath?: string;
  readonly runtimeRequirements?: readonly string[];
  readonly executesExternally: boolean;
}

export interface NotebookProvenance {
  readonly sourceFile: string;
  readonly sourceSha256: string;
  readonly importerVersion: string;
  readonly notebookFormat: number;
  readonly notebookFormatMinor?: number;
  readonly sourceNotebookId?: string;
  readonly importedAt?: string;
  readonly sourceId?: ContentId;
  readonly attribution?: LocalizedText;
  readonly license?: LicenseInfo;
}

export interface NotebookCellBase {
  readonly id: ContentId;
  readonly sourceCellId?: string;
  readonly sourceIndex?: number;
  readonly tags?: readonly string[];
  readonly sourceHash?: string;
}

export interface MarkdownCell extends NotebookCellBase {
  readonly type: 'markdown';
  readonly markdown: string;
}

export interface CodeCellProvenance {
  readonly originalSource?: string;
  readonly transformation?: 'deepnote-sql';
  readonly resourcePaths?: readonly string[];
}

export interface CodeCell extends NotebookCellBase {
  readonly type: 'code';
  readonly language: string;
  readonly source: string;
  readonly editable?: boolean;
  readonly execution: 'none' | 'external' | 'browser';
  readonly referenceOutputIds?: readonly ContentId[];
  readonly provenance?: CodeCellProvenance;
}

export interface TextOutputCell extends NotebookCellBase {
  readonly type: 'text-output';
  readonly text: string;
  readonly format?: 'plain' | 'markdown';
  readonly source: 'reference';
  readonly isError?: boolean;
}

export interface TableOutputCell extends NotebookCellBase {
  readonly type: 'table-output';
  readonly columns: readonly string[];
  readonly rows: readonly (readonly JsonPrimitive[])[];
  readonly source: 'reference';
}

export interface MediaReference {
  readonly path: string;
  readonly mimeType: string;
  readonly sha256: string;
  readonly byteLength: number;
}

export interface ImageOutputCell extends NotebookCellBase {
  readonly type: 'image-output';
  readonly image: MediaReference;
  readonly alt: LocalizedText;
  readonly source: 'reference';
}

export interface FigureCell extends NotebookCellBase {
  readonly type: 'figure';
  readonly figureId: ContentId;
}

export interface CalloutCell extends NotebookCellBase {
  readonly type: 'callout';
  readonly tone: 'note' | 'tip' | 'warning' | 'important';
  readonly title?: LocalizedText;
  readonly content: LocalizedText;
}

export interface ExerciseCell extends NotebookCellBase {
  readonly type: 'exercise';
  readonly language: string;
  readonly starter: string;
  readonly hints?: readonly LocalizedText[];
  readonly solution?: string;
  readonly explanation?: LocalizedText;
  readonly execution: 'none' | 'external' | 'browser';
  readonly referenceOutputIds?: readonly ContentId[];
}

export type NotebookCell =
  | MarkdownCell
  | CodeCell
  | TextOutputCell
  | TableOutputCell
  | ImageOutputCell
  | FigureCell
  | CalloutCell
  | ExerciseCell;

export interface NotebookSpec {
  readonly id: ContentId;
  readonly title?: LocalizedText;
  readonly language?: string;
  readonly cells: readonly NotebookCell[];
  readonly provenance: NotebookProvenance;
  readonly sourceIds?: readonly ContentId[];
  readonly runtimeTargetIds?: readonly ContentId[];
  readonly metadata?: JsonValue;
}

export interface LessonSpec {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly summary?: LocalizedText;
  readonly objectives?: readonly LocalizedText[];
  readonly conceptIds?: readonly ContentId[];
  readonly notebookId?: ContentId;
  readonly figureIds?: readonly ContentId[];
  readonly challengeIds?: readonly ContentId[];
  readonly assessmentIds?: readonly ContentId[];
  readonly vocabularyTopicIds?: readonly ContentId[];
  readonly sourceIds?: readonly ContentId[];
  readonly runtimeTargetIds?: readonly ContentId[];
}

export interface CourseModule {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly summary?: LocalizedText;
  readonly lessons: readonly LessonSpec[];
}

export interface CourseSpec {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly summary?: LocalizedText;
  readonly modules: readonly CourseModule[];
  readonly sourceIds?: readonly ContentId[];
  readonly tags?: readonly string[];
  readonly runtimeTargetIds?: readonly ContentId[];
}

export type AssessmentMode = 'practice' | 'mock-exam' | 'interview';
export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'ordering'
  | 'matching'
  | 'code-choice'
  | 'figure-choice';
export type QuestionDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionOption {
  readonly id: ContentId;
  readonly label: LocalizedText;
}

export interface CodeQuestionOption extends QuestionOption {
  readonly code: string;
}

export interface FigureQuestionOption extends QuestionOption {
  readonly figureId: ContentId;
}

export interface MatchingPair {
  readonly leftId: ContentId;
  readonly rightId: ContentId;
}

export interface QuestionSpecBase {
  readonly id: ContentId;
  readonly type: QuestionType;
  readonly prompt: LocalizedText;
  readonly explanation?: LocalizedText;
  readonly conceptIds?: readonly ContentId[];
  readonly domain?: string;
  readonly difficulty?: QuestionDifficulty;
  readonly figureId?: ContentId;
  readonly sourceIds?: readonly ContentId[];
  readonly tags?: readonly string[];
}

export interface SingleChoiceQuestion extends QuestionSpecBase {
  readonly type: 'single-choice';
  readonly options: readonly QuestionOption[];
  readonly correctOptionId: ContentId;
}

export interface MultipleChoiceQuestion extends QuestionSpecBase {
  readonly type: 'multiple-choice';
  readonly options: readonly QuestionOption[];
  readonly correctOptionIds: readonly ContentId[];
}

export interface TrueFalseQuestion extends QuestionSpecBase {
  readonly type: 'true-false';
  readonly correct: boolean;
}

export interface OrderingQuestion extends QuestionSpecBase {
  readonly type: 'ordering';
  readonly items: readonly QuestionOption[];
  readonly correctOrderIds: readonly ContentId[];
}

export interface MatchingQuestion extends QuestionSpecBase {
  readonly type: 'matching';
  readonly leftItems: readonly QuestionOption[];
  readonly rightItems: readonly QuestionOption[];
  readonly correctMatches: readonly MatchingPair[];
}

export interface CodeChoiceQuestion extends QuestionSpecBase {
  readonly type: 'code-choice';
  readonly language: string;
  readonly options: readonly CodeQuestionOption[];
  readonly correctOptionId: ContentId;
}

export interface FigureChoiceQuestion extends QuestionSpecBase {
  readonly type: 'figure-choice';
  readonly options: readonly FigureQuestionOption[];
  readonly correctOptionId: ContentId;
}

export type QuestionSpec =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | MatchingQuestion
  | CodeChoiceQuestion
  | FigureChoiceQuestion;

export interface AssessmentSpec {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly mode: AssessmentMode;
  readonly questionIds: readonly ContentId[];
  readonly durationSeconds?: number;
  readonly passingScore?: number;
  readonly tags?: readonly string[];
  readonly conceptIds?: readonly ContentId[];
  readonly sourceIds?: readonly ContentId[];
}

export type ProjectStatus = 'active' | 'experimental' | 'legacy' | 'archived' | 'building' | 'planned';

export interface ProjectRecord {
  readonly id: ContentId;
  readonly title: string;
  readonly summary?: string;
  readonly url: string;
  readonly repository?: string;
  readonly status: ProjectStatus;
  readonly kind: string;
  readonly iconId?: string;
  readonly features?: readonly string[];
  readonly technologies?: readonly string[];
  readonly locales?: readonly string[];
  readonly featured?: boolean;
  readonly order?: number;
  readonly verifiedAt?: string;
  readonly supersededBy?: ContentId;
}

export type AppPreset = 'knowledge' | 'learning' | 'catalog' | 'portfolio-hub';

export interface AppRecipe {
  readonly id: ContentId;
  readonly name: string;
  readonly packageName: string;
  readonly title: LocalizedText;
  readonly preset: AppPreset;
  readonly routes: readonly string[];
  readonly locales?: readonly Locale[];
  readonly features?: readonly string[];
  readonly includeEditor?: boolean;
  readonly projectId?: ContentId;
}

export interface VocabularyEntry {
  readonly id: ContentId;
  readonly lemma: string;
  readonly language: 'no' | 'en' | string;
  readonly translation?: LocalizedText;
  readonly partOfSpeech?: string;
  readonly topicIds?: readonly ContentId[];
  readonly definition?: LocalizedText;
  readonly examples?: readonly LocalizedText[];
  readonly forms?: readonly string[];
  readonly difficulty?: string;
  readonly sourceIds?: readonly ContentId[];
  readonly tags?: readonly string[];
}

export interface VocabularyTopic {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly vocabularyIds: readonly ContentId[];
  readonly figureIds?: readonly ContentId[];
  readonly articleLessonIds?: readonly ContentId[];
  readonly assessmentIds?: readonly ContentId[];
}

export interface ArticleLesson {
  readonly id: ContentId;
  readonly title: LocalizedText;
  readonly sourceIds: readonly ContentId[];
  readonly summary: LocalizedText;
  readonly vocabularyTopicIds?: readonly ContentId[];
  readonly figureIds?: readonly ContentId[];
  readonly assessmentIds?: readonly ContentId[];
  /** Short, lawful excerpts only; full third-party articles do not belong in this contract. */
  readonly excerpts?: readonly LocalizedText[];
}

/**
 * A serializable registry used for validation and deterministic interchange. Optional
 * arrays default to empty during validation; no execution or provider objects belong here.
 */
export interface ContentCatalog {
  readonly version: '2';
  readonly sources?: readonly ContentSource[];
  readonly figures?: readonly FigureSpec[];
  readonly notebooks?: readonly NotebookSpec[];
  readonly courses?: readonly CourseSpec[];
  readonly assessments?: readonly AssessmentSpec[];
  readonly questions?: readonly QuestionSpec[];
  readonly projects?: readonly ProjectRecord[];
  readonly appRecipes?: readonly AppRecipe[];
  readonly runtimeTargets?: readonly RuntimeTarget[];
  readonly vocabularyEntries?: readonly VocabularyEntry[];
  readonly vocabularyTopics?: readonly VocabularyTopic[];
  readonly articleLessons?: readonly ArticleLesson[];
  /** IDs owned by sibling registries but needed for deterministic reference checks. */
  readonly challengeIds?: readonly ContentId[];
}

export type ProjectRegistry = readonly ProjectRecord[];
