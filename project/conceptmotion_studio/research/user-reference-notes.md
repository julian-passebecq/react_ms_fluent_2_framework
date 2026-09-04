# User-supplied visual references — descriptive notes

The raw Instagram images/video are **not bundled** in this repository. These notes capture the interaction/layout ideas so a future agent can work without access to the original chat attachments.

## 1. Moving Bubble Sort video

Reference type: short social-media algorithm animation.

Observed composition:

- near-black/navy background;
- large uppercase `BUBBLE SORT` heading;
- short definition under heading;
- complexity pills (`Time`, `Space`) near the top;
- horizontal row of small rounded value boxes;
- active adjacent pair is emphasized with a bracket/outline and operation label;
- states alternate between comparisons and swaps;
- on a swap the values actually exchange horizontal positions;
- line-numbered code/pseudocode sits directly below the array;
- the relevant code line is highlighted with a translucent horizontal bar;
- syntax has restrained accent colors;
- data state, operation label and code focus advance together;
- later frames show the largest values reaching their final right-side positions;
- the social-app UI/creator branding is not part of the desired reusable design.

What to generalize:

```text
same object ID
   + current position
   + current operation
   + active comparison
   + settled state
   + synchronized code line
```

Use this pattern for sorting, table row movement, partition/shuffle movement and other algorithms where tracking object identity matters.

## 2. VS Code handwritten shortcut sheet

Observed composition:

- white ruled notebook paper;
- large VS Code logo/name on lower-left;
- branching black hand-drawn connector lines from the central subject;
- shortcut key combinations inside blue rectangular hand-drawn boxes;
- arrows to concise action names;
- action names underlined in blue;
- almost no decorative color beyond blue/black;
- dense but highly scannable one-page layout.

Library implication: a `handwritten` theme should support branching callouts and paper structure, not just change font family.

## 3. Random Forest notebook page

Observed repeated template:

1. large handwritten algorithm title + underline;
2. **What it is** paragraph;
3. **Key Equation / Formula** block;
4. **When to Use** paragraph;
5. **How it Works (Architecture)** mini flow diagram;
6. **Example / Chart** mini visualization;
7. very limited color palette: blue headings, red formula emphasis, green usage/architecture accents, purple boxes.

This is a strong template for generated paper-style ML/statistics sheets.

## 4. Decision Tree notebook page

Same paper template as Random Forest. The architecture section is a left-to-right series of boxes (start data → choose split → child nodes → repeat → leaf prediction). The bottom section shows a compact decision tree with labeled branches.

Library implication: a paper renderer can combine explanatory sections with a small reusable tree diagram.

## 5. Logistic Regression notebook page

Same template with:

- linear score equation;
- sigmoid equation;
- hypothesis/output;
- left-to-right architecture (`features → linear combination → sigmoid → probability → class`);
- bottom sigmoid chart and threshold rule.

Library implication: formula, mechanism flow and example chart should be separate semantic blocks that can be laid out automatically.

## 6. Seaborn reference

Different hybrid style:

- top half uses clean modern sans-serif explanation text;
- lower half becomes a hand-drawn concept map;
- central Seaborn box/logo;
- four surrounding explanatory callouts connected by arrows;
- central list of common plot types;
- tiny sample charts and pandas/table iconography.

Library implication: themes can mix modern typography with illustrative callouts rather than enforcing one style across the whole page.

## 7. Python list/index reference

- clean white page with modern explanation at top;
- array drawn as adjacent boxes;
- positive indices above and negative indices below;
- blue used only for the values and directional labels.

Library implication: data-structure explanations often need a clean `diagram` surface rather than full storyboard animation.

## General design lessons from the user references

- Keep each visual focused on one concept.
- Use a stable layout grammar so learners know where to look for definition/formula/mechanism/example.
- Preserve whitespace.
- Use color to encode meaning, not decoration.
- Handwritten does not mean messy; the examples are highly structured.
- Social cards can be dark/high-contrast, but the user's preferred application default is light.
- Build themes/surface layouts from semantic blocks so AI can generate them consistently.
