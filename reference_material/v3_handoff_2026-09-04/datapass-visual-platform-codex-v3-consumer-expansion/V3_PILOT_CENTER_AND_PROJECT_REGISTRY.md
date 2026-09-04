# Pilot Center + Project Registry — V3

## Product boundary

Pilot Center is a **personal/local command center**, distinct from the professional portfolio at `datapassj.com`.

Do not add news, stocks, Gmail, LinkedIn notifications or Codex usage tracking in V3.

## Core layout

- Overview / project counts/status
- Next actions
- Projects: cards / table / galaxy
- Idea Board / sticky notes
- Tools: Visual Sandbox, ConceptMotion Studio, D3 Studio, direct project links

## Canonical public Project Registry

Move public website metadata to a shared source-controlled file, for example:

`content/projects.registry.json`

Validate it with `@datapass/content`. Project Hub, Pilot Center and Project Galaxy must consume the same records.

Additively extend `ProjectStatus` with `building` and `planned` if needed.

### Privacy rule

The framework repository is public. Do not commit private repository URLs or private annotations to the public registry.

If Pilot Center needs private metadata, support an optional local overlay such as:

`content/projects.private.local.json`

which is gitignored and merged only in Pilot Center. Public builds must not bundle this overlay.

## Project Galaxy

No bespoke D3 implementation.

```text
ProjectRegistry
   ↓
projectRegistryToDiagram()
   ↓
DiagramSpec
   ↓
radial/hub layout provider
   ↓
existing Figure renderer
```

Click/select opens project inspector with status, type, summary, technologies, features, next action and direct website link.

## Sticky notes / Idea Board

Use Fluent surfaces with subtle Post-it character, not a whiteboard clone.

Suggested serializable/local type:

```ts
interface IdeaNote {
  id: string;
  title: string;
  body?: string;
  url?: string;
  domain: 'bi' | 'cloud' | 'sql' | 'analytics' | 'data-engineering' | 'ml' | 'other';
  context: 'pro' | 'personal' | 'project' | 'side-business';
  priority: 'urgent' | 'next' | 'later';
  status: 'idea' | 'todo' | 'doing' | 'waiting' | 'done';
  projectId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

LocalStorage or an existing guarded storage adapter is sufficient for V3. Provide deterministic JSON export/import. Keep the storage boundary replaceable; an MCP/remote adapter can come later without changing the UI model.

Accessibility: notes must be keyboard operable; do not require freeform drag positioning. Simple reorder/pin/filter is sufficient.
