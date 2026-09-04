# AI authoring contract

## Step 1 — define the invariant

Before writing frames, state what must become obvious by the final frame.

Examples:

- LEFT JOIN: every left row is preserved; unmatched right fields are NULL.
- rolling ROWS frame: the base rows remain; only frame membership changes.
- Spark shuffle: equal target keys become co-located after network redistribution.
- SCD2: historical intervals do not overlap and exactly one row is current.
- DAG readiness: a task becomes runnable only when its trigger/dependency condition is satisfied.

## Step 2 — choose a surface

Use **Storyboard** if time/causality matters.

Use **Interactive diagram** if a learner benefits from manipulating one or more parameters.

Use **Paper/handwritten sheet** for formula + architecture + when-to-use + recall.

Use **Cross-language sheet** when semantics stay constant and syntax changes.

## Step 3 — choose an existing renderer

Do not add a renderer until several concepts can share its state vocabulary.

## Step 4 — assign stable IDs

Never key a moving row only by current index.

## Step 5 — one conceptual change per frame

Good frame:

> “Jan leaves because the frame allows only two preceding rows.”

Weak frame:

> “Step 4.”

## Step 6 — synchronize code causality

`codeFocus` should highlight the line(s) responsible for the current visible operation, not merely the nearest-looking code.

## Step 7 — ensure static comprehensibility

Every frame must explain itself with animation disabled.

## Step 8 — verify the final invariant

Do not ship an algorithm scene that stops before completion unless the title clearly says it demonstrates only one pass/phase.

## Suggested scene QA questions

- Can the learner identify what changed in under 2 seconds?
- Is motion showing causality or merely decoration?
- Can the same renderer explain at least 3 related concepts?
- Does the caption explain *why*?
- Does the code highlight match the operation?
- Is the final state correct?
- Are engine-specific details labeled as engine-specific?
