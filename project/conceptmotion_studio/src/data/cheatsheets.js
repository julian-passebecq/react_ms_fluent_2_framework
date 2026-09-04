export const languages = ['Python','pandas','T-SQL','BigQuery','DuckDB','PySpark','Polars','DAX'];

export const crossLanguageActions = [
  {id:'filter',title:'Filter rows',intent:'Keep rows satisfying a condition',code:{
    Python:"[r for r in rows if r['amount'] > 100]",
    pandas:"df[df['amount'] > 100]",
    'T-SQL':"SELECT * FROM sales WHERE amount > 100;",
    BigQuery:"SELECT * FROM `sales` WHERE amount > 100",
    DuckDB:"SELECT * FROM sales WHERE amount > 100;",
    PySpark:"df.filter(F.col('amount') > 100)",
    Polars:"df.filter(pl.col('amount') > 100)",
    DAX:"FILTER(Sales, Sales[Amount] > 100)"
  }},
  {id:'select',title:'Select columns',intent:'Project only the fields you need',code:{
    Python:"[{k:r[k] for k in ('id','amount')} for r in rows]",
    pandas:"df[['id', 'amount']]",
    'T-SQL':"SELECT id, amount FROM sales;",
    BigQuery:"SELECT id, amount FROM `sales`",
    DuckDB:"SELECT id, amount FROM sales;",
    PySpark:"df.select('id', 'amount')",
    Polars:"df.select('id', 'amount')",
    DAX:'SELECTCOLUMNS(Sales, "id", Sales[Id], "amount", Sales[Amount])'
  }},
  {id:'derive',title:'Derived column',intent:'Add a calculation while retaining rows',code:{
    Python:"for r in rows:\n    r['net'] = r['gross'] - r['tax']",
    pandas:"df['net'] = df['gross'] - df['tax']",
    'T-SQL':"SELECT *, gross-tax AS net FROM sales;",
    BigQuery:"SELECT *, gross-tax AS net FROM `sales`",
    DuckDB:"SELECT *, gross-tax AS net FROM sales;",
    PySpark:"df.withColumn('net', F.col('gross') - F.col('tax'))",
    Polars:"df.with_columns((pl.col('gross')-pl.col('tax')).alias('net'))",
    DAX:"Net = Sales[Gross] - Sales[Tax]"
  }},
  {id:'group',title:'Group + sum',intent:'One result per group',code:{
    Python:"from collections import defaultdict\nout=defaultdict(float)\nfor r in rows: out[r['region']] += r['amount']",
    pandas:"df.groupby('region', as_index=False)['amount'].sum()",
    'T-SQL':"SELECT region, SUM(amount) amount FROM sales GROUP BY region;",
    BigQuery:"SELECT region, SUM(amount) amount FROM `sales` GROUP BY region",
    DuckDB:"SELECT region, SUM(amount) amount FROM sales GROUP BY region;",
    PySpark:"df.groupBy('region').agg(F.sum('amount').alias('amount'))",
    Polars:"df.group_by('region').agg(pl.col('amount').sum())",
    DAX:'SUMMARIZECOLUMNS(Sales[Region], "Amount", SUM(Sales[Amount]))'
  }},
  {id:'sort',title:'Sort descending',intent:'Deterministic highest-to-lowest order',code:{
    Python:"sorted(rows, key=lambda r:r['amount'], reverse=True)",
    pandas:"df.sort_values('amount', ascending=False)",
    'T-SQL':"SELECT * FROM sales ORDER BY amount DESC;",
    BigQuery:"SELECT * FROM `sales` ORDER BY amount DESC",
    DuckDB:"SELECT * FROM sales ORDER BY amount DESC;",
    PySpark:"df.orderBy(F.desc('amount'))",
    Polars:"df.sort('amount', descending=True)",
    DAX:"EVALUATE Sales\nORDER BY Sales[Amount] DESC"
  }},
  {id:'join',title:'Left join',intent:'Keep every fact/left row and attach matches',code:{
    Python:"by_id={r['id']:r for r in dim}\n# enrich rows by lookup",
    pandas:"fact.merge(dim, on='id', how='left', validate='m:1')",
    'T-SQL':"SELECT f.*, d.category FROM fact f LEFT JOIN dim d ON f.id=d.id;",
    BigQuery:"SELECT f.*, d.category FROM `fact` f LEFT JOIN `dim` d USING(id)",
    DuckDB:"SELECT f.*, d.category FROM fact f LEFT JOIN dim d USING(id);",
    PySpark:"fact.join(dim, on='id', how='left')",
    Polars:"fact.join(dim, on='id', how='left')",
    DAX:"RELATED(Dim[Category])"
  }},
  {id:'dedup',title:'Keep latest duplicate',intent:'Identity key + deterministic winner',code:{
    Python:"latest={}\nfor r in rows:\n    k=r['event_id']\n    if k not in latest or r['ingested_at']>latest[k]['ingested_at']: latest[k]=r",
    pandas:"df.sort_values('ingested_at').drop_duplicates('event_id', keep='last')",
    'T-SQL':"WITH x AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY ingested_at DESC) rn FROM events) SELECT * FROM x WHERE rn=1;",
    BigQuery:"SELECT * FROM `events` QUALIFY ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY ingested_at DESC)=1",
    DuckDB:"SELECT * FROM events QUALIFY ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY ingested_at DESC)=1;",
    PySpark:"w=Window.partitionBy('event_id').orderBy(F.desc('ingested_at'))\ndf.withColumn('rn',F.row_number().over(w)).filter('rn=1').drop('rn')",
    Polars:"df.sort('ingested_at').unique(subset='event_id', keep='last')",
    DAX:"Prefer dedup before the semantic model; DAX is not the right pipeline layer."
  }},
  {id:'rolling',title:'Rolling 3-row sum',intent:'Move a fixed frame over ordered rows',code:{
    Python:"from collections import deque\nq,total=deque(),0",
    pandas:"df['roll3']=df.groupby('region')['amount'].transform(lambda s:s.rolling(3).sum())",
    'T-SQL':"SUM(amount) OVER(PARTITION BY region ORDER BY dt ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
    BigQuery:"SUM(amount) OVER(PARTITION BY region ORDER BY dt ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
    DuckDB:"SUM(amount) OVER(PARTITION BY region ORDER BY dt ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
    PySpark:"w=Window.partitionBy('region').orderBy('dt').rowsBetween(-2,0)\ndf.withColumn('roll3',F.sum('amount').over(w))",
    Polars:"df.with_columns(pl.col('amount').rolling_sum(3).over('region').alias('roll3'))",
    DAX:"Usually implement a date-aware measure; DAX has different semantics than a physical 3-row SQL frame."
  }},
  {id:'parquet',title:'Read Parquet',intent:'Load/select a columnar dataset',code:{
    Python:"import pyarrow.parquet as pq\ntable=pq.read_table('sales.parquet')",
    pandas:"df=pd.read_parquet('sales.parquet')",
    'T-SQL':"-- Fabric/Synapse syntax depends on external table / OPENROWSET context",
    BigQuery:"-- Load/external-table Parquet in BigQuery; query the table normally",
    DuckDB:"SELECT * FROM read_parquet('sales.parquet');",
    PySpark:"df=spark.read.parquet('/data/sales')",
    Polars:"df=pl.scan_parquet('sales/*.parquet')",
    DAX:"Parquet is loaded through Power Query/Fabric, not DAX."
  }},
  {id:'distinct',title:'Distinct keys',intent:'Return unique values/rows',code:{
    Python:"sorted(set(r['customer_id'] for r in rows))",
    pandas:"df['customer_id'].drop_duplicates()",
    'T-SQL':"SELECT DISTINCT customer_id FROM sales;",
    BigQuery:"SELECT DISTINCT customer_id FROM `sales`",
    DuckDB:"SELECT DISTINCT customer_id FROM sales;",
    PySpark:"df.select('customer_id').distinct()",
    Polars:"df.select('customer_id').unique()",
    DAX:"DISTINCT(Sales[CustomerId])"
  }},
  {id:'rank-group',title:'Rank inside a group',intent:'Assign an order while preserving row detail',code:{
    Python:"# sort/group explicitly; pandas is usually clearer for tabular ranking",
    pandas:"df['rn']=df.sort_values('amount',ascending=False).groupby('region').cumcount()+1",
    'T-SQL':"ROW_NUMBER() OVER(PARTITION BY region ORDER BY amount DESC) AS rn",
    BigQuery:"ROW_NUMBER() OVER(PARTITION BY region ORDER BY amount DESC) AS rn",
    DuckDB:"ROW_NUMBER() OVER(PARTITION BY region ORDER BY amount DESC) AS rn",
    PySpark:"w=Window.partitionBy('region').orderBy(F.desc('amount'))\ndf.withColumn('rn',F.row_number().over(w))",
    Polars:"df.with_columns(pl.col('amount').rank('ordinal',descending=True).over('region').alias('rn'))",
    DAX:"RANKX(FILTER(Sales, Sales[Region]=EARLIER(Sales[Region])), Sales[Amount],, DESC, Dense) -- calculated-column pattern; measures differ"
  }},
  {id:'anti-join',title:'Anti join / missing match',intent:'Keep left rows with no matching right key',code:{
    Python:"keys={r['id'] for r in dim}\nout=[r for r in fact if r['id'] not in keys]",
    pandas:"fact.merge(dim[['id']],on='id',how='left',indicator=True).query('_merge == \"left_only\"')",
    'T-SQL':"SELECT f.* FROM fact f WHERE NOT EXISTS (SELECT 1 FROM dim d WHERE d.id=f.id);",
    BigQuery:"SELECT f.* FROM `fact` f WHERE NOT EXISTS (SELECT 1 FROM `dim` d WHERE d.id=f.id)",
    DuckDB:"SELECT f.* FROM fact f ANTI JOIN dim d USING(id);",
    PySpark:"fact.join(dim,on='id',how='left_anti')",
    Polars:"fact.join(dim,on='id',how='anti')",
    DAX:"-- Prefer Power Query/modeling for rowset anti-joins; EXCEPT can compare compatible table expressions."
  }},
  {id:'fill-null',title:'Replace missing value',intent:'Substitute a default for null/blank values',code:{
    Python:"value = 0 if value is None else value",
    pandas:"df['amount']=df['amount'].fillna(0)",
    'T-SQL':"SELECT COALESCE(amount,0) AS amount FROM sales;",
    BigQuery:"SELECT COALESCE(amount,0) AS amount FROM `sales`",
    DuckDB:"SELECT COALESCE(amount,0) AS amount FROM sales;",
    PySpark:"df.fillna({'amount':0})",
    Polars:"df.with_columns(pl.col('amount').fill_null(0))",
    DAX:"COALESCE([Amount], 0)"
  }},
  {id:'month-start',title:'Normalize date to month',intent:'Map timestamps/dates to a monthly grain',code:{
    Python:"month_start = dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)",
    pandas:"df['month']=df['dt'].dt.to_period('M').dt.to_timestamp()",
    'T-SQL':"DATETRUNC(month, dt) -- SQL Server 2022+",
    BigQuery:"DATE_TRUNC(DATE(dt), MONTH)",
    DuckDB:"date_trunc('month', dt)",
    PySpark:"df.withColumn('month',F.date_trunc('month','dt'))",
    Polars:"df.with_columns(pl.col('dt').dt.truncate('1mo').alias('month'))",
    DAX:"DATE(YEAR(Sales[Date]), MONTH(Sales[Date]), 1)"
  }},
  {id:'write-parquet',title:'Write Parquet',intent:'Persist an analytical columnar dataset',code:{
    Python:"import pyarrow.parquet as pq\npq.write_table(table,'sales.parquet')",
    pandas:"df.to_parquet('sales.parquet',index=False)",
    'T-SQL':"-- Fabric/Synapse export syntax depends on engine/workspace; do not assume one universal T-SQL command.",
    BigQuery:"-- Export table/query results to Cloud Storage as PARQUET via EXPORT DATA.",
    DuckDB:"COPY sales TO 'sales.parquet' (FORMAT PARQUET);",
    PySpark:"df.write.mode('overwrite').parquet('/data/sales')",
    Polars:"df.write_parquet('sales.parquet')",
    DAX:"Parquet persistence belongs to the data/platform layer, not DAX."
  }}
];

