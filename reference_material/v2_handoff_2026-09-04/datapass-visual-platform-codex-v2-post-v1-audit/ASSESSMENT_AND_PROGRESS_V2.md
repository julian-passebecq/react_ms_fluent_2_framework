# Assessment and progress V2

## Goal

Reuse the learning state already proven by Challenge Workbench for QCM, mock-exam, interview and course review modes.

## Required contracts

```ts
interface AssessmentSpec {
  id: string;
  title: LocalizedText;
  mode: 'practice' | 'mock-exam' | 'interview';
  questionIds: string[];
  durationSeconds?: number;
  passingScore?: number;
  tags?: string[];
  conceptIds?: string[];
}

type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'ordering'
  | 'matching'
  | 'code-choice'
  | 'figure-choice';
```

Question metadata should support:

- prompt;
- options/items;
- correct answer/ordering/matching;
- explanation;
- concept/domain/difficulty;
- optional Figure reference;
- optional source/knowledge references.

## Shared progress store

Do not create a second storage system unrelated to Challenge.

Provide a versioned local store abstraction supporting at least:

- challenge drafts/status;
- mastered/review/flagged state;
- course lesson completion/recent position;
- assessment attempts;
- answers/scores;
- domain/concept breakdown;
- JSON export/import.

Migration from the existing `datapass:challenge-*` v1.1 keys must be deterministic and preserve data.

## Practice behavior

Practice mode may show immediate feedback and explanation.

## Mock exam behavior

Mock exam must withhold correctness/explanations until completion or explicit submit.

## Interview behavior

Interview mode may mix conceptual, code and architecture/figure questions. It does not need voice recording or AI scoring in V2.

## Dubreu usage

Use Assessment for:

- end-of-lesson SQL checks;
- Python concept review;
- PySpark conceptual review without executing Spark;
- later certification/interview packs.

Demo questions must be original/synthetic. Do not ship copied certification dumps.
