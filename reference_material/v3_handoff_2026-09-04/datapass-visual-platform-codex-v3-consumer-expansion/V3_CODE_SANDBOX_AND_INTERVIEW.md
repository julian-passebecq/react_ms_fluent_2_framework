# Code Sandbox and Code Interview — separate V3 products

## Source reference

Read-only source repo: `julian-passebecq/leetcodedataeng`.

Current source app reports 323 distinct practice items, 24 curriculum tracks, 60 SQL challenge concepts with dialect variants, 24 multi-engine challenges, 28 Python syntax drills, 19 interactive scene families and 15 classical algorithm drills.

Preserve its pedagogy and corpus. Do not copy its old UI/renderers into the new framework consumers.

# Code Sandbox

## Product role

Large practice workspace for data engineering / analytics coding.

Primary top-level navigation:

- Learn
- Practice
- Cheat Sheets
- Progress

Interview-specific sessions live in Code Interview, not here.

## Practice catalog

Dense/searchable catalog inspired by the user's PySpark-practice reference:

- search;
- difficulty;
- domain/track;
- language/engine;
- tags;
- status/mastery/review;
- quick filters;
- cards/table toggle when useful;
- URL-backed state.

Selecting an item opens the existing Challenge Workbench composition:

```text
Description | Visualize | Hints | Notes
                     ↕
                  Figure

Code | Solution | Compare
          Monaco
```

No fake universal judge. Preserve local drafts, solution compare, progress/flags/mastery, JSON backup, language variants and source/attribution metadata.

## Content migration

Prefer a deterministic adapter from the source trainer data to a shared Challenge/Practice contract. Do not manually rewrite hundreds of exercises.

If source access is available, target preservation of the full 323-item corpus and stable IDs/titles. Record any exclusions with a machine-readable reason. Preserve THIRD_PARTY_NOTICES-equivalent attribution.

V3 may add a serializable `ChallengeSpec`/`PracticeItem` contract to `@datapass/content` if required. Move the current Studio-only `ChallengeDefinition` semantics into shared content rather than inventing a second model.

# Code Interview

## Product role

Focused interview training, not a second challenge catalog.

Use reusable Assessment/Progress/Figure/code surfaces.

Suggested modes:

- Quick 10–15 min
- Focused 30 min
- Mock interview
- Domain pack
- Review mistakes

Suggested domains:

- SQL
- Python
- pandas
- PySpark
- data engineering
- storage/performance
- orchestration
- cloud architecture
- BI/DAX

A useful session shape mirrors the user's preferred practice pattern:

1. concept question;
2. syntax/trick question;
3. small coding/application question;
4. data-engineering/system scenario.

Support timer where appropriate, flag/review, explanation after submission, progress by domain and optional figures. No remote execution dependency.
