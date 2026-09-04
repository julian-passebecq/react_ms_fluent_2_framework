import React, { useEffect, useState } from 'react';
import Catalogue from './components/Catalogue.jsx';
import StoryboardGallery from './components/StoryboardGallery.jsx';
import CheatSheetStudio from './components/CheatSheetStudio.jsx';
import ResearchNotes from './components/ResearchNotes.jsx';
import { stats } from './data/catalog.js';
import { sceneIds } from './data/scenes.js';
import { languages } from './data/cheatsheets.js';

const tabs=[['atlas','Atlas'],['storyboards','Storyboards'],['sheets','Cheat sheets'],['research','Research & API']];
const validTabs=new Set(tabs.map(([id])=>id));
const presets=['professional','editorial','social','dashboard'];

function initialTab(){
  if(typeof window==='undefined') return 'atlas';
  const value=new URLSearchParams(window.location.search).get('tab');
  return validTabs.has(value)?value:'atlas';
}
function initialSetting(key,fallback,allowed){
  if(typeof window==='undefined') return fallback;
  const value=window.localStorage.getItem(`conceptmotion:${key}`);
  return !allowed||allowed.includes(value)?(value||fallback):fallback;
}

function ApiPanel(){
  const schema=`{\n  id: "spark-skew",\n  renderer: "partition",\n  data: { records: [...], buckets: [...] },\n  frames: [\n    { operation: "HASH KEY", positions: {...}, codeFocus: [1] },\n    { operation: "SHUFFLE", positions: {...}, codeFocus: [2] }\n  ]\n}`;
  return <section className="api-panel panel"><span className="micro">AI AUTHORING CONTRACT</span><h2>Renderer + semantic state + deterministic frames.</h2><p>The library is intentionally authored through structured data. React owns the application shell; D3 owns the visualization subtree. Python can generate the same scene JSON from notebooks, query plans, lineage metadata or pipeline configuration.</p><pre>{schema}</pre><div className="api-grid"><div><b>Table</b><span>rows · focus · windows · ranks · statuses</span></div><div><b>DAG</b><span>active · done · failed · blocked · links</span></div><div><b>Partition</b><span>record positions · bucket state · shuffle phases</span></div><div><b>Scatter / tree</b><span>points · centroids · axes · split state</span></div><div><b>Paper sheet</b><span>sections · items · syntax lenses · print theme</span></div><div><b>Storyboard</b><span>operation · caption · codeFocus · frame state</span></div></div></section>
}

export default function App(){
  const [tab,setTab]=useState(initialTab);
  const [theme,setTheme]=useState(()=>initialSetting('theme','light',['light','dark']));
  const [preset,setPreset]=useState(()=>initialSetting('preset','professional',presets));

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    document.documentElement.dataset.preset=preset;
    window.localStorage.setItem('conceptmotion:theme',theme);
    window.localStorage.setItem('conceptmotion:preset',preset);
  },[theme,preset]);

  useEffect(()=>{
    const url=new URL(window.location.href);
    if(tab==='atlas') url.searchParams.delete('tab'); else url.searchParams.set('tab',tab);
    window.history.replaceState(null,'',url);
  },[tab]);

  return <div className="app-shell">
    <header className="app-header"><div className="brand"><div className="brand-mark">CM</div><div><b>ConceptMotion Studio</b><span>Visual data concepts · AI-authorable D3 library</span></div></div><nav aria-label="Primary">{tabs.map(([id,label])=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}>{label}</button>)}</nav><div className="header-actions"><select aria-label="Visual preset" value={preset} onChange={e=>setPreset(e.target.value)}>{presets.map(value=><option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select><button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} aria-label={`Switch to ${theme==='light'?'dark':'light'} theme`}>{theme==='light'?'Light':'Dark'}</button></div></header>
    <section className="top-strip" aria-label="Library coverage"><div><strong>{stats.concepts}</strong><span>catalogued concepts</span></div><div><strong>{sceneIds.length}</strong><span>implemented live scenes</span></div><div><strong>{stats.categories}</strong><span>domains</span></div><div><strong>{languages.length}</strong><span>syntax lenses</span></div><div><strong>5</strong><span>print / visual themes</span></div></section>
    <main className="app-main">{tab==='atlas'&&<Catalogue/>}{tab==='storyboards'&&<StoryboardGallery/>}{tab==='sheets'&&<CheatSheetStudio/>}{tab==='research'&&<><ResearchNotes/><ApiPanel/></>}</main>
    <footer className="app-footer"><b>ConceptMotion Studio</b><span>Catalogue taxonomy → live Storyboards → Cheat Sheets · D3 visual core · React shell · Python authoring adapter.</span></footer>
  </div>
}
