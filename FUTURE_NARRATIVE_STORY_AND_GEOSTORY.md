# Future narrative Story/GeoStory - v2 design bridge

## Why this exists

The user wants future D3 sites capable of turning structured narratives into sophisticated interactive visual stories, for example:

- historical events on a world map;
- earthquakes over time;
- awards/discoveries/launches;
- an article transformed into an interactive dashboard/story;
- a film or TV episode represented as places, routes, people and actions;
- a character route across countries, cities and local maps;
- transport/city stories such as Paris metro movement;
- flows, incidents, milestones and sequences with play/scrub/focus.

These are valuable D3 use cases because ordinary BI charts rarely provide this storytelling flexibility.

They belong to the future D3/GeoStory track, NOT to ConceptMotion Foundation v1.1.

## Important factorization

Do not create `EarthquakeMap`, `NobelMap`, `JamesBondMap`, `ArticleMap` as separate engines.

Build a semantic narrative grammar:

```text
Story data
  ↓
entities + events + places + actions + chapters
  ↓
NarrativeStorySpec
  ↓
GeoStory / timeline / chart / network renderers
  ↓
web / React / future Power BI where technically appropriate
```

## Draft future spec

```ts
interface NarrativeStorySpec {
  id: string;
  title: LocalizedText;
  summary?: LocalizedText;
  entities: StoryEntity[];
  events: StoryEvent[];
  chapters?: StoryChapter[];
  sources?: SourceRef[];
  defaultView?: 'map' | 'timeline' | 'network' | 'dashboard';
}

interface StoryEntity {
  id: string;
  kind: 'person' | 'organization' | 'place' | 'object' | 'topic' | 'event-group';
  label: LocalizedText;
  metadata?: Record<string, unknown>;
}

interface StoryEvent {
  id: string;
  time?: string;
  endTime?: string;
  place?: {
    label?: string;
    lon?: number;
    lat?: number;
    city?: string;
    country?: string;
  };
  actorIds?: string[];
  targetIds?: string[];
  actionType?: string;
  category?: string;
  value?: number;
  label?: LocalizedText;
  sourceIds?: string[];
}

interface StoryChapter {
  id: string;
  title: LocalizedText;
  eventIds?: string[];
  entityIds?: string[];
  caption?: LocalizedText;
  camera?: {
    focusPlace?: string;
    zoom?: number;
    projection?: string;
  };
}
```

## V1.1 preparation only

Foundation v1.1 should ensure:

- `FigureFrame` can host a future narrative renderer;
- localization/source metadata does not assume ordinary prose only;
- stable entity/event IDs are compatible with the platform's semantic identity principle;
- no layout or app shell assumes every figure is a static chart;
- source-linked knowledge pages can embed a future Story/GeoStory.

Do not implement maps, camera movement or story playback in v1.1.

## V2 primitives

The existing D3 SDK already points in the right direction with common playback, zoom, path drawing, particles, temporal geo events, metro topology and flow maps.

V2 should add/reinforce:

- projection/camera interpolation;
- geographic focus / zoomToRegion;
- story/tour controller (`focus`, `highlight`, `zoomTo`, `annotate`, `transitionTo`, `wait`);
- map + timeline synchronization;
- map + ranking morph where useful;
- city/detail-map transitions;
- entity trails/routes;
- event clustering/decluttering;
- narrative annotations;
- reduced-motion mode;
- deterministic spec-first authoring.

## Article-to-visual workflow (future)

```text
article / script / structured source
            ↓
extract entities, dates, places, actions, quantities
            ↓
human/AI review
            ↓
NarrativeStorySpec
            ↓
choose views: map + timeline + chart + network
            ↓
interactive story
```

The AI should generate the semantic spec and data, not custom D3 interaction code.
