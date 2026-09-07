# CEO / Product & UX packet — required deliverable

The CEO role is the user's product/UX liaison. It captures what the user wants the products to feel like and whether the consumers actually deliver that experience.

## Inputs

- direct conversation with the user;
- current deployed consumer sites where available;
- desktop and 390px screenshots for each audited consumer;
- current product copy/navigation/interactive states;
- Project Control state so feedback is not confused with technical promotion status.

## For every consumer audit

Record:
- what the product is trying to help the user do;
- first-impression clarity;
- visual hierarchy and information density;
- navigation and discoverability;
- teaching/explanation clarity;
- usefulness of animation versus distraction;
- control ergonomics: autoplay, pause, step, reset, export, inspect/spec/JSON where relevant;
- desktop versus phone experience;
- consistency with the user's preferred visual language;
- what feels generic/template-like versus intentionally designed;
- what is missing from the user's point of view;
- the top three product changes, independent of implementation difficulty.

## User-preference ledger

Separate each observation into one of four types:

1. `PREFERENCE` — taste/style choice from the user.
2. `USABILITY` — objective interaction/readability/navigation problem.
3. `PRODUCT_GOAL` — capability the product should provide.
4. `TECH_CONSTRAINT` — known implementation/framework limitation, recorded but not decided here.

Do not convert `PREFERENCE` directly into a framework requirement.

## Product principles output

Maintain a short living set of principles supported by actual user feedback/current product evaluation. Examples include educational motion explaining state change rather than decorating trivial syntax; crisp intentional visuals; internal schema/provenance hidden from normal consumer copy; obvious consistent controls; and independent-product quality rather than Storybook-demo quality.

## Screenshot evidence

For every audited consumer capture/index:
- desktop primary screen;
- 390px primary screen;
- one important interactive/visual state;
- one problematic state if applicable.

Record URL, date, viewport, commit/deploy mapping when known, and the feedback each screenshot supports.

## Deliverables

- `CEO_PRODUCT_UX_REPORT.md`
- `USER_PREFERENCE_LEDGER.md`
- `PRODUCT_PRINCIPLES.md`
- `CONSUMER_UX_AUDITS.md`
- `SCREENSHOT_INDEX.md`
- `CEO_PRIORITY_BRIEF_TO_DIRECTOR.md`

For a broad audit package these as `DATAPASS_CEO_PRODUCT_UX_YYYY-MM-DD.zip`.

The CEO does not make framework promotion/merge decisions.
