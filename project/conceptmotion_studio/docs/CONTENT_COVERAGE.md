# Content coverage report

- Catalogue: **186** concepts
- Live scenes: **36**
- Recommended interactive/story concepts: **147** (**33** live, **114** planned)
- Printable sheets: **16**
- Cross-language actions: **15** across **8** lenses

## Domain coverage

| Domain | Concepts | Live scenes |
| --- | ---: | ---: |
| SQL & Query Engine | 41 | 11 |
| Python & DataFrames | 18 | 3 |
| DAX & Power BI | 16 | 2 |
| Data Modeling | 15 | 2 |
| Data Engineering | 14 | 2 |
| Pipelines & DAGs | 10 | 2 |
| Storage & Lakehouse | 10 | 2 |
| Algorithms & DSA | 13 | 2 |
| Statistics | 11 | 1 |
| Machine Learning | 18 | 7 |
| DevOps & Tools | 9 | 2 |
| Shortcuts & Reference | 11 | 0 |

## Highest-priority planned interactive/story items

- **BFS vs DFS** — algorithms/Graphs · must · algo-bfs-dfs
- **Hash lookup / dedup** — algorithms/Hashing · must · algo-hash
- **Merge sort** — algorithms/Sorting · must · sort-merge
- **Quick sort** — algorithms/Sorting · must · sort-quick
- **Sliding window** — algorithms/Array patterns · must · algo-sliding-window
- **Topological sort** — algorithms/Graphs · must · algo-toposort
- **Data skew** — dataframes/PySpark · must · pyspark-skew
- **Dictionary / hash map** — dataframes/Python foundations · must · python-dict
- **Narrow vs wide transformation** — dataframes/PySpark · must · pyspark-narrow-wide
- **pandas groupby** — dataframes/pandas · must · pandas-groupby
- **pandas merge** — dataframes/pandas · must · pandas-merge
- **pandas row filtering** — dataframes/pandas · must · pandas-filter
- **repartition vs coalesce** — dataframes/PySpark · must · pyspark-repartition
- **Set membership** — dataframes/Python foundations · must · python-set
- **Vectorization vs apply** — dataframes/pandas performance · must · pandas-vectorization
- **ALL / REMOVEFILTERS** — dax/DAX evaluation · must · dax-all-removefilters
- **Context transition** — dax/DAX evaluation · must · dax-context-transition
- **DAX row context** — dax/DAX evaluation · must · dax-row-context
- **Measure vs calculated column** — dax/Semantic model · must · dax-measure-column
- **Relationship filter propagation** — dax/Semantic model · must · dax-relationships
- **Time intelligence** — dax/DAX patterns · must · dax-time-intelligence
- **Visual → DAX query → semantic model** — dax/Power BI runtime · must · powerbi-visual-query
- **X iterators: SUMX etc.** — dax/DAX evaluation · must · dax-iterator
- **Branch & merge** — devops/Git · must · git-branch-merge
- **CI/CD pipeline** — devops/CI/CD · must · cicd-pipeline
- **Backfill** — engineering/Operations · must · de-backfill
- **Batch vs stream vs micro-batch** — engineering/Architecture · must · de-batch-stream
- **Bronze / Silver / Gold** — engineering/Architecture · must · de-medallion
- **Change Data Capture** — engineering/Ingestion · must · de-cdc
- **Checkpoint / offset** — engineering/Reliability · must · de-checkpoint
- **Data lineage** — engineering/Governance · must · de-lineage
- **Data quality gate** — engineering/Quality · must · de-quality-gate
- **ETL vs ELT** — engineering/Architecture · must · de-etl-elt
- **Partition skew** — engineering/Performance · must · de-skew
- **Small-file problem** — engineering/Performance · must · de-small-files
- **Cross-validation** — ml/Evaluation · must · ml-cross-validation
- **Feature scaling** — ml/Preprocessing · must · ml-feature-scaling
- **Gradient boosting** — ml/Tree models · must · ml-gradient-boosting
- **Overfitting & regularization** — ml/Evaluation · must · ml-overfitting
- **Precision vs recall** — ml/Evaluation · must · ml-precision-recall
- **Train / validation / test split** — ml/Evaluation · must · ml-train-val-test
- **Declare the grain** — modeling/Dimensional modeling · must · model-grain
- **Transaction fact** — modeling/Fact table patterns · must · model-transaction-fact
- **Catchup & backfill** — orchestration/Scheduling · must · dag-catchup-backfill
- **Retries + exponential backoff** — orchestration/Reliability · must · dag-retry-backoff
- **Composite index / leftmost prefix** — sql/Indexes · must · sql-composite-index
- **Global sort cost** — sql/Performance · must · sql-sort-cost
- **GROUP BY aggregation** — sql/Aggregation · must · sql-group-by
- **Hash join** — sql/Join algorithms · must · sql-hash-join
- **HAVING vs WHERE** — sql/Aggregation · must · sql-having
- **LAG / LEAD** — sql/Window functions · must · sql-lag-lead
- **Logical SQL execution order** — sql/Query semantics · must · sql-logical-order
- **Moving ROWS frame** — sql/Window functions · must · sql-moving-window
- **ROW_NUMBER** — sql/Window functions · must · sql-row-number
- **Running total** — sql/Window functions · must · sql-running-total
- **Sargability** — sql/Optimizer · must · sql-sargability
- **Scan vs seek** — sql/Indexes · must · sql-index-scan-seek
- **Selectivity & cardinality** — sql/Optimizer · must · sql-selectivity
- **SQL partition pruning** — sql/Performance · must · sql-partition-pruning
- **UNION vs UNION ALL** — sql/Set operations · must · sql-union
- **A/B test** — statistics/Experimentation · must · stat-ab-test
- **Confidence interval** — statistics/Inference · must · stat-confidence-interval
- **Correlation** — statistics/Relationships · must · stat-correlation
- **Distribution shape** — statistics/Probability · must · stat-distribution
- **Mean vs median** — statistics/Descriptive statistics · must · stat-mean-median
- **p-value** — statistics/Inference · must · stat-pvalue
- **Type I vs Type II error** — statistics/Inference · must · stat-type-errors
- **Variance & standard deviation** — statistics/Descriptive statistics · must · stat-variance-std
- **Column pruning** — storage/Parquet · must · storage-column-pruning
- **Compaction** — storage/Maintenance · must · storage-compaction
- **Lake partitioning** — storage/Physical layout · must · storage-partitioning
- **Predicate pushdown** — storage/Parquet · must · storage-predicate-pushdown
- **Row vs column storage** — storage/Formats · must · storage-row-column
- **Heap / Top-K** — algorithms/Priority queues · high · algo-topk
- **Heap sort** — algorithms/Sorting · high · sort-heap
- **Insertion sort** — algorithms/Sorting · high · sort-insertion
- **Prefix sum** — algorithms/Array patterns · high · algo-prefix-sum
- **Two pointers** — algorithms/Array patterns · high · algo-two-pointers
- **pivot ↔ melt** — dataframes/pandas · high · pandas-pivot-melt
- **Storage engine vs formula engine** — dax/Performance · high · dax-storage-formula
- **VertiPaq cardinality & compression** — dax/Performance · high · vertipaq-cardinality
- **Virtual tables** — dax/DAX patterns · high · dax-virtual-table
- **Visual calculations** — dax/Power BI runtime · high · powerbi-visual-calculation
- **Docker layers & cache** — devops/Docker · high · docker-layers
- **Pod / Deployment / Service** — devops/Kubernetes · high · k8s-pod-deploy-service
- **Rebase mental model** — devops/Git · high · git-rebase
- **Terraform plan/apply/state** — devops/Infrastructure as code · high · terraform-plan-apply
- **Schema evolution** — engineering/Reliability · high · de-schema-evolution
- **K-nearest neighbors** — ml/Supervised learning · high · ml-knn
- **Naive Bayes** — ml/Supervised learning · high · ml-naive-bayes
- **Neural network training** — ml/Deep learning · high · ml-neural-network
- **ROC vs PR curve** — ml/Evaluation · high · ml-roc-pr
- **Support Vector Machine** — ml/Supervised learning · high · ml-svm
- **Accumulating snapshot fact** — modeling/Fact table patterns · high · model-accumulating-snapshot
- **Normalization 1NF–3NF** — modeling/Relational modeling · high · model-normalization
- **Periodic snapshot fact** — modeling/Fact table patterns · high · model-periodic-snapshot
- **SCD Type 1** — modeling/Slowly changing dimensions · high · model-scd1
- **Snowflake dimension** — modeling/Dimensional modeling · high · model-snowflake
- **Branching** — orchestration/DAG mechanics · high · dag-branching
- **Critical path** — orchestration/DAG mechanics · high · dag-critical-path
- **Pools & concurrency** — orchestration/Capacity · high · dag-pools
- **Sensors / deferrable waiting** — orchestration/Airflow · high · dag-sensor
- **Trigger rules** — orchestration/DAG mechanics · high · dag-trigger-rules
- **Isolation levels** — sql/Transactions · high · sql-isolation
- **Merge join** — sql/Join algorithms · high · sql-merge-join
- **Nested-loop join** — sql/Join algorithms · high · sql-nested-loop
- **PIVOT / conditional aggregation** — sql/Shape · high · sql-pivot
- **Recursive CTE** — sql/Query structure · high · sql-recursive-cte
- **ROWS vs RANGE** — sql/Window functions · high · sql-rows-vs-range
- **UNPIVOT / long format** — sql/Shape · high · sql-unpivot
- **Bayes update** — statistics/Bayesian inference · high · stat-bayes
- **Bootstrap** — statistics/Inference · high · stat-bootstrap
- **Clustering / Z-order mental model** — storage/Physical layout · high · storage-clustering
- **Iceberg metadata/manifests** — storage/Table formats · high · storage-iceberg-metadata

Generated from source data. Re-run `npm run report` after catalogue/scene changes.