export const sheets = [
  {
    id:'sql-joins', title:'SQL Joins', subtitle:'Preservation rules before syntax', category:'SQL',
    sections:[
      {title:'Join families',items:[
        ['INNER','Matched pairs only'],['LEFT','All left + right matches; unmatched right columns = NULL'],['RIGHT','All right + left matches'],['FULL','Matches + unmatched from both sides'],['CROSS','Every left row × every right row'],['SEMI / EXISTS','Left rows with at least one match'],['ANTI / NOT EXISTS','Left rows with no match']
      ]},
      {title:'Interview traps',items:[
        ['Duplicates','A 1:m join multiplies rows by matching cardinality'],['NULL keys','NULL = NULL is not true under ordinary equality semantics'],['Filter placement','A WHERE condition on right columns can accidentally turn LEFT JOIN behavior into INNER-like behavior'],['Grain','Join only after stating what one row represents on each side']
      ]}
    ]
  },
  {
    id:'sql-windows', title:'SQL Window Functions', subtitle:'Partition · Order · Frame · Current row', category:'SQL',
    sections:[
      {title:'Core patterns',items:[['ROW_NUMBER','Deterministic sequence / dedup'],['RANK','Ties share rank; gaps remain'],['DENSE_RANK','Ties share rank; no gaps'],['LAG / LEAD','Previous / next row value'],['SUM OVER','Running or rolling total'],['AVG OVER','Moving average']]},
      {title:'Frame rules',items:[['ROWS','Physical row offsets'],['RANGE','ORDER BY peer-value semantics'],['UNBOUNDED PRECEDING','Start of partition'],['CURRENT ROW','Current row / peer boundary depending on frame type'],['QUALIFY','Filter window results where dialect supports it']]}
    ]
  },
  {
    id:'sql-performance', title:'SQL Performance', subtitle:'Reject expensive shapes before tuning syntax', category:'SQL',
    sections:[
      {title:'Access & optimizer',items:[['Scan','Read broad table/index range'],['Seek','Navigate to a qualifying key range'],['Selectivity','Fraction of rows expected to survive'],['Cardinality','Expected row count at each operator'],['Sargability','Predicate shape can use an index access path'],['Statistics','Optimizer evidence for row-count estimates']]},
      {title:'Expensive shapes',items:[['Global sort','Memory + O(n log n); can spill/shuffle'],['Hash join','Build hash state + probe'],['Shuffle/exchange','Network movement in distributed engines'],['Key skew','One partition/task becomes a straggler'],['SELECT *','More I/O; can defeat column pruning/covering indexes']]}
    ]
  },
  {
    id:'dax-context', title:'DAX Context', subtitle:'Why DAX feels harder than SQL', category:'DAX',
    sections:[
      {title:'Evaluation model',items:[['Filter context','Set of visible values from visuals/slicers/relationships/CALCULATE'],['Row context','Current row used by calculated columns and iterators'],['CALCULATE','Modifies filter context before evaluating an expression'],['Context transition','CALCULATE turns current row values into filters'],['SUMX','Iterate rows → evaluate expression → aggregate']]},
      {title:'Model first',items:[['Star schema','Dimensions filter; facts summarize'],['Single direction','Prefer predictable dimension → fact filter flow'],['Measures','Query-time, context-sensitive'],['Calculated columns','Refresh-time, materialized per row'],['Cardinality','High-cardinality columns hurt VertiPaq compression']]}
    ]
  },
  {
    id:'kimball', title:'Kimball Dimensional Modeling', subtitle:'Business process → grain → dimensions → facts', category:'Modeling',
    sections:[
      {title:'Four-step design',items:[['1. Process','Which business activity?'],['2. Grain','Exactly what does one fact row represent?'],['3. Dimensions','Who / what / where / when / how context'],['4. Facts','Numeric measurements valid at that grain']]},
      {title:'Common table patterns',items:[['Transaction fact','One row per event'],['Periodic snapshot','State at fixed intervals'],['Accumulating snapshot','Lifecycle milestones on one evolving row'],['SCD1','Overwrite history'],['SCD2','New effective-dated row for history'],['Role-playing dim','One Date dimension used as Order Date / Ship Date etc.']]}
    ]
  },
  {
    id:'airflow', title:'Airflow DAG', subtitle:'Scheduling, dependencies, retries and debugging', category:'Pipelines',
    sections:[
      {title:'Core model',items:[['DAG','Acyclic task dependency graph'],['Task instance','Task × logical run/data interval'],['>> / <<','Declare dependencies'],['Scheduler','Find runnable task instances'],['Worker','Execute task payload'],['XCom','Small metadata communication—not a data lake']]},
      {title:'Troubleshooting',items:[['Upstream failed','Inspect root failure before downstream symptoms'],['Queued too long','Check pools/concurrency/executor capacity'],['Retry storm','Classify transient vs permanent errors; backoff + jitter'],['Catchup surprise','Understand logical intervals/start_date/schedule'],['Sensor waste','Prefer deferrable patterns for long waits']]}
    ]
  },
  {
    id:'spark', title:'PySpark Performance', subtitle:'Partitions, shuffles, skew and execution shape', category:'Data Engineering',
    sections:[
      {title:'Partition mechanics',items:[['Narrow transform','Each output partition depends on a small number of input partitions'],['Wide transform','Requires shuffle/exchange'],['repartition','Full reshuffle; rebalance/change partition count'],['coalesce','Reduce partition count with less movement'],['Broadcast join','Copy small side to workers'],['Skew','Hot keys overload one downstream partition']]},
      {title:'Before adding hardware',items:[['Filter early','Reduce rows before joins/shuffles'],['Project early','Carry fewer columns'],['Inspect plan','Know where exchanges happen'],['Avoid Python UDF','Prefer built-in column expressions when possible'],['Compact files','Avoid tiny-file overhead']]}
    ]
  },
  {
    id:'storage', title:'Lakehouse Storage', subtitle:'Files are physical execution structures', category:'Storage',
    sections:[
      {title:'Formats',items:[['CSV','Human-readable, no embedded schema, row-oriented text'],['JSON','Nested/self-describing but verbose'],['Avro','Row-oriented binary + schema; common event/stream interchange'],['Parquet','Columnar binary + statistics; analytics-oriented']]},
      {title:'Read less',items:[['Partition pruning','Skip directory/table partitions'],['Column pruning','Read referenced columns only'],['Predicate pushdown','Use metadata to skip row groups/pages'],['Clustering','Co-locate frequently filtered values'],['Compaction','Reduce tiny files into efficient target sizes']]}
    ]
  },
  {
    id:'stats', title:'Statistics Core', subtitle:'The minimum mental toolkit for analytics', category:'Statistics',
    sections:[
      {title:'Describe',items:[['Mean','Sensitive to every value/outliers'],['Median','Middle ordered value; robust to extremes'],['Std. deviation','Typical scale of spread around mean'],['Distribution','Shape matters beyond summary numbers'],['Correlation','Linear association—not causation']]},
      {title:'Infer',items:[['Confidence interval','Uncertainty interval from repeated-sampling procedure'],['p-value','Extremeness under null model—not P(null is true)'],['Type I','False positive'],['Type II','False negative'],['Power','Probability of detecting a real effect under assumptions'],['Bootstrap','Resample observed data to approximate sampling variability']]}
    ]
  },
  {
    id:'ml', title:'Classical ML Algorithms', subtitle:'What it is · when to use · mechanism · failure mode', category:'ML',
    sections:[
      {title:'Supervised',items:[['Linear regression','Continuous target; linear relationship baseline'],['Logistic regression','Probabilistic classification baseline'],['Decision tree','Interpretable nonlinear rules'],['Random forest','Bagged/decorrelated tree ensemble'],['Gradient boosting','Sequential trees correcting residual errors'],['KNN','Local distance-based prediction'],['SVM','Maximum-margin boundary']]},
      {title:'Unsupervised & reduction',items:[['K-means','Centroid-based clustering'],['PCA','Linear projection preserving variance'],['Anomaly scoring','Learn/define normality then rank unusual points']]},
      {title:'Evaluation',items:[['Train/val/test','Separate fitting, tuning and final evaluation'],['Precision/Recall','Trade false positives vs false negatives'],['Confusion matrix','TP/FP/FN/TN foundation'],['Cross-validation','Rotate validation folds'],['Regularization','Constrain capacity to reduce overfit']]}
    ]
  },
  {
    id:'python-core', title:'Python Core for Data Work', subtitle:'Collections, loops and small transformations', category:'Python',
    sections:[
      {title:'Collections',items:[['list','Ordered, mutable sequence; indexing/slicing'],['tuple','Ordered immutable record-like sequence'],['dict','Hash map: key → value lookup'],['set','Unique membership + fast average lookup'],['comprehension','Compact map/filter construction']]},
      {title:'Data-interview patterns',items:[['enumerate','Index + value while iterating'],['zip','Traverse aligned iterables'],['sorted(key=...)','Deterministic custom ordering'],['defaultdict / Counter','Group/count without repeated existence checks'],['generator','Lazy iteration when materializing everything is unnecessary']]}
    ]
  },
  {
    id:'pandas-core', title:'pandas DataFrame', subtitle:'Selection, grouping, joins and reshape', category:'Python / pandas',
    sections:[
      {title:'Shape rows/columns',items:[['loc / iloc','Label-based vs position-based selection'],['query / boolean mask','Filter rows'],['assign / column expression','Create derived columns'],['sort_values','Order rows'],['drop_duplicates','Deduplicate after defining the winning order']]},
      {title:'Combine & summarize',items:[['groupby + agg','Reduce rows by key'],['transform','Group calculation that preserves row count'],['merge','Relational join; use validate when cardinality is known'],['pivot_table','Long → summarized wide table'],['melt','Wide → long normalization for analysis']]}
    ]
  },
  {
    id:'sql-dialects', title:'T-SQL · BigQuery · DuckDB', subtitle:'Same SQL idea, different engine details', category:'SQL',
    sections:[
      {title:'Common differences',items:[['Limit rows','T-SQL TOP/OFFSET-FETCH · BigQuery/DuckDB LIMIT'],['QUALIFY','BigQuery + DuckDB support it; T-SQL generally needs a subquery/CTE for window-result filtering'],['Month truncation','T-SQL DATETRUNC (modern versions) · BigQuery DATE_TRUNC · DuckDB date_trunc'],['External files','Each engine exposes different external-table/file functions—keep this engine-specific']]},
      {title:'Portable mental model',items:[['Relational semantics','Join preservation, grouping grain and NULL logic matter more than keyword spelling'],['Window model','PARTITION BY → ORDER BY → frame'],['Performance','Read less, reduce early, avoid unnecessary sort/shuffle, inspect actual engine plan'],['Determinism','Use explicit ORDER BY/tie breakers where result order or winner matters']]}
    ]
  },
  {
    id:'powerbi-performance', title:'Power BI Performance', subtitle:'Model first, then DAX, then visual/query shape', category:'Power BI',
    sections:[
      {title:'Model checks',items:[['Star schema','Dimensions for filter/group; facts for summarization'],['Cardinality','High-cardinality text/IDs can hurt compression'],['Relationships','Prefer predictable filter propagation and correct cardinality'],['Columns','Remove unused columns; choose efficient data types'],['Grain','Avoid mixing incompatible grains in the same fact table']]},
      {title:'Diagnostic loop',items:[['Performance Analyzer','Identify expensive visuals/queries'],['DAX Studio','Inspect server timings/query plans when available'],['Measure design','Prefer measures to unnecessary materialized columns'],['Iterators','Understand row-by-row formula-engine work'],['Visual density','Too many points/categories can make a good model look slow']]}
    ]
  },
  {
    id:'docker-core', title:'Docker Core', subtitle:'Image → container → volume/network', category:'DevOps',
    sections:[
      {title:'Mental model',items:[['Image','Immutable layered filesystem + metadata'],['Container','Running instance with a writable layer'],['Volume','Persistent state outside container lifecycle'],['Network','Named connectivity/service discovery boundary'],['Registry','Stores and distributes image manifests/layers']]},
      {title:'Useful commands',items:[['docker build -t app .','Build image'],['docker run --rm -p 8080:80 app','Run disposable container + publish port'],['docker ps / logs','Inspect running containers/output'],['docker exec -it <id> sh','Open a shell in a running container'],['docker compose up','Run a multi-container application definition']]}
    ]
  },
  {
    id:'git-vscode', title:'Git + VS Code Shortcuts', subtitle:'The small set worth memorizing', category:'Shortcuts',
    sections:[
      {title:'VS Code',items:[['Ctrl/Cmd+P','Quick open file'],['Ctrl/Cmd+Shift+P','Command palette'],['Shift+Alt/Option+F','Format document'],['F2','Rename symbol'],['Alt/Option+Click','Add cursor'],['Ctrl/Cmd+`','Toggle terminal'],['Ctrl/Cmd+Shift+F','Search workspace']]},
      {title:'Git',items:[['git status','Current working/staging state'],['git diff','Unstaged changes'],['git add .','Stage changes'],['git commit -m','Record staged snapshot'],['git pull --rebase','Update local work cleanly when appropriate'],['git push','Publish commits'],['git log --oneline --graph --decorate','Read compact history graph']]}
    ]
  }
];
