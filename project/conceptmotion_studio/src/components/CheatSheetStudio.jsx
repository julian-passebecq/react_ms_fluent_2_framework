import React, { useMemo, useState } from 'react';
import { crossLanguageActions, languages, sheets } from '../data/cheatsheets.js';

const themeLabels={paper:'Paper',handwritten:'Handwritten',mono:'No color',social:'Social',presentation:'Presentation'};

function CrossLanguage({theme}){
  const [selected,setSelected]=useState(['pandas','T-SQL','BigQuery','PySpark','Polars','DAX']);
  const [query,setQuery]=useState('');
  const actions=useMemo(()=>crossLanguageActions.filter(a=>!query||[a.title,a.intent].join(' ').toLowerCase().includes(query.toLowerCase())),[query]);
  return <div>
    <div className="sheet-toolbar-inner">
      <input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="filter, join, rolling, parquet…" />
      <div className="language-chips">{languages.map(l=><button key={l} className={selected.includes(l)?'active':''} onClick={()=>setSelected(s=>s.includes(l)?s.filter(x=>x!==l):[...s,l])}>{l}</button>)}</div>
    </div>
    <div className={`cross-language-grid sheet-theme-${theme}`}>
      {actions.map(a=><article key={a.id} className="language-action-sheet"><header><span>SEMANTIC ACTION</span><h2>{a.title}</h2><p>{a.intent}</p></header><div className="language-columns">{selected.map(l=><div key={l}><b>{l}</b><pre>{a.code[l]}</pre></div>)}</div></article>)}
    </div>
  </div>
}

function SheetPage({sheet,theme}){
  return <article className={`paper-sheet sheet-theme-${theme}`}>
    <header><span>{sheet.category.toUpperCase()} · CONCEPTMOTION</span><h1>{sheet.title}</h1><p>{sheet.subtitle}</p></header>
    <div className="sheet-sections">{sheet.sections.map((s,i)=><section key={i}><h2>{s.title}</h2><div className="sheet-items">{s.items.map(([k,v],j)=><div key={j}><b>{k}</b><span>{v}</span></div>)}</div></section>)}</div>
    <footer>Generated from semantic catalogue data · printable · theme-independent content</footer>
  </article>
}

export default function CheatSheetStudio(){
  const [mode,setMode]=useState('catalogue'); const [theme,setTheme]=useState('paper'); const [sheetId,setSheetId]=useState('sql-joins');
  const sheet=sheets.find(s=>s.id===sheetId);
  return <div className="sheets-page">
    <div className="sheets-head panel"><div><span className="micro">PRINTABLE KNOWLEDGE SURFACE</span><h1>Cheat Sheet Studio</h1><p>The same library can generate concise paper-style references or side-by-side language syntax. Motion is reserved for concepts where state change is the lesson.</p></div><div className="sheet-actions"><button onClick={()=>window.print()}>Print / PDF</button></div></div>
    <div className="sheets-toolbar panel">
      <div className="segmented"><button className={mode==='catalogue'?'active':''} onClick={()=>setMode('catalogue')}>Catalogue sheets</button><button className={mode==='cross'?'active':''} onClick={()=>setMode('cross')}>Same action · many languages</button></div>
      <div className="theme-row">{Object.entries(themeLabels).map(([id,label])=><button key={id} className={theme===id?'active':''} onClick={()=>setTheme(id)}>{label}</button>)}</div>
    </div>
    {mode==='catalogue' ? <div className="sheet-layout"><aside className="sheet-picker panel">{sheets.map(s=><button key={s.id} className={sheetId===s.id?'active':''} onClick={()=>setSheetId(s.id)}><b>{s.title}</b><span>{s.category}</span></button>)}</aside><main><SheetPage sheet={sheet} theme={theme} /></main></div> : <CrossLanguage theme={theme} />}
  </div>
}
