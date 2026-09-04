import React from 'react';

const sources=[
  ['Explorable Explanations','Bret Victor','Core design principle: interaction should let the learner inspect consequences and assumptions, not merely decorate prose.','https://worrydream.com/ExplorableExplanations/'],
  ['Seeing Theory','Brown University','Strong precedent for D3-based interactive probability and statistics explanations.','https://seeing-theory.brown.edu/'],
  ['TensorFlow Playground','Google / TensorFlow','A durable example of parameter controls + live model behavior + direct manipulation in one learning surface.','https://playground.tensorflow.org/'],
  ['Distill Feature Visualization','Chris Olah et al.','Reference for publication-quality interactive ML explanations where visuals and explanatory text are tightly integrated.','https://distill.pub/2017/feature-visualization/'],
  ['Python Tutor','Philip Guo','Reference for step-by-step code execution, variable/object state and synchronized execution traces.','https://pythontutor.com/'],
  ['VisuAlgo','NUS / VisuAlgo','Reference for algorithm playback, stepping, custom inputs and reusable data-structure visual grammars.','https://visualgo.org/'],
  ['SQL Window Functions Visualized','Trần Hoàng Long','Useful teaching pattern: show exactly how a SQL window is constructed, moves and calculates for each row.','https://medium.com/learning-sql/sql-window-function-visualized-fff1927f00f2'],
  ['SQL JOIN Visualizer','Doses of Data','Recent browser-based precedent for letting learners experiment with join preservation rules using concrete tables.','https://dosesofdata.com/sql-joins-explained/'],
  ['Filter context in DAX explained visually','SQLBI','Excellent precedent for representing filter context as explicit visible sets and showing how CALCULATE changes them.','https://www.sqlbi.com/articles/filter-context-in-dax-explained-visually/'],
  ['Database Indexing Visualized','Nitesh Raj Khanal','Visual treatment of scans, B-trees and composite indexes; useful as a reference for access-path explanations.','https://neeteshraj.medium.com/database-indexing-visualized-why-your-query-takes-5-seconds-78afc91fe79e'],
  ['Spark Shuffle Visual Guide','B V Sarath Chandra','Data-engineering precedent for making invisible network redistribution visible.','https://medium.com/towards-data-engineering/why-your-spark-job-is-slow-a-visual-guide-to-the-shuffle-7da8bcde9184'],
  ['Airflow DAG documentation','Apache Airflow','Authoritative dependency, trigger-rule and execution semantics for DAG visualizations.','https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html'],
  ['Airflow UI overview','Apache Airflow','Graph/Grid/Run views are useful product references for debugging task state over time.','https://airflow.apache.org/docs/apache-airflow/stable/ui.html'],
  ['Star schema guidance','Microsoft Learn','Power BI semantic-model guidance linking dimensions/facts to filtering, grouping and summarization.','https://learn.microsoft.com/en-us/power-bi/guidance/star-schema'],
  ['Model relationships in Power BI','Microsoft Learn','Useful authoritative examples of relationship-based filter propagation.','https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-relationships-understand'],
  ['Kimball dimensional techniques','Kimball Group','Canonical taxonomy of grain, fact tables, dimensions, SCD types and dimensional-modeling patterns.','https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/'],
  ['Parquet concepts / file format','Apache Parquet','Authoritative hierarchy: file → row groups → column chunks → pages, including metadata and skipping behavior.','https://parquet.apache.org/docs/concepts/']
];

export default function ResearchNotes(){
  return <div className="research-page">
    <section className="research-hero panel"><span className="micro">DESIGN RESEARCH</span><h1>Why this library uses several visual surfaces.</h1><p>No single visual language is best for every concept. Motion should reveal state transitions; paper sheets should support recall; diagrams should explain topology; and interactive controls should let a learner test assumptions.</p></section>
    <section className="principle-grid"><article><b>Motion as evidence</b><p>Animate only ordering, selection, movement, propagation, optimization or state changes that would otherwise remain invisible.</p></article><article><b>Paper for memory</b><p>Shortcut lists, formulas and cross-language syntax are faster to scan as dense printable cards than as animated scenes.</p></article><article><b>One semantic source</b><p>The catalogue entry is independent of theme. Professional, handwritten, monochrome and social styles should never duplicate business logic.</p></article><article><b>AI writes state</b><p>An agent chooses renderer + stable IDs + frames + captions. It should not invent arbitrary SVG coordinates for routine concepts.</p></article></section>
    <section className="source-grid">{sources.map(([title,author,note,url])=><a key={title} href={url} target="_blank" rel="noreferrer"><span>{author}</span><h3>{title}</h3><p>{note}</p><b>Open source ↗</b></a>)}</section>
  </div>
}
