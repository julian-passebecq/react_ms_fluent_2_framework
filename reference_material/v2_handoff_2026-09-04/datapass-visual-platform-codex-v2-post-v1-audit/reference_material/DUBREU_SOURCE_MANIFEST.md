# Dubreu source attachment manifest

This handoff does not duplicate the full training source payloads. When these attachments are supplied to Codex, import them deterministically and preserve provenance.

## SQL course notebooks

One exact duplicate is present for `0. C - Contexte, Labels et Explications`; deduplicate by SHA-256.

| File | SHA-256 | Cells | Markdown | Code |
|---|---|---:|---:|---:|
| `0. A - Manuel d'Utilisation.ipynb` | `7112ee47f99f0955ac67d78cd9ff6a4f6ef4b98d235612c77f5c317ae2f14496` | 35 | 35 | 0 |
| `0. B - Base de données.ipynb` | `5891098066fbd37ece062efe13849e13dc3b1a05583fc98d0189c4a6311cb713` | 120 | 120 | 0 |
| `0. C - Contexte, Labels et Explications.ipynb` | `1d163f9efd9d82daf40d2b3a090163b9ae8066d84fc759a6080ae9e44e2be820` | 87 | 87 | 0 |
| `1. Première Requête.ipynb` | `dccb2a11713f8094745ea40b6badb6f71712712e7445b32b0f65d34273be5531` | 148 | 130 | 18 |
| `2. Ajouter des Conditions.ipynb` | `f0d165cff043b88daa2d64d74de2469be56244eb160469a1f585c383ccae5daa` | 152 | 122 | 30 |
| `3. Utilisation des fonctions.ipynb` | `c2be7d5e718a8803138be811eb6648b9abe44287ad60c5b0f2cf233375ceb546` | 209 | 176 | 33 |
| `4. Opération de groupe.ipynb` | `f00f597b96879dcc7b83e6d64b5d2817b73478a37edec48d3bcf8ddb5e8e4091` | 84 | 75 | 9 |
| `5. Interaction entre plusieurs tables.ipynb` | `36e74774672beb0ce796f34ea35535c9d780ee961048ace7234227f285a70baa` | 252 | 234 | 18 |
| `6. Combiner les requêtes.ipynb` | `c3b10c74119cc6c3ccd2896cb210cc5583c0c864c157f24f9bf904471be77080` | 174 | 151 | 23 |
| `7. Résumé.ipynb` | `08bf6663766ddbd78c5c0c3befc4542c051833b223bcc1553bf1b5dd4baa3678` | 66 | 66 | 0 |
| `8. Exercices Bonus.ipynb` | `f042a1d12b8ead2d85fbe47710dcc1e69f3a54c1e8be9705d60a2a3a75fed4c5` | 70 | 51 | 19 |
| `Correction Exercices.ipynb` | `c7decbb9f3a5d61f9732230785ef257fad572b59668ea17b792bfd39d486e4bd` | 261 | 192 | 69 |

Many SQL code cells are Deepnote-generated Python wrappers around `_dntk.execute_sql(...)`. The import layer should expose the embedded SQL to the learner and keep the wrapper only as provenance/debug source.

## Advanced SQL module archives — 9 unique modules / 39 notebooks

Duplicate archive copies exist; use SHA-256 for deduplication.

| Module source | SHA-256 | Notebooks |
|---|---|---:|
| `64e3b896d9fdc_cross_joins*.zip` | `b7a4d0e5e883a7c1e2547775bf58754ded0f56d218328d81be0c99b3ab6987a9` | 3 |
| `64e511a669fe7_inner_joins*.zip` | `d4977f3d8ac89344f2ad22e85dc2e7c4889c7558ea99d3da1b98858d2975a8a9` | 5 |
| `64e615eb263e3_left_joins*.zip` | `c7c47784c38a03fc1009c80ed4bf3510dbe888cec7e19cbbdc2553fd868a8c7a` | 3 |
| `64e61a85d2590_full_outer_joins*.zip` | `a46c2b93094ccd93c178c3581d68a7626021fa0beffa347eabe9cbc959d9293b` | 2 |
| `64e7a971c2015_self_joins*.zip` | `7f63db6c37c136ee6ab1700f3aa3ea1c4d9a24e4eccd20a5c107375e3ea6db71` | 3 |
| `64ef92a946b80_groupby*.zip` | `cb1dd4880254c70710c18497abbfcbb64ffe41d968f38f0218dbfbe9c58d1bb9` | 6 |
| `64f38382d4cdd_casewhen*.zip` | `bcdad9e464ba9b4481818bdfbae0c6e065c8cb21a16ef3816b849493ceef2cfc` | 4 |
| `64f8c3bee3407_grouping_sets*.zip` | `99153b1e87512ca45e9c161ad59cba69e7e74b3b4289034f84d11449c9804170` | 6 |
| `6501e5808e332_window_functions*.zip` | `5663f78410880340834b5f22b15756851b59bff479f62e5038ed4c3d4910a5a6` | 7 |

### Advanced topic titles observed

- Cross joins — intuition, SQL/Python examples, practical use;
- Inner joins — intuition, examples/exercises, retail, cross-join-via-inner-join, pandas merge vs join;
- Left joins — intuition, examples/exercises, retail;
- Full outer joins — intuition, examples/exercises;
- Self joins — introduction, order delay exercise, meetings exercise;
- GroupBy — aggregations, GroupBy intro, Etalab real-estate data, CTE/HAVING filtering, exercises, count notes;
- CASE WHEN — simple use cases, lambdas/apply interlude, conditional aggregation, football real data;
- GROUPING SETS — multi-level aggregation, exercises, filter/CASE comparison, ROLLUP/CUBE, health real-world exercise;
- Window functions — problem framing, OVER, ROWS BETWEEN, PARTITION BY, LAG, ROW_NUMBER/RANK/DENSE_RANK, QUALIFY.

Many archives include `data/`, `images/` and `solutions/`. Import media and solutions as course assets/provenance; do not flatten them into UI source code.

## Select Star SQL

Attachment: `selectstarsql-master.zip`
SHA-256: `fe2fce3f790eb65438aba0f4bea25eb75a3646ae19a3089abe8bae918c497668`

The source README states:

- book prose: CC BY-SA 4.0;
- code and datasets: CC0.

If adapted publicly, preserve attribution and share-alike requirements for prose.

## Python Notion source

The user also wants the Dubreu Python Notion curriculum included. Prefer a Notion export (Markdown/HTML) or connected-page API import over brittle rendered-page scraping. Keep it as a separate deterministic source import feeding `CourseSpec`/`LessonSpec`.
