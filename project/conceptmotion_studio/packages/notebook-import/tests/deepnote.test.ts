import { describe, expect, it } from 'vitest';
import { extractDeepnoteSql } from '../src';

describe('extractDeepnoteSql', () => {
  it('extracts multiline SQL, SQL comments, apostrophes and incomplete learner placeholders', () => {
    const source = `_dntk.execute_sql(
      """SELECT customer_id, customer_name
      FROM 'fixtures/customers.csv'
      -- keep O'Brien records
      WHERE customer_name = 'O''Brien'
        AND region = ____
      """,
      'SQL_DEEPNOTE_DATAFRAME_SQL',
      audit_path='fixtures/audit.csv'
    )`;
    const extraction = extractDeepnoteSql(source);
    expect(extraction.status).toBe('extracted');
    expect(extraction.sql).toContain("WHERE customer_name = 'O''Brien'");
    expect(extraction.sql).toContain('region = ____');
    expect(extraction.referencedPaths).toEqual(['fixtures/audit.csv', 'fixtures/customers.csv']);
    expect(extraction.originalSource).toBe(source);
  });

  it('supports escaped quotes and comments between wrapper tokens', () => {
    const source = `# generated wrapper
      _dntk.execute_sql # known Deepnote call
      (
        "SELECT * FROM people WHERE name = 'O\\'Brien'", # learner SQL
        "SQL_DEEPNOTE_DATAFRAME_SQL",
      )`;
    const extraction = extractDeepnoteSql(source);
    expect(extraction.status).toBe('extracted');
    expect(extraction.sql).toBe("SELECT * FROM people WHERE name = 'O'Brien'");
  });

  it('falls back for concatenation, formatted strings and incomplete wrappers', () => {
    expect(extractDeepnoteSql(`_dntk.execute_sql('SELECT ' + column, 'connection')`).status).toBe('ambiguous');
    expect(extractDeepnoteSql('_dntk.execute_sql(f"SELECT {column}", "connection")').status).toBe('ambiguous');
    expect(extractDeepnoteSql(`_dntk.execute_sql('SELECT * FROM t', 'connection'`).status).toBe('ambiguous');
  });

  it('does not reinterpret assignments or unrelated code as wrappers', () => {
    expect(extractDeepnoteSql(`result = _dntk.execute_sql('SELECT 1', 'connection')`).status).toBe('not-wrapper');
    expect(extractDeepnoteSql('SELECT 1').status).toBe('not-wrapper');
  });
});
