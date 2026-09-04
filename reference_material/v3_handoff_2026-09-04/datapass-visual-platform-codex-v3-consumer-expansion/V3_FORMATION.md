# Formation — V3

## Product identity

Visible name: **Formation**.

Supporting principle: **Learn with structure. Execute elsewhere.**

Remove “Dubreu” from current product chrome, metadata, screenshots and new docs. Keep source/import provenance IDs where the name identifies the actual training source.

## Information architecture

- Python Course
- SQL Course
- SQL Advanced
- PySpark Course (display/explanation only)
- Practice / Review
- Progress
- Thinking modules

Do not turn Formation into Code Sandbox. Formation is course-first; Code Sandbox is challenge/practice-first.

## “Think in SQL” capstone

Teach the reasoning sequence visually:

```text
business question
  → define output grain (“what is one row?”)
  → choose the base relation / FROM
  → predict join cardinality and row multiplication
  → reduce/filter deliberately
  → choose GROUP BY vs window
  → project/select the final shape
  → validate row counts, duplicates, NULLs and totals
```

Required concepts:

- grain before syntax;
- 1:1, 1:N and N:M joins;
- join multiplication and accidental duplication;
- filtering stage (`WHERE`, `HAVING`, `QUALIFY`);
- aggregation collapses rows; windows retain row detail;
- NULL and three-valued logic;
- incremental debugging/checkpoints;
- explain the logical reasoning order separately from textual SQL clause order.

Use existing semantic table/join/diagram figures wherever possible. Add concise prediction questions: “What does one output row represent?” and “How will this join change row count/grain?”

## “Think in Python for Data Engineering” capstone

Teach a DE mental model rather than language trivia:

```text
input contract
  → validate
  → small deterministic transformations
  → explicit side effects / I/O
  → output contract
  → observe + test
```

Cover:

- list/dict/set/tuple/generator/DataFrame choice;
- generators vs materialization;
- pure transforms vs tangled I/O;
- mutation/shared state;
- composable functions;
- idempotency and retries;
- validation/errors;
- logging row counts/timing/failures;
- empty input, duplicates, NULLs, schema drift;
- local Python/pandas vs SQL/Spark scale boundary.

Use small ConceptMotion/Diagram figures only where they improve the mental model.

## PySpark truthfulness

No in-site Spark execution. Show code, reference output, architecture/partition/shuffle concepts, hints, assessments and external/download launchers only.
