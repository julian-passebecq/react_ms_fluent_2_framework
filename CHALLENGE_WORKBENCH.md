# Challenge Workbench — v1 contract

## Purpose

Create a reusable LeetCode-like learning interface for data/BI/cloud/programming practice without turning ConceptMotion into a code-execution platform.

The user already has a working trainer, but its problem text, animation, editor, source data, execution output and auxiliary material compete for attention. The new surface uses **progressive disclosure**.

## Primary layout

Desktop default:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Problems   SQL > Joins > Cross join        1 / 3     Flag      Mastered │
├────────────────────────────────┬─────────────────────────────────────────┤
│ Description  Visualize  Hints  │ Code    Solution    Compare            │
│                                │                                         │
│ Problem                        │ Monaco draft                            │
│ concise concept                │                                         │
│ schema / input                 │                                         │
│ task                           │                                         │
│ expected-output contract       │                                         │
├────────────────────────────────┴─────────────────────────────────────────┤
│ Optional source data / note / expected output                           │
└──────────────────────────────────────────────────────────────────────────┘
```

Mobile may stack panes; preserve the tab model.

## Progressive disclosure

Initial view:

- left = `Description`
- right = `Code`

Learner may opt into:

- `Visualize` — replace left content with the ConceptMotion scene;
- `Hints` — reveal one hint at a time;
- `Solution` — show reference solution;
- `Compare` — Monaco diff between learner draft and reference solution.

Do not permanently show the animation and the complete solution beside the problem.

## V1 capabilities

Required:

- problem list/catalog with search and filters;
- topic, domain, difficulty and language tags;
- previous/next challenge navigation;
- problem description, schema/input and task;
- optional ConceptMotion scene reference;
- Monaco draft editor;
- local draft persistence keyed by challenge + language variant;
- reset starter code;
- reveal solution;
- compare/diff;
- hints;
- expected output or expected structural result;
- flag / mastered / review state persisted locally;
- explicit `No runtime execution` wording where needed;
- syntax highlighting for all supported text modes where Monaco supports it;
- only modest static syntax assistance; never imply semantic correctness.

## Languages / technologies

The data model must allow, but not require, variants for:

- SQL generic;
- T-SQL;
- BigQuery GoogleSQL;
- Python;
- Pandas;
- PySpark;
- DAX;
- C# / Tabular Editor scripting;
- PowerShell;
- Bash / Linux shell.

A challenge should not be duplicated just because it has multiple implementation languages. Prefer one concept with variants.

Example:

```text
Concept: deduplication
Variants: T-SQL | BigQuery | Pandas | PySpark
```

## Suggested challenge model

```ts
type Challenge = {
  id: string;
  title: LocalizedText;
  domain: string;
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: LocalizedText;
  schema?: unknown;
  input?: unknown;
  expectedOutput?: unknown;
  hints?: LocalizedText[];
  visualSceneId?: string;
  variants: Record<string, {
    starter: string;
    solution: string;
    explanation?: LocalizedText;
    languageId?: string;
  }>;
};
```


## Human-language localization

The shared shell supports EN/NO, but Challenge Workbench does not need a translation for every challenge in v1.

Use the `LocalizedText` compatibility shape from `I18N_AND_LANGUAGE.md` for title/description/hints/explanations where translations exist. Plain strings remain valid legacy/default content.

The locale toggle may be hidden for an English-only challenge experience. Code and technical identifiers never change with human-language locale.

## Editor policy

Use Monaco for the future shared Challenge Workbench because V1 needs:

- normal editor;
- read-only reference model;
- diff editor;
- multiple language models;
- markers/decorations later.

Do not add a universal code runner.

### Allowed diagnostics

Only provide diagnostics that can be supported safely in-browser or by a parser/language service already present. Examples:

- bracket/quote balance;
- indentation guides;
- tokenizer/parser markers when available;
- obvious static formatting issues.

Do not show a green "correct" state unless a future real validator exists for that challenge.

## Problem catalog

Use a FabricStack/LeetCode-like compact catalog rather than a marketing card wall.

Useful filters:

- domain;
- concept/topic;
- language;
- difficulty;
- status (`new`, `in progress`, `mastered`, `flagged`).

## ConceptMotion integration

The visual is an optional teacher.

Examples:

- join: source keys -> match -> fan-out/result rows;
- window: partition -> sort -> window frame -> row number/rank;
- groupby: rows physically collect into groups;
- loop: code line + pointer + variables;
- SCD2: close old row -> emit new current row;
- DAG: queued -> running -> failure -> retry -> success.

The `visualSceneId` should reference reusable library content, not embed a one-off React component in the challenge.

## Reference archive lessons

From the user-supplied ZillaCode and LeetCode-like archives, retain the useful product ideas:

- split challenge/editor workspace;
- problem list and topic filters;
- local draft persistence;
- flag/progress state;
- starter code and reference solution;
- previous/next navigation.

Do **not** inherit the expensive runtime architecture (database/Spark Lambdas, remote judge, terminal) or the mixed UI stack. The new implementation should remain Fluent + Monaco + ConceptMotion.

## Paid course material policy

The supplied SQL/Jupyter training archives are private reference material from a paid course. Do not copy course prose/notebooks verbatim into a public repository unless the user later confirms redistribution rights. Use the underlying concepts to create original exercises and original visual explanations.
