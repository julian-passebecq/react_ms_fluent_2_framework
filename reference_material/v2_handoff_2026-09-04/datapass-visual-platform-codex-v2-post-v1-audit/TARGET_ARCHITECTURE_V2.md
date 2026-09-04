# Target architecture V2

```text
                           pure content contracts
                    +-----------------------------+
                    | Figure / Course / Notebook  |
                    | Lesson / Assessment / Project|
                    +--------------+--------------+
                                   |
        +--------------------------+--------------------------+
        |                          |                          |
@conceptmotion/core       @datapass/knowledge          ProgressStore
        |                          |                          |
@conceptmotion/svg                 |                          |
        |                          |                          |
@conceptmotion/react               |                          |
        +--------------------------+--------------------------+
                                   |
                         renderer/content adapters
                                   |
                           React + Fluent UI
                                   |
              +--------------------+--------------------+
              |                    |                    |
        Course/Notebook       Knowledge/Catalog     Workbench
              |                    |                    |
              +--------------------+--------------------+
                                   |
                           consumer applications
                +------------------+------------------+
                |                  |                  |
          Dubreu Formation    Norwegian Atlas     Project Hub
```

## Code editor boundary

```text
@datapass/code
   |
   +-- CodeEditor
   +-- CodeDiff
   +-- JsonSpecEditor
   +-- Monaco lazy loader/theme
```

`@datapass/ui` must not import Monaco.

## Figure boundary

```text
FigureSpec
   |
FigureRendererRegistry
   |
   +-- conceptmotion adapter
   +-- static SVG/image adapter
   +-- future chart adapter
   +-- future geostory adapter
   |
FigureFrame / FigureView
```

The Figure contract unifies metadata and lifecycle, not geometry.

## Notebook/course boundary

```text
.ipynb / Markdown / structured JSON
             |
      deterministic importer
             |
   CourseSpec / LessonSpec / NotebookSpec
             |
       Learning Workbench
             |
   +---------+---------+
   |         |         |
Monaco    Figure     Assessment
```

## Runtime boundary

```text
RuntimeLauncher
   |
   +-- download .ipynb
   +-- open Colab URL
   +-- open Databricks guidance/link
   +-- future Voila/Mercury provider
```

Runtime providers do not own curriculum, Figure or progress semantics.

## App factory boundary

```text
AppRecipe + ProjectRegistry
          |
   scaffold-app script
          |
     apps/<consumer>
          |
 shared workspace packages
```

Scaffolding composes packages; it never copies/forks renderer source.
