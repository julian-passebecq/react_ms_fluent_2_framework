# Storybook Golden Gallery

## Goal

Make approved components and visual states discoverable by humans and coding agents so future apps reuse existing work rather than regenerate near-duplicates.

## Required stories

At minimum:

- AppShell / TopBar / SideNav;
- Catalog shell + search/filter + entity card/metrics;
- FigureFrame + text fallback;
- ConceptMotion table filter/sort;
- join visualization;
- loop visualization;
- regression visualization;
- diagram/lineage;
- workflow topology/run;
- Challenge default/hints/solution/diff;
- shared CodeEditor/CodeDiff;
- Notebook lesson with markdown/code/output/Figure;
- Assessment question/result;
- Knowledge article with source/freshness;
- Project Hub card/table state;
- EN/NO toggle;
- reduced-motion state;
- mobile-width examples.

## Rules

- stories use production components, not mock clones;
- no production runtime depends on Storybook;
- keep stories deterministic;
- use stable fixtures;
- add accessibility checks where practical;
- visual snapshots should cover a small canonical set, not every permutation.

## Golden Gallery

Also expose a small in-app/developer gallery or Storybook grouping of about 20–30 canonical surfaces. This becomes the reference for future AI-generated sites.
