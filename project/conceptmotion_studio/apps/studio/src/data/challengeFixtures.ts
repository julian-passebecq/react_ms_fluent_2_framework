export type ChallengeLanguage =
  | 'python'
  | 'pandas'
  | 'pyspark'
  | 'sql'
  | 'tsql'
  | 'bigquery'
  | 'dax'
  | 'csharp'
  | 'powershell'
  | 'bash';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface ChallengeVariant {
  id: string;
  language: ChallengeLanguage;
  label: string;
  monacoLanguage: string;
  starter: string;
  solution: string;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  domain: string;
  difficulty: ChallengeDifficulty;
  tags: string[];
  summary: string;
  schema: string;
  input: string;
  example: string;
  expectedOutput: string;
  hints: string[];
  visualization?: 'join';
  variants: ChallengeVariant[];
}

export const challengeCatalog: ChallengeDefinition[] = [
  {
    id: 'customer-order-rank',
    title: 'Rank customers by order total',
    domain: 'SQL analytics',
    difficulty: 'Medium',
    tags: ['join', 'aggregate', 'window'],
    summary: 'Return every customer with their total order value and a dense rank from highest to lowest total.',
    schema: 'customers(customer_id, customer_name)\norders(order_id, customer_id, amount)',
    input: 'Three customers. Northwind has orders of 125 and 210; Fabrikam has one order of 90; Contoso has none.',
    example: 'Northwind → 335 → rank 1\nFabrikam → 90 → rank 2\nContoso → 0 → rank 3',
    expectedOutput: 'customer_id, customer_name, order_total, value_rank — one row per customer, ordered by value_rank then customer_id.',
    hints: [
      'Keep customers without orders by starting with a LEFT JOIN.',
      'Aggregate to one row per customer before applying the window function.',
      'Use COALESCE for missing totals and DENSE_RANK over the descending aggregate.',
    ],
    visualization: 'join',
    variants: [
      {
        id: 'sql', language: 'sql', label: 'SQL', monacoLanguage: 'sql',
        starter: `WITH customer_totals AS (\n  -- TODO: preserve customers and aggregate orders\n)\nSELECT\n  customer_id,\n  customer_name,\n  order_total,\n  -- TODO: add a dense rank\nFROM customer_totals\nORDER BY value_rank, customer_id;`,
        solution: `WITH customer_totals AS (\n  SELECT\n    c.customer_id,\n    c.customer_name,\n    COALESCE(SUM(o.amount), 0) AS order_total\n  FROM customers AS c\n  LEFT JOIN orders AS o\n    ON o.customer_id = c.customer_id\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT\n  customer_id,\n  customer_name,\n  order_total,\n  DENSE_RANK() OVER (ORDER BY order_total DESC) AS value_rank\nFROM customer_totals\nORDER BY value_rank, customer_id;`,
      },
      {
        id: 'tsql', language: 'tsql', label: 'T-SQL', monacoLanguage: 'sql',
        starter: `WITH customer_totals AS (\n  -- TODO: preserve customers and aggregate orders\n)\nSELECT customer_id, customer_name, order_total\nFROM customer_totals;`,
        solution: `WITH customer_totals AS (\n  SELECT c.customer_id, c.customer_name,\n         COALESCE(SUM(o.amount), 0) AS order_total\n  FROM dbo.customers AS c\n  LEFT JOIN dbo.orders AS o ON o.customer_id = c.customer_id\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT customer_id, customer_name, order_total,\n       DENSE_RANK() OVER (ORDER BY order_total DESC) AS value_rank\nFROM customer_totals\nORDER BY value_rank, customer_id;`,
      },
      {
        id: 'bigquery', language: 'bigquery', label: 'BigQuery SQL', monacoLanguage: 'sql',
        starter: `WITH customer_totals AS (\n  -- TODO: aggregate project.dataset tables\n)\nSELECT *\nFROM customer_totals;`,
        solution: `WITH customer_totals AS (\n  SELECT c.customer_id, c.customer_name,\n         COALESCE(SUM(o.amount), 0) AS order_total\n  FROM \`project.analytics.customers\` AS c\n  LEFT JOIN \`project.analytics.orders\` AS o USING (customer_id)\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT *, DENSE_RANK() OVER (ORDER BY order_total DESC) AS value_rank\nFROM customer_totals\nORDER BY value_rank, customer_id;`,
      },
      {
        id: 'pandas', language: 'pandas', label: 'pandas', monacoLanguage: 'python',
        starter: `def rank_customers(customers, orders):\n    # TODO: preserve customers, aggregate totals, and rank\n    return customers`,
        solution: `def rank_customers(customers, orders):\n    totals = (orders.groupby("customer_id", as_index=False)["amount"]\n             .sum().rename(columns={"amount": "order_total"}))\n    result = customers.merge(totals, on="customer_id", how="left")\n    result["order_total"] = result["order_total"].fillna(0)\n    result["value_rank"] = result["order_total"].rank(\n        method="dense", ascending=False\n    ).astype(int)\n    return result.sort_values(["value_rank", "customer_id"])`,
      },
      {
        id: 'pyspark', language: 'pyspark', label: 'PySpark', monacoLanguage: 'python',
        starter: `from pyspark.sql import functions as F, Window\n\ndef rank_customers(customers, orders):\n    # TODO: join, aggregate, then rank\n    return customers`,
        solution: `from pyspark.sql import functions as F, Window\n\ndef rank_customers(customers, orders):\n    totals = orders.groupBy("customer_id").agg(F.sum("amount").alias("order_total"))\n    joined = customers.join(totals, "customer_id", "left").fillna({"order_total": 0})\n    ranking = Window.orderBy(F.desc("order_total"))\n    return (joined.withColumn("value_rank", F.dense_rank().over(ranking))\n                  .orderBy("value_rank", "customer_id"))`,
      },
    ],
  },
  {
    id: 'even-value-summary',
    title: 'Summarize even values',
    domain: 'Programming fundamentals',
    difficulty: 'Easy',
    tags: ['loop', 'filter', 'measure'],
    summary: 'Return the sum of even values while leaving the input sequence unchanged.',
    schema: 'values: sequence of integers',
    input: '[3, 8, 5, 6]',
    example: '8 + 6 = 14',
    expectedOutput: '14',
    hints: ['Test divisibility with modulo 2.', 'Accumulate only after the predicate is true.'],
    variants: [
      {
        id: 'python', language: 'python', label: 'Python', monacoLanguage: 'python',
        starter: `def sum_even(values):\n    # TODO: return the sum of the even values\n    return 0`,
        solution: `def sum_even(values):\n    total = 0\n    for value in values:\n        if value % 2 == 0:\n            total += value\n    return total`,
      },
      {
        id: 'dax', language: 'dax', label: 'DAX', monacoLanguage: 'plaintext',
        starter: `Even Value Total :=\n-- TODO: filter even rows before summing\nSUM ( ValuesTable[Value] )`,
        solution: `Even Value Total :=\nSUMX (\n    FILTER ( ValuesTable, MOD ( ValuesTable[Value], 2 ) = 0 ),\n    ValuesTable[Value]\n)`,
      },
      {
        id: 'csharp', language: 'csharp', label: 'C# / Tabular Editor', monacoLanguage: 'csharp',
        starter: `// Tabular Editor advanced scripting example\n// TODO: create a measure expression for even values\nvar expression = "";`,
        solution: `// Tabular Editor advanced scripting example\nvar expression = @"SUMX(\n    FILTER(ValuesTable, MOD(ValuesTable[Value], 2) = 0),\n    ValuesTable[Value]\n)";\nModel.Tables["ValuesTable"].AddMeasure("Even Value Total", expression);`,
      },
    ],
  },
  {
    id: 'count-late-records',
    title: 'Count late records in a file',
    domain: 'Automation basics',
    difficulty: 'Easy',
    tags: ['files', 'filter', 'shell'],
    summary: 'Count CSV rows whose status field is late, excluding the header.',
    schema: 'orders.csv: order_id,status,amount',
    input: '1042,late,640\n1043,ready,280\n1044,late,920',
    example: 'Two data rows contain the exact status value late.',
    expectedOutput: '2',
    hints: ['Parse the CSV rather than matching the whole line.', 'Filter the status field, then count the remaining records.'],
    variants: [
      {
        id: 'powershell', language: 'powershell', label: 'PowerShell', monacoLanguage: 'powershell',
        starter: `$orders = Import-Csv ./orders.csv\n# TODO: filter exact status and print the count`,
        solution: `$orders = Import-Csv ./orders.csv\n($orders | Where-Object { $_.status -eq 'late' }).Count`,
      },
      {
        id: 'bash', language: 'bash', label: 'Bash / Linux', monacoLanguage: 'shell',
        starter: `#!/usr/bin/env bash\n# TODO: count rows where the second CSV field is exactly late`,
        solution: `#!/usr/bin/env bash\nawk -F',' 'NR > 1 && $2 == "late" { count++ } END { print count + 0 }' orders.csv`,
      },
    ],
  },
];

export const modeledChallengeLanguages: ChallengeLanguage[] = [
  'python', 'pandas', 'pyspark', 'sql', 'tsql', 'bigquery', 'dax', 'csharp', 'powershell', 'bash',
];
