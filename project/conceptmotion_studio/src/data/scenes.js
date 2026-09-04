const code = (...lines) => lines;

export const scenes = {
  'sql-inner-join': {
    renderer:'join', title:'INNER JOIN', subtitle:'Only matched customer_id pairs survive',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    key:{left:0,right:1}, joinType:'inner',
    code:code('SELECT c.customer_id, c.name, o.order_id','FROM Customers c','INNER JOIN Orders o','  ON c.customer_id = o.customer_id;'),
    frames:[
      {caption:'Start with two independent tables. The equality condition is customer_id.',operation:'JOIN KEY',focus:{left:[],right:[]},codeFocus:[2,3]},
      {caption:'C1 finds two matching orders, so one customer row produces two output rows.',operation:'MATCH C1',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[3]},
      {caption:'C2 has no right-side match, so INNER JOIN drops it.',operation:'NO MATCH',focus:{left:[1],right:[]},pairs:[[0,0],[0,1]],codeFocus:[2]},
      {caption:'C3 matches O12 and survives.',operation:'MATCH C3',focus:{left:[2],right:[2]},pairs:[[0,0],[0,1],[2,2]],codeFocus:[3]},
      {caption:'C4 exists only on the order side; INNER JOIN also drops it. Final output contains matched pairs only.',operation:'RESULT',focus:{left:[],right:[]},pairs:[[0,0],[0,1],[2,2]],done:true,codeFocus:[0]}
    ]
  },
  'sql-left-join': {
    renderer:'join', title:'LEFT JOIN', subtitle:'Preserve the left table; unmatched right columns become NULL',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    key:{left:0,right:1}, joinType:'left',
    code:code('SELECT c.customer_id, c.name, o.order_id','FROM Customers c','LEFT JOIN Orders o','  ON c.customer_id = o.customer_id;'),
    frames:[
      {caption:'LEFT JOIN promises that every Customers row appears at least once.',operation:'PRESERVE LEFT',focus:{left:[0,1,2,3],right:[]},codeFocus:[2]},
      {caption:'C1 matches two orders, creating two result rows.',operation:'MATCH',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[3]},
      {caption:'C2 has no order. It still remains, with order_id = NULL.',operation:'NULL EXTEND',focus:{left:[1],right:[]},pairs:[[0,0],[0,1],[1,null]],codeFocus:[2]},
      {caption:'C3 matches. C5 does not, so C5 is also NULL-extended.',operation:'FINISH',focus:{left:[2,3],right:[2]},pairs:[[0,0],[0,1],[1,null],[2,2],[3,null]],done:true,codeFocus:[0]}
    ]
  },
  'sql-right-join': {
    renderer:'join', title:'RIGHT JOIN', subtitle:'Preserve the right table; unmatched left columns become NULL',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    key:{left:0,right:1}, joinType:'right',
    code:code('SELECT c.customer_id, c.name, o.order_id','FROM Customers c','RIGHT JOIN Orders o','  ON c.customer_id = o.customer_id;'),
    frames:[
      {caption:'RIGHT JOIN guarantees that every Orders row appears at least once.',operation:'PRESERVE RIGHT',focus:{left:[],right:[0,1,2,3]},codeFocus:[2]},
      {caption:'O10 and O11 both match customer C1, so C1 is repeated for two order rows.',operation:'MATCH C1',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[3]},
      {caption:'O12 matches C3 normally.',operation:'MATCH C3',focus:{left:[2],right:[2]},pairs:[[0,0],[0,1],[2,2]],codeFocus:[3]},
      {caption:'O13 references C4, which is absent from Customers. The order survives and customer columns become NULL.',operation:'NULL EXTEND LEFT',focus:{left:[],right:[3]},pairs:[[0,0],[0,1],[2,2],[null,3]],done:true,codeFocus:[2]}
    ]
  },
  'sql-full-join': {
    renderer:'join', title:'FULL OUTER JOIN', subtitle:'Preserve matches plus unmatched rows from both sides',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    key:{left:0,right:1}, joinType:'full',
    code:code('SELECT c.customer_id, c.name, o.order_id','FROM Customers c','FULL OUTER JOIN Orders o','  ON c.customer_id = o.customer_id;'),
    frames:[
      {caption:'FULL OUTER JOIN starts with the promise to preserve unmatched rows from either input.',operation:'PRESERVE BOTH',focus:{left:[0,1,2,3],right:[0,1,2,3]},codeFocus:[2]},
      {caption:'Matched keys combine exactly like an INNER JOIN. C1 produces two rows and C3 produces one.',operation:'MATCHES',focus:{left:[0,2],right:[0,1,2]},pairs:[[0,0],[0,1],[2,2]],codeFocus:[3]},
      {caption:'C2 and C5 have no order, so their right-side columns are NULL.',operation:'LEFT-ONLY ROWS',focus:{left:[1,3],right:[]},pairs:[[0,0],[0,1],[2,2],[1,null],[3,null]],codeFocus:[2]},
      {caption:'O13 has no customer, so the left-side columns are NULL. Final output is the union of matched and unmatched preservation rules.',operation:'RIGHT-ONLY ROW',focus:{left:[],right:[3]},pairs:[[0,0],[0,1],[2,2],[1,null],[3,null],[null,3]],done:true,codeFocus:[0,2]}
    ]
  },
  'sql-cross-join': {
    renderer:'join', title:'CROSS JOIN', subtitle:'Cartesian product: every left row pairs with every right row',
    left:{title:'Sizes',columns:['size'],rows:[['S'],['M'],['L']]},
    right:{title:'Colors',columns:['color'],rows:[['Blue'],['Red']]},
    joinType:'cross',
    code:code('SELECT s.size, c.color','FROM Sizes s','CROSS JOIN Colors c;'),
    frames:[
      {caption:'There is no equality predicate. Start with three sizes and two colors.',operation:'3 × 2 INPUTS',focus:{left:[0,1,2],right:[0,1]},codeFocus:[1,2]},
      {caption:'S pairs with every color.',operation:'EXPAND S',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[2]},
      {caption:'M and L do the same. Result cardinality is left rows × right rows = 6.',operation:'CARTESIAN PRODUCT',focus:{left:[1,2],right:[0,1]},pairs:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],done:true,codeFocus:[0,2]}
    ]
  },
  'sql-semi-join': {
    renderer:'join', title:'Semi join / EXISTS', subtitle:'Return left rows that have at least one match without multiplying them',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    joinType:'semi',
    code:code('SELECT c.*','FROM Customers c','WHERE EXISTS (','  SELECT 1 FROM Orders o','  WHERE o.customer_id = c.customer_id',');'),
    frames:[
      {caption:'A semi join asks only whether at least one right-side match exists for each left row.',operation:'EXISTENCE TEST',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[2,3,4]},
      {caption:'C1 has two orders, but the output still contains C1 only once because right-side rows are not projected.',operation:'KEEP C1 ONCE',focus:{left:[0],right:[0,1]},pairs:[[0,0],[0,1]],codeFocus:[0,2]},
      {caption:'C2 has no match and is removed; C3 has a match and survives.',operation:'FILTER LEFT',focus:{left:[1,2],right:[2]},pairs:[[0,0],[0,1],[2,2]],codeFocus:[2,4]},
      {caption:'Final left output is C1 and C3. Semi joins are often expressed with EXISTS.',operation:'RESULT',focus:{left:[0,2],right:[]},pairs:[[0,0],[2,2]],done:true,codeFocus:[0]}
    ]
  },
  'sql-anti-join': {
    renderer:'join', title:'Anti join / NOT EXISTS', subtitle:'Return left rows that have no matching right-side key',
    left:{title:'Customers',columns:['customer_id','name'],rows:[['C1','Ana'],['C2','Ben'],['C3','Chen'],['C5','Dina']]},
    right:{title:'Orders',columns:['order_id','customer_id'],rows:[['O10','C1'],['O11','C1'],['O12','C3'],['O13','C4']]},
    joinType:'anti',
    code:code('SELECT c.*','FROM Customers c','WHERE NOT EXISTS (','  SELECT 1 FROM Orders o','  WHERE o.customer_id = c.customer_id',');'),
    frames:[
      {caption:'An anti join asks which left rows fail the existence test.',operation:'NOT EXISTS',focus:{left:[0,1,2,3],right:[]},codeFocus:[2,3,4]},
      {caption:'C1 and C3 find matches, so the anti join excludes them.',operation:'EXCLUDE MATCHES',focus:{left:[0,2],right:[0,1,2]},pairs:[[0,0],[0,1],[2,2]],codeFocus:[4]},
      {caption:'C2 and C5 have no matching order keys, so they survive.',operation:'KEEP UNMATCHED LEFT',focus:{left:[1,3],right:[]},pairs:[[1,null],[3,null]],done:true,codeFocus:[0,2]}
    ]
  },
  'sql-window-concept': {
    renderer:'window', title:'Window function frame', subtitle:'The rows stay rows; only the calculation frame moves',
    columns:['month','region','revenue'], rows:[['Jan','North',120],['Feb','North',180],['Mar','North',90],['Apr','North',210],['May','North',160],['Jun','North',240]],
    code:code('SUM(revenue) OVER (','  PARTITION BY region','  ORDER BY month','  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW',') AS rolling_3'),
    frames:[
      {cursor:0,active:[0],metric:120,caption:'At Jan, only the current row exists inside the frame.',operation:'FRAME Jan',codeFocus:[3]},
      {cursor:1,active:[0,1],metric:300,caption:'At Feb, the frame contains Jan + Feb.',operation:'FRAME Jan–Feb',codeFocus:[3]},
      {cursor:2,active:[0,1,2],metric:390,caption:'At Mar, the full three-row frame is available.',operation:'FRAME Jan–Mar',codeFocus:[3]},
      {cursor:3,active:[1,2,3],metric:480,caption:'At Apr, Jan exits while Apr enters. The table still has six rows.',operation:'SLIDE',codeFocus:[2,3]},
      {cursor:5,active:[3,4,5],metric:610,caption:'Final frame: Apr–Jun. Each row receives its own calculation.',operation:'RESULT',codeFocus:[0,4]}
    ]
  },
  'sql-rank': {
    renderer:'rank', title:'RANK vs DENSE_RANK', subtitle:'Ties consume positions differently',
    rows:[['Ana',100],['Ben',95],['Chen',95],['Dina',80]],
    code:code('RANK() OVER (ORDER BY score DESC)','DENSE_RANK() OVER (ORDER BY score DESC)'),
    frames:[
      {upto:0,caption:'Top score gets rank 1 in both systems.',operation:'1 / 1',codeFocus:[0,1]},
      {upto:2,caption:'Ben and Chen tie at 95. Both receive rank 2.',operation:'TIE AT 2',codeFocus:[0,1]},
      {upto:3,caption:'RANK skips position 3 and gives Dina 4; DENSE_RANK gives Dina 3.',operation:'4 vs 3',codeFocus:[0,1]}
    ]
  },
  'sql-btree-index': {
    renderer:'btree', title:'B-tree index seek', subtitle:'Discard entire ranges instead of scanning every row',
    values:[5,12,18,24,31,39,45,52,61,68,73,80,88,94],target:73,
    tree:{label:'45',children:[{label:'18',children:[{label:'5 · 12'},{label:'24 · 31 · 39'}]},{label:'73',children:[{label:'52 · 61 · 68'},{label:'73 · 80 · 88 · 94'}]}]},
    code:code('CREATE INDEX ix_users_age ON users(age);','SELECT * FROM users','WHERE age = 73;'),
    frames:[
      {visited:[],caption:'Without an index, a table scan may inspect rows until the predicate is resolved.',operation:'SCAN O(n)',scan:1,codeFocus:[1,2]},
      {visited:['45'],caption:'The index root compares 73 with 45 and discards the entire left range.',operation:'ROOT',codeFocus:[0]},
      {visited:['45','73'],caption:'One internal hop narrows the search to the right leaf range.',operation:'NARROW',codeFocus:[0]},
      {visited:['45','73','73 · 80 · 88 · 94'],caption:'The leaf contains 73, then the engine follows its row locator. The tree is shallow, so lookup work grows logarithmically.',operation:'SEEK O(log n)',done:true,codeFocus:[2]}
    ]
  },
  'sql-query-plan': {
    renderer:'plan', title:'Query execution plan', subtitle:'Read operators as data flow, not a decorative tree',
    nodes:[
      {id:'scanF',label:'Fact Scan',meta:'8.2M rows',x:80,y:330},{id:'filter',label:'Date Filter',meta:'640k rows',x:270,y:330},
      {id:'scanD',label:'Dim Seek',meta:'420 rows',x:270,y:120},{id:'join',label:'Hash Join',meta:'640k → 620k',x:480,y:230},
      {id:'agg',label:'Aggregate',meta:'620k → 28',x:680,y:230},{id:'sort',label:'Sort',meta:'28 rows',x:835,y:230}
    ], links:[['scanF','filter'],['filter','join'],['scanD','join'],['join','agg'],['agg','sort']],
    code:code('SELECT region, SUM(revenue)','FROM fact_sales f','JOIN dim_store d ON f.store_id=d.store_id','WHERE sale_date >= DATE \'2026-01-01\'','GROUP BY region','ORDER BY SUM(revenue) DESC;'),
    frames:[
      {active:['scanF'],caption:'Begin at the leaves: the fact scan reads the large input.',operation:'SCAN',codeFocus:[1]},
      {active:['filter','scanD'],caption:'A selective date predicate reduces the fact stream while the dimension uses a small seek.',operation:'REDUCE EARLY',codeFocus:[2,3]},
      {active:['join'],caption:'The join combines streams. Compare estimated vs actual rows here when diagnosing bad plans.',operation:'JOIN',codeFocus:[2]},
      {active:['agg'],caption:'Aggregation collapses hundreds of thousands of rows into a few groups.',operation:'AGGREGATE',codeFocus:[0,4]},
      {active:['sort'],caption:'The final sort is cheap because only 28 grouped rows remain.',operation:'SORT LAST',codeFocus:[5]}
    ]
  },
  'pyspark-shuffle': {
    renderer:'partition', title:'Spark shuffle', subtitle:'Same keys must meet on the same downstream partition',
    buckets:['Input P0','Input P1','Input P2','Output P0','Output P1','Output P2'],
    records:[['A',100,0],['B',50,0],['A',80,1],['C',40,1],['B',70,2],['A',20,2]],
    destinations:{A:3,B:4,C:5},
    code:code('df.groupBy("customer_id")','  .agg(F.sum("amount"))'),
    frames:[
      {phase:0,caption:'Initially the same customer_id appears in several input partitions.',operation:'LOCAL INPUT',codeFocus:[0]},
      {phase:1,caption:'groupBy is a wide transformation: Spark hashes the grouping key to a target partition.',operation:'HASH KEY',codeFocus:[0]},
      {phase:2,caption:'Rows cross executor/network boundaries so every A, B and C can be aggregated together.',operation:'SHUFFLE',codeFocus:[0,1]},
      {phase:3,caption:'After redistribution, each reducer can aggregate its key locally. Watch for hot keys that overload one partition.',operation:'LOCAL AGG',codeFocus:[1]}
    ]
  },
  'pyspark-broadcast': {
    renderer:'broadcast', title:'Broadcast join', subtitle:'Move the tiny table instead of shuffling the huge one',
    workers:['Worker 1','Worker 2','Worker 3'], factRows:[420,390,415],dimMB:18,
    code:code('from pyspark.sql.functions import broadcast','result = fact.join(','  broadcast(dim), "product_id"',')'),
    frames:[
      {phase:0,caption:'The fact table is already distributed across workers; the 18 MB dimension is small.',operation:'COMPARE SIZES',codeFocus:[1,2]},
      {phase:1,caption:'Broadcast sends one small dimension copy to each worker.',operation:'BROADCAST 18 MB',codeFocus:[0,2]},
      {phase:2,caption:'Each worker joins locally with its existing fact partition, avoiding a massive fact shuffle.',operation:'LOCAL JOIN',codeFocus:[1,2]},
      {phase:3,caption:'Broadcast does not solve fact-side hot-key skew; size and cardinality still matter.',operation:'CHECK SKEW',codeFocus:[1]}
    ]
  },
  'polars-lazy': {
    renderer:'pipeline', title:'Polars lazy optimization', subtitle:'Describe work first; optimize the logical plan before execution',
    stages:['scan parquet','select 8 columns','filter country=NO','group_by customer','sum revenue'],
    optimized:['scan parquet\n(columns 2/40)','predicate pushdown\ncountry=NO','group_by customer','sum revenue'],
    code:code('pl.scan_parquet("sales/*.parquet")','.select(["customer","country","revenue"])','.filter(pl.col("country") == "NO")','.group_by("customer")','.agg(pl.col("revenue").sum())','.collect()'),
    frames:[
      {phase:0,caption:'The lazy API first builds a logical query plan instead of executing each call immediately.',operation:'BUILD PLAN',codeFocus:[0,1,2,3,4]},
      {phase:1,caption:'The optimizer notices only three columns are needed and pushes projection into the scan.',operation:'COLUMN PRUNING',codeFocus:[1]},
      {phase:2,caption:'The country predicate is pushed toward the data source so fewer rows flow downstream.',operation:'PREDICATE PUSHDOWN',codeFocus:[2]},
      {phase:3,caption:'collect() executes the optimized plan rather than the literal call-by-call sequence.',operation:'EXECUTE',codeFocus:[5]}
    ]
  },
  'dax-filter-context': {
    renderer:'dax', title:'DAX filter context', subtitle:'A measure sees the subset created by slicers, axes, relationships and CALCULATE',
    dimensions:{Region:['North','South'],Year:['2025','2026']},fact:[['North','2025',120],['North','2026',180],['South','2025',80],['South','2026',140]],
    code:code('Revenue := SUM(Sales[Revenue])','Revenue 2026 :=','CALCULATE([Revenue], Calendar[Year] = 2026)'),
    frames:[
      {filters:{},caption:'With no external filter, [Revenue] sees all four fact rows: 520.',operation:'BASE CONTEXT',metric:520,codeFocus:[0]},
      {filters:{Region:'North'},caption:'A Region slicer filters the Region dimension, then the relationship restricts fact rows to North: 300.',operation:'SLICER FILTER',metric:300,codeFocus:[0]},
      {filters:{Region:'North',Year:'2026'},caption:'A visual axis or slicer adds Year=2026. Intersection leaves one row: 180.',operation:'INTERSECT',metric:180,codeFocus:[0]},
      {filters:{Region:'North'},calc:{Year:'2026'},caption:'CALCULATE modifies filter context during measure evaluation, producing the North/2026 intersection.',operation:'CALCULATE',metric:180,codeFocus:[1,2]}
    ]
  },
  'dax-calculate': {
    renderer:'dax', title:'CALCULATE modifies context', subtitle:'Expression first conceptually, but filters define the environment in which it is evaluated',
    dimensions:{Product:['A','B'],Channel:['Online','Store']},fact:[['A','Online',100],['A','Store',60],['B','Online',80],['B','Store',40]],
    code:code('All Channel Revenue :=','CALCULATE(','  [Revenue],','  REMOVEFILTERS(Sales[Channel])',')'),
    frames:[
      {filters:{Product:'A',Channel:'Online'},caption:'Current visual cell: Product A + Online. [Revenue] = 100.',operation:'CURRENT CELL',metric:100,codeFocus:[2]},
      {filters:{Product:'A',Channel:'Online'},remove:['Channel'],caption:'REMOVEFILTERS(Channel) removes only the channel restriction; Product A stays filtered.',operation:'MODIFY CONTEXT',metric:160,codeFocus:[1,3]},
      {filters:{Product:'A'},caption:'The measure now evaluates over A/Online + A/Store = 160.',operation:'EVALUATE',metric:160,codeFocus:[0,1,2,3,4]}
    ]
  },
  'model-star-schema': {
    renderer:'star', title:'Star schema & filter propagation', subtitle:'Dimensions filter; the fact table summarizes at a declared grain',
    fact:{label:'FactSales',fields:['DateKey','ProductKey','StoreKey','Qty','Revenue'],x:470,y:220},
    dims:[
      {id:'date',label:'DimDate',fields:['DateKey','Year','Month'],x:80,y:75},
      {id:'product',label:'DimProduct',fields:['ProductKey','Category','Brand'],x:80,y:330},
      {id:'store',label:'DimStore',fields:['StoreKey','Region','City'],x:790,y:220}
    ],
    code:code('Grain: one row per sale line','DimProduct (1) → (*) FactSales','DimDate    (1) → (*) FactSales','DimStore   (1) → (*) FactSales'),
    frames:[
      {active:[],caption:'Start by declaring fact grain: one row represents one sale line.',operation:'DECLARE GRAIN',codeFocus:[0]},
      {active:['product'],caption:'A Category slicer filters DimProduct first.',operation:'FILTER DIMENSION',codeFocus:[1]},
      {active:['product','fact'],caption:'The one-to-many relationship propagates matching ProductKey values into FactSales.',operation:'PROPAGATE',codeFocus:[1]},
      {active:['date','product','fact'],caption:'Date and Product filters intersect at the fact table; measures aggregate only surviving fact rows.',operation:'INTERSECT + SUMMARIZE',codeFocus:[1,2]}
    ]
  },
  'model-scd2': {
    renderer:'interval', title:'SCD Type 2', subtitle:'Preserve dimension history with non-overlapping effective intervals',
    rows:[['C-042','Oslo','2024-01-01','9999-12-31',true]],incoming:['C-042','Bergen','2026-09-04'],
    code:code('-- detect tracked attribute change','UPDATE dim_customer','SET valid_to = DATE \'2026-09-04\', is_current = 0','WHERE customer_id = \'C-042\' AND is_current = 1;','INSERT new Bergen version with valid_from = 2026-09-04;'),
    frames:[
      {phase:0,caption:'Before the change, C-042 has one current Oslo version with an open-ended interval.',operation:'CURRENT VERSION',codeFocus:[0]},
      {phase:1,caption:'Incoming source data says the tracked city changed from Oslo to Bergen.',operation:'DETECT CHANGE',codeFocus:[0]},
      {phase:2,caption:'Close the Oslo row at the change boundary. Historical facts can still resolve to Oslo.',operation:'EXPIRE OLD',codeFocus:[1,2,3]},
      {phase:3,caption:'Insert a new Bergen row starting at the same boundary. One current row, full history, no interval overlap.',operation:'INSERT NEW',codeFocus:[4]}
    ]
  },
  'de-idempotency': {
    renderer:'idempotency', title:'Idempotent pipeline write', subtitle:'Retry the same batch without changing the final answer twice',
    input:[['E1',100],['E2',80],['E3',60]], target:[['E1',100],['E2',80]],
    code:code('MERGE target t','USING batch s ON t.event_id = s.event_id','WHEN MATCHED THEN UPDATE SET ...','WHEN NOT MATCHED THEN INSERT ...;'),
    frames:[
      {phase:0,caption:'The target already contains E1 and E2; a retry batch contains E1, E2 and new E3.',operation:'RETRY INPUT',codeFocus:[0,1]},
      {phase:1,caption:'Blind APPEND would duplicate E1 and E2. Stable event_id identity lets MERGE distinguish existing rows.',operation:'MATCH KEYS',codeFocus:[1]},
      {phase:2,caption:'Existing keys update deterministically; E3 inserts once.',operation:'MERGE',codeFocus:[2,3]},
      {phase:3,caption:'Run the exact same batch again: target state is unchanged. That is the useful idempotency invariant.',operation:'SAME FINAL STATE',codeFocus:[0,1,2,3]}
    ]
  },
  'de-watermark': {
    renderer:'watermark', title:'Event-time watermark', subtitle:'Bound late-data state without pretending arrival order equals event time',
    events:[{id:'A',event:1,arrival:1},{id:'B',event:3,arrival:2},{id:'C',event:2,arrival:4},{id:'D',event:7,arrival:5},{id:'E',event:4,arrival:8}],allowed:2,
    code:code('events.withWatermark("event_time", "2 minutes")','.groupBy(window("event_time", "5 minutes"))','.count()'),
    frames:[
      {t:1,caption:'Event A arrives on time. Maximum observed event_time is 1.',operation:'MAX EVENT = 1',codeFocus:[0]},
      {t:2,caption:'B has event_time 3, so the watermark can advance to roughly 1 when allowed lateness is 2.',operation:'WATERMARK ≈ 1',codeFocus:[0]},
      {t:4,caption:'C arrives late but event_time 2 is still newer than the watermark, so the system can incorporate it.',operation:'ACCEPT LATE',codeFocus:[0,1]},
      {t:8,caption:'E arrives very late with event_time 4 after progress reached 7; depending on the exact engine/window semantics it may be beyond retained state.',operation:'TOO LATE?',codeFocus:[0,1,2]}
    ]
  },
  'dag-topological': {
    renderer:'dag', title:'Airflow DAG readiness', subtitle:'Dependencies are state constraints, not just arrows',
    nodes:[['extract',100,220],['orders',320,120],['customers',320,320],['model',540,220],['quality',710,220],['publish',850,220]],
    links:[['extract','orders'],['extract','customers'],['orders','model'],['customers','model'],['model','quality'],['quality','publish']],
    code:code('extract >> [clean_orders, clean_customers]','[clean_orders, clean_customers] >> model','model >> quality >> publish'),
    frames:[
      {done:[],active:['extract'],caption:'Only extract is initially ready; all downstream tasks are blocked by dependencies.',operation:'READY',codeFocus:[0]},
      {done:['extract'],active:['orders','customers'],caption:'Extract succeeds, unlocking two independent branches that can run in parallel.',operation:'FAN OUT',codeFocus:[0]},
      {done:['extract','orders'],active:['customers'],caption:'Orders finishes, but model stays blocked because customers is unfinished.',operation:'WAIT FOR ALL',codeFocus:[1]},
      {done:['extract','orders','customers'],active:['model'],caption:'Both upstream dependencies are satisfied; model becomes runnable.',operation:'UNLOCK',codeFocus:[1]},
      {done:['extract','orders','customers','model','quality','publish'],active:[],caption:'Quality gates publication. The same graph can visualize retries, skipped states and trigger rules.',operation:'COMPLETE',codeFocus:[2]}
    ]
  },
  'dag-failure-propagation': {
    renderer:'dag', title:'DAG failure propagation', subtitle:'One red node can block, skip or reroute downstream work',
    nodes:[['extract',100,220],['orders',320,120],['customers',320,320],['model',540,220],['quality',710,220],['publish',850,220]],
    links:[['extract','orders'],['extract','customers'],['orders','model'],['customers','model'],['model','quality'],['quality','publish']],
    code:code('clean_orders = task(retries=2, retry_delay=...)','model = task(trigger_rule="all_success")','alert = task(trigger_rule="one_failed")'),
    frames:[
      {done:['extract'],active:['orders','customers'],caption:'Two cleaning branches start after extraction succeeds.',operation:'RUN',codeFocus:[0]},
      {done:['extract','customers'],failed:['orders'],active:[],caption:'clean_orders fails after retries. With all_success, model is not ready.',operation:'FAILED',codeFocus:[0,1]},
      {done:['extract','customers'],failed:['orders'],blocked:['model','quality','publish'],caption:'The failure propagates through the main path. An alert branch with one_failed could still execute.',operation:'BLOCK DOWNSTREAM',codeFocus:[1,2]},
      {done:['extract','orders','customers'],active:['model'],caption:'After a successful rerun/backfill of orders, dependency state is repaired and model can proceed.',operation:'RECOVER',codeFocus:[1]}
    ]
  },
  'storage-parquet-layout': {
    renderer:'storage', title:'Parquet row groups & column chunks', subtitle:'Columnar layout makes selective analytics possible',
    columns:['customer_id','country','revenue','payload_json'], rowGroups:[{rows:'1–50k',country:['NO','SE'],revenue:[2,980]},{rows:'50k–100k',country:['DK','FI'],revenue:[1,870]},{rows:'100k–150k',country:['NO'],revenue:[5,1200]}],
    code:code('SELECT customer_id, revenue','FROM read_parquet(\'sales.parquet\')','WHERE country = \'NO\' AND revenue > 500;'),
    frames:[
      {phase:0,caption:'Parquet stores rows in row groups, but data inside each row group is organized by column chunks/pages.',operation:'PHYSICAL LAYOUT',codeFocus:[1]},
      {phase:1,caption:'Column pruning means payload_json never needs to be read because the query requests only customer_id, country and revenue.',operation:'COLUMN PRUNING',codeFocus:[0,2]},
      {phase:2,caption:'Row-group statistics show the DK/FI group cannot satisfy country = NO, so the reader skips it entirely.',operation:'PREDICATE PUSHDOWN',codeFocus:[2]},
      {phase:3,caption:'Only qualifying column chunks from possible row groups reach the execution engine.',operation:'READ LESS DATA',codeFocus:[0,1,2]}
    ]
  },
  'storage-delta-log': {
    renderer:'delta', title:'Delta transaction log', subtitle:'The table snapshot is metadata + immutable data files, not “one mutable file”',
    code:code('version 10: add file A, add file B','version 11: remove file A, add file C','version 12: add file D'),
    frames:[
      {version:10,caption:'Version 10 references files A + B. The table snapshot is defined by logged actions.',operation:'SNAPSHOT v10',codeFocus:[0]},
      {version:11,caption:'An update can logically remove A and add replacement file C without mutating A in place.',operation:'COMMIT v11',codeFocus:[1]},
      {version:12,caption:'A new append adds D. Readers choose a consistent transaction-log version and its active file set.',operation:'SNAPSHOT v12',codeFocus:[2]},
      {version:'time-travel',caption:'Because old log versions describe prior active file sets, time travel can reconstruct historical snapshots while files remain retained.',operation:'TIME TRAVEL',codeFocus:[0,1,2]}
    ]
  },
  'algo-binary-search': {
    renderer:'binary', title:'Binary search', subtitle:'Every comparison proves half the search space impossible',
    values:[3,7,11,18,24,31,42,53,67,71,88,95],target:71,
    code:code('lo, hi = 0, len(a) - 1','while lo <= hi:','    mid = (lo + hi) // 2','    if a[mid] < target: lo = mid + 1','    elif a[mid] > target: hi = mid - 1','    else: return mid'),
    frames:[
      {lo:0,hi:11,mid:5,caption:'mid=5 → 31. Target 71 is larger, so indices 0–5 can never contain the answer.',operation:'DISCARD LEFT HALF',codeFocus:[1,2,3]},
      {lo:6,hi:11,mid:8,caption:'mid=8 → 67. Still too small; discard 6–8.',operation:'DISCARD LEFT',codeFocus:[2,3]},
      {lo:9,hi:11,mid:10,caption:'mid=10 → 88. Too large; discard 10–11.',operation:'DISCARD RIGHT',codeFocus:[2,4]},
      {lo:9,hi:9,mid:9,caption:'mid=9 → 71. Found after four comparisons instead of scanning twelve values.',operation:'FOUND',codeFocus:[5]}
    ]
  },
  'sort-bubble': {
    renderer:'array', title:'Bubble sort storyboard', subtitle:'Compare + swap + synchronized pseudocode',
    values:[6,3,8,4,2],
    code:code('for end in range(n-1, 0, -1):','    for i in range(end):','        if a[i] > a[i+1]:','            a[i], a[i+1] = a[i+1], a[i]'),
    frames:[
      {order:[0,1,2,3,4],focus:[0,1],caption:'Compare 6 and 3. They are inverted.',operation:'COMPARE',codeFocus:[1,2]},
      {order:[1,0,2,3,4],focus:[0,1],caption:'Swap 6 and 3. The values physically exchange positions while the same objects keep stable IDs.',operation:'SWAP',codeFocus:[3]},
      {order:[1,0,2,3,4],focus:[1,2],caption:'Compare 6 and 8. Already ordered, so the array does not move.',operation:'COMPARE',codeFocus:[2]},
      {order:[1,0,3,2,4],focus:[2,3],caption:'8 > 4, so 8 moves one position to the right.',operation:'SWAP',codeFocus:[3]},
      {order:[1,0,3,4,2],focus:[3,4],caption:'8 > 2. The first pass bubbles the largest value to the final slot.',operation:'PASS 1 COMPLETE',done:[2],codeFocus:[0,3]},
      {order:[1,3,0,4,2],focus:[1,2],caption:'On the second pass, 6 > 4, so 6 moves right. The settled 8 is no longer scanned.',operation:'PASS 2 · SWAP',done:[2],codeFocus:[0,1,2,3]},
      {order:[1,3,4,0,2],focus:[2,3],caption:'6 > 2. Now the two largest values are fixed at the right edge.',operation:'PASS 2 COMPLETE',done:[0,2],codeFocus:[0,3]},
      {order:[1,4,3,0,2],focus:[1,2],caption:'The next pass swaps 4 and 2, leaving the sorted suffix untouched.',operation:'PASS 3 COMPLETE',done:[3,0,2],codeFocus:[0,3]},
      {order:[4,1,3,0,2],focus:[0,1],caption:'Final comparison: 3 > 2. The array is now fully sorted: 2, 3, 4, 6, 8.',operation:'SORTED',done:[0,1,2,3,4],codeFocus:[0,1,2,3]}
    ]
  },
  'stat-clt': {
    renderer:'sampling', title:'Central Limit Theorem', subtitle:'The sampling distribution can become bell-shaped even when raw data is not',
    population:[1,1,1,2,2,3,5,8,13,21],
    code:code('sample = rng.choice(population, size=n, replace=True)','means.append(sample.mean())'),
    frames:[
      {n:1,reps:40,caption:'With n=1, sample means look like the skewed source population.',operation:'n = 1',codeFocus:[0,1]},
      {n:3,reps:120,caption:'Averaging three draws reduces extremes and the distribution begins to smooth.',operation:'n = 3',codeFocus:[0,1]},
      {n:10,reps:300,caption:'With larger n, sample means cluster more tightly around the population mean.',operation:'n = 10',codeFocus:[0,1]},
      {n:30,reps:600,caption:'The sampling distribution is approximately normal here and its standard error is smaller.',operation:'n = 30',codeFocus:[1]}
    ]
  },
  'ml-linear-regression': {
    renderer:'scatter', title:'Linear regression', subtitle:'Move the line to reduce residual error',
    points:[[1,2.1],[2,2.9],[3,4.2],[4,4.8],[5,6.2],[6,6.8],[7,8.1]],
    code:code('y_hat = b0 + b1 * x','loss = mean((y - y_hat) ** 2)','update b0, b1 to reduce loss'),
    frames:[
      {b0:0.5,b1:0.7,caption:'A poor initial line leaves large vertical residuals.',operation:'HIGH MSE',codeFocus:[0,1]},
      {b0:0.7,b1:0.95,caption:'Adjusting slope/intercept reduces squared residual error.',operation:'LOWER LOSS',codeFocus:[1,2]},
      {b0:1.0,b1:1.02,caption:'The fitted line captures the dominant linear relationship without passing through every point.',operation:'FIT',codeFocus:[0,1]}
    ]
  },
  'ml-logistic-regression': {
    renderer:'sigmoid', title:'Logistic regression', subtitle:'Linear score → sigmoid probability → threshold decision',
    xs:[-5,-3,-2,-1,0,1,2,3,5],
    code:code('z = b0 + b1*x','p = 1 / (1 + exp(-z))','prediction = p >= threshold'),
    frames:[
      {threshold:.5,caption:'A linear score z can take any real value.',operation:'LINEAR SCORE z',codeFocus:[0]},
      {threshold:.5,caption:'The sigmoid maps z into a probability between 0 and 1.',operation:'SIGMOID',codeFocus:[1]},
      {threshold:.5,showThreshold:true,caption:'A threshold converts probabilities into actions/classes. 0.5 is a convention, not a universal optimum.',operation:'THRESHOLD 0.50',codeFocus:[2]},
      {threshold:.75,showThreshold:true,caption:'Raising the threshold reduces predicted positives and usually trades recall for precision.',operation:'THRESHOLD 0.75',codeFocus:[2]}
    ]
  },
  'ml-decision-tree': {
    renderer:'decisionTree', title:'Decision tree', subtitle:'Each split partitions feature space into simpler regions',
    points:[['sunny',80,'No'],['sunny',60,'Yes'],['rain',80,'No'],['rain',45,'Yes'],['overcast',70,'Yes'],['sunny',50,'Yes']],
    code:code('choose split with largest impurity reduction','recurse on child subsets','leaf predicts class/value'),
    frames:[
      {phase:0,caption:'All training rows start together at the root and may be mixed in class label.',operation:'ROOT',codeFocus:[0]},
      {phase:1,caption:'Split on Outlook to create more homogeneous child groups.',operation:'SPLIT Outlook',codeFocus:[0]},
      {phase:2,caption:'The Sunny branch is still mixed, so split again on Humidity.',operation:'RECURSE',codeFocus:[1]},
      {phase:3,caption:'Leaves stop according to purity/depth/sample rules and store the final prediction.',operation:'LEAF',codeFocus:[2]}
    ]
  },
  'ml-random-forest': {
    renderer:'forest', title:'Random forest', subtitle:'Decorrelated trees vote/average to reduce variance',
    code:code('for tree in forest:','    sample rows with replacement','    sample candidate features at each split','prediction = aggregate(tree_predictions)'),
    frames:[
      {trees:1,caption:'One deep tree can fit quirks of one training sample.',operation:'TREE 1',codeFocus:[0,1]},
      {trees:3,caption:'Bootstrap samples and random feature subsets make trees different from each other.',operation:'DECORRELATE',codeFocus:[1,2]},
      {trees:7,caption:'Many diverse trees produce different boundaries/predictions.',operation:'ENSEMBLE',codeFocus:[0,2]},
      {trees:7,vote:true,caption:'Classification uses voting; regression averages predictions. Aggregation stabilizes the final result.',operation:'VOTE / AVERAGE',codeFocus:[3]}
    ]
  },
  'ml-kmeans': {
    renderer:'kmeans', title:'K-means clustering', subtitle:'Assign points → recenter centroids → repeat',
    points:[[1,1],[1.5,1.7],[2,1.1],[7,7],[7.8,6.5],[8.4,7.8],[4.5,4.4]],
    code:code('assign each point to nearest centroid','centroid = mean(points in cluster)','repeat until movement is small'),
    frames:[
      {centroids:[[1,7],[8,1]],caption:'Start with two initial centroids. Initialization is part of the problem.',operation:'INIT',codeFocus:[0]},
      {centroids:[[1,7],[8,1]],assign:true,caption:'Assign every point to its nearest centroid under the chosen distance metric.',operation:'ASSIGN',codeFocus:[0]},
      {centroids:[[2.25,2.05],[7.73,7.1]],assign:true,caption:'Move each centroid to the mean of its assigned points.',operation:'RECENTER',codeFocus:[1]},
      {centroids:[[2.25,2.05],[7.73,7.1]],assign:true,done:true,caption:'Repeat assignment/recentering until movement becomes tiny. Scaling and K choice strongly affect the result.',operation:'CONVERGE',codeFocus:[2]}
    ]
  },
  'ml-pca': {
    renderer:'pca', title:'PCA', subtitle:'Rotate the axis to preserve maximum variance',
    points:[[-3,-2.2],[-2,-1.2],[-1,-1.0],[0,.2],[1,.8],[2,1.9],[3,2.5]],
    code:code('center / scale X','compute covariance or SVD','choose eigenvector / singular vector with largest variance','project X onto component'),
    frames:[
      {angle:0,caption:'A horizontal candidate axis captures only part of the elongated cloud.',operation:'CANDIDATE AXIS',codeFocus:[0,1]},
      {angle:20,caption:'Rotate the axis and project points onto it; projected variance increases.',operation:'ROTATE',codeFocus:[1,2]},
      {angle:38,caption:'PC1 aligns with the direction of maximum variance.',operation:'MAX VARIANCE',codeFocus:[2]},
      {angle:38,project:true,caption:'Each original 2D point can now be represented by its coordinate along PC1, reducing dimensionality.',operation:'PROJECT',codeFocus:[3]}
    ]
  },
  'ml-confusion-matrix': {
    renderer:'matrix', title:'Confusion matrix', subtitle:'Every classification metric is built from four cells',
    values:{TP:42,FP:8,FN:13,TN:137},
    code:code('precision = TP / (TP + FP)','recall = TP / (TP + FN)','specificity = TN / (TN + FP)','accuracy = (TP + TN) / total'),
    frames:[
      {focus:['TP'],caption:'True positives: positive cases correctly detected.',operation:'TP = 42',codeFocus:[0,1]},
      {focus:['FP'],caption:'False positives create unnecessary actions/alerts and reduce precision.',operation:'FP = 8',codeFocus:[0]},
      {focus:['FN'],caption:'False negatives are missed positives and reduce recall.',operation:'FN = 13',codeFocus:[1]},
      {focus:['TP','FP','FN','TN'],caption:'Metrics answer different operational questions; accuracy alone can hide rare-class failures.',operation:'CHOOSE METRIC',codeFocus:[0,1,2,3]}
    ]
  },
  'docker-image-container': {
    renderer:'layers', title:'Docker image vs container', subtitle:'Immutable image layers + a running writable instance',
    layers:['base OS / runtime','dependencies','application code','configuration metadata'],
    code:code('docker build -t app:1 .','docker run --name app-1 app:1','docker exec -it app-1 sh'),
    frames:[
      {phase:0,caption:'A Docker image is an immutable stack of filesystem layers plus metadata.',operation:'IMAGE',codeFocus:[0]},
      {phase:1,caption:'docker run creates a container: a running process with a writable container layer above the image.',operation:'CONTAINER',codeFocus:[1]},
      {phase:2,caption:'Multiple containers can start from the same image while keeping separate writable state.',operation:'MANY INSTANCES',codeFocus:[1]},
      {phase:3,caption:'Changes inside the writable container layer are ephemeral unless written to external storage/volumes.',operation:'PERSIST EXTERNALLY',codeFocus:[2]}
    ]
  },
  'git-init-flow': {
    renderer:'git', title:'Git working tree → commit → remote', subtitle:'Git records snapshots locally; GitHub hosts/synchronizes repositories',
    code:code('git init','git add .','git commit -m "first"','git push -u origin main'),
    frames:[
      {phase:0,caption:'git init creates repository metadata/history tracking for the project directory.',operation:'INIT',codeFocus:[0]},
      {phase:1,caption:'git add copies selected working-tree changes into the staging index.',operation:'STAGE',codeFocus:[1]},
      {phase:2,caption:'git commit records the staged snapshot and moves the local branch pointer.',operation:'COMMIT',codeFocus:[2]},
      {phase:3,caption:'git push sends commits/ref updates to a remote host such as GitHub. Git and GitHub are different layers.',operation:'PUSH',codeFocus:[3]}
    ]
  }
};

export const sceneIds = Object.keys(scenes);
