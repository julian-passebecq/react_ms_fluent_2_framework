# V3 visual language — professional technical Fluent

Reference image: `reference_assets/formation_visual_direction.png`.

The image is a **directional reference**, not a UI screenshot to recreate literally.

## Desired character

- Fluent 2 structure and control behavior;
- professional, calm and technical;
- warm off-white / near-white page canvas;
- deep navy primary ink;
- slate/gray secondary text and borders;
- restrained teal for active/flow/functional accents;
- sparse warm amber for one highlight or warning/attention state;
- subtle soft depth only for intentionally raised/floating objects;
- mostly flat application surfaces with thin borders;
- generous but not wasteful whitespace;
- refined technical/editorial diagrams.

## Ratio

A useful rule of thumb:

- ~85% neutral surfaces/ink
- ~10% functional accent
- ~5% highlight

## “Fluent outside, editorial inside the figure”

Application chrome:

- Fluent shell, toolbar, tabs, filters, inspector, buttons, forms.

Figure:

- message-first title/takeaway;
- direct labels;
- semantic emphasis;
- sparse annotation;
- visible sources/freshness when relevant;
- deterministic layout;
- motion used only for explanation.

## Avoid

- neon gradients;
- dark marketing heroes for every app;
- excessive badge colors;
- glowing/pulsing/floating decoration;
- oversized marketing headlines inside workbench/catalog apps;
- visual noise from every node using a different color;
- fake code/output/UI embedded in illustrations when real components exist.

## Shared implementation guidance

Do not create a theme engine. Prefer Fluent tokens plus a small shared set of Datapass CSS custom properties/classes for the professional technical profile. Keep app-specific layout in the consumer.
