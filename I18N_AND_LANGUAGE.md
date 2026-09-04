# EN/NO language infrastructure

## Decision

Include lightweight bilingual infrastructure in Foundation v1.1.

The user likes the compact Norwegian/English switch used in the portfolio and wants future learning/professional sites to be able to reuse it. This is small enough to establish now, provided we do NOT turn v1 into a translation project.

## Supported locales in v1

- `en`
- `no`

Use `no` for the application locale identifier unless the existing project already has a strong reason to use `nb` internally. If `nb` is used internally, document the mapping clearly and keep the public API consistent.

## Required API shape

Conceptually:

```ts
type Locale = 'en' | 'no';
type LocalizedText = string | Partial<Record<Locale, string>>;
```

Provide helpers such as:

```ts
resolveLocalizedText(value, locale)
```

Fallback order:

1. requested locale;
2. English;
3. first available translation;
4. empty string.

## Application layer

Implement a locale provider with:

- current locale;
- setter;
- localStorage persistence;
- compact toggle component;
- common UI labels in both languages.

Common strings worth translating in v1:

- Catalog / Katalog;
- Workbench / Arbeidsflate (or another concise project-approved term);
- Description / Beskrivelse;
- Visualize / Visualiser;
- Hints / Hint;
- Solution / Losning;
- Compare / Sammenlign;
- Search / Sok;
- Source / Kilde;
- Play / Spill;
- Pause / Pause;
- Previous / Forrige;
- Next / Neste;
- Reset / Tilbakestill;
- Copy / Kopier;
- Inspector / Detaljer;
- Run state labels where a natural Norwegian equivalent is supplied.

Use normal Unicode/Norwegian spelling in product source; this handoff text avoids depending on exact copy decisions. Codex may use proper Norwegian characters in the implementation.

## Per-page visibility

The language switch must be configurable.

Examples:

- Portfolio-like professional shell: show it.
- ConceptMotion learning article with Norwegian content: show it.
- English-only LeetCode challenge: it may be hidden.
- Challenge with translated explanation but identical code: show it.

Do not force a useless toggle into every page.

## Challenge content

A challenge may define:

```ts
{
  title: { en: 'Latest order per customer', no: '...' },
  description: { en: '...', no: '...' },
  starterCode: { sql: '...' }
}
```

Code variants are language/runtime variants, not human-language translations.

Never translate:

- SQL keywords;
- Python syntax;
- function names;
- identifiers;
- technology names;
- code comments unless a challenge explicitly provides localized comment text.

## Scene/workflow content

Scene labels, annotations and explanatory text may use `LocalizedText` where it is inexpensive.

Do not force every existing scene to migrate immediately. Provide a compatibility resolver that treats a plain string as language-neutral/default content.

## Testing

At minimum verify:

- locale persistence;
- English fallback;
- toggle updates shared application chrome;
- a page can hide the toggle;
- plain-string legacy content still renders;
- code content is unaffected by locale changes.
