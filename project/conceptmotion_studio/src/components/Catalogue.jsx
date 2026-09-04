import React, { useEffect, useMemo, useState } from 'react';
import { catalog, categories, priorityRank } from '../data/catalog.js';
import { scenes } from '../data/scenes.js';
import Storyboard from './Storyboard.jsx';

const roleNames = { analyst:'Analyst', bi:'BI / Power BI', engineer:'Data Engineer', sql:'SQL', ml:'ML / DS' };
const PAGE = 60;
const DEFAULT_CONCEPT = 'sql-window-concept';

function initialConcept(){
  if(typeof window==='undefined') return DEFAULT_CONCEPT;
  const value=new URLSearchParams(window.location.search).get('concept');
  return catalog.some((item)=>item.id===value)?value:DEFAULT_CONCEPT;
}

export default function Catalogue(){
  const [q,setQ]=useState('');
  const [cat,setCat]=useState('all');
  const [role,setRole]=useState('all');
  const [implementation,setImplementation]=useState('all');
  const [selected,setSelected]=useState(initialConcept);
  const [visibleCount,setVisibleCount]=useState(PAGE);

  const filtered=useMemo(()=>catalog
    .filter((d)=>{
      const live=Boolean(scenes[d.id]);
      const matchesImplementation=implementation==='all'||(implementation==='live'&&live)||(implementation==='planned'&&!live);
      return (cat==='all'||d.category===cat)
        &&(role==='all'||d.roles.includes(role))
        &&matchesImplementation
        &&(!q||[d.title,d.summary,d.subcategory,...d.tags].join(' ').toLowerCase().includes(q.toLowerCase()));
    })
    .sort((a,b)=>(priorityRank[a.priority]-priorityRank[b.priority])||a.title.localeCompare(b.title)),[q,cat,role,implementation]);

  useEffect(()=>setVisibleCount(PAGE),[q,cat,role,implementation]);
  useEffect(()=>{
    if(filtered.length && !filtered.some(item=>item.id===selected)) setSelected(filtered[0].id);
  },[filtered,selected]);
  useEffect(()=>{
    if(typeof window==='undefined'||!selected) return;
    const url=new URL(window.location.href);
    if(selected===DEFAULT_CONCEPT) url.searchParams.delete('concept');
    else url.searchParams.set('concept',selected);
    window.history.replaceState(null,'',url);
  },[selected]);

  const current=filtered.find(d=>d.id===selected)||filtered[0]||null;
  const scene=scenes[current?.id];
  const related=useMemo(()=>catalog
    .filter(d=>d.id!==current?.id&&(d.category===current?.category||d.subcategory===current?.subcategory))
    .sort((a,b)=>(priorityRank[a.priority]-priorityRank[b.priority])||a.title.localeCompare(b.title))
    .slice(0,8),[current]);

  return <div className="catalogue-layout">
    <aside className="catalogue-side panel">
      <div className="filter-label">SEARCH THE LIBRARY</div>
      <input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="joins, SCD2, watermark, CALCULATE…" />
      <div className="role-chips"><button className={role==='all'?'active':''} onClick={()=>setRole('all')}>All roles</button>{Object.entries(roleNames).map(([id,label])=><button key={id} className={role===id?'active':''} onClick={()=>setRole(id)}>{label}</button>)}</div>
      <div className="implementation-filter"><span>IMPLEMENTATION</span><div className="segmented compact"><button className={implementation==='all'?'active':''} onClick={()=>setImplementation('all')}>All</button><button className={implementation==='live'?'active':''} onClick={()=>setImplementation('live')}>Live</button><button className={implementation==='planned'?'active':''} onClick={()=>setImplementation('planned')}>Planned</button></div></div>
      <div className="category-list"><button className={cat==='all'?'active':''} onClick={()=>setCat('all')}><b>All concepts</b><span>{catalog.length}</span></button>{categories.map(c=><button key={c.id} className={cat===c.id?'active':''} onClick={()=>setCat(c.id)}><b>{c.label}</b><small>{c.description}</small><span>{catalog.filter(d=>d.category===c.id).length}</span></button>)}</div>
    </aside>
    <main className="catalogue-main">
      <div className="catalogue-toolbar"><span><b>{filtered.length}</b> concepts · <b>{filtered.filter(d=>scenes[d.id]).length}</b> live</span><span>Surface = recommended treatment; Live = implemented renderer + frames</span></div>
      <div className="catalogue-grid">
        {filtered.slice(0,visibleCount).map(d=>{
          const live=Boolean(scenes[d.id]);
          return <button key={d.id} className={`concept-card ${selected===d.id?'selected':''}`} onClick={()=>setSelected(d.id)}><div><span className={`priority ${d.priority}`}>{d.priority}</span><span className="surface">{d.surface}</span><span className={`implementation ${live?'live':'planned'}`}>{live?'LIVE':'PLANNED'}</span></div><h3>{d.title}</h3><p>{d.summary}</p><small>{d.subcategory}</small></button>
        })}
      </div>
      {filtered.length===0&&<div className="empty-state panel"><b>No catalogue entry matches these filters.</b><span>Reset search, role, category or implementation status.</span></div>}
      {visibleCount<filtered.length&&<button className="load-more" onClick={()=>setVisibleCount(v=>v+PAGE)}>Show {Math.min(PAGE,filtered.length-visibleCount)} more · {filtered.length-visibleCount} remaining</button>}
      {current && <section className="concept-detail panel">
        <div className="detail-head"><div><span className="micro">{categories.find(c=>c.id===current.category)?.label} · {current.subcategory}</span><h1>{current.title}</h1><p>{current.summary}</p></div><div className="detail-badges"><span>{current.priority}</span><span>{current.surface}</span><span className={scene?'live-badge':'planned-badge'}>{scene?'live scene':'planned surface'}</span></div></div>
        {scene ? <Storyboard scene={scene} /> : <div className="static-explain"><div className="paper-note"><span>CATALOGUE ENTRY · NOT YET IMPLEMENTED AS A LIVE SCENE</span><h2>{current.title}</h2><p>{current.summary}</p><div className="note-rule"></div><b>Recommended visual surface</b><p>{current.surface === 'paper' ? 'Printable paper/handwritten reference card.' : current.surface === 'cheat' ? 'Cross-language or compact reference sheet.' : 'A reusable diagram/interactive renderer. This catalogue entry is a roadmap item, not a claim that the scene already exists.'}</p></div><div><h3>Related concepts</h3><div className="related-grid">{related.map(r=><button key={r.id} onClick={()=>{setQ('');setCat('all');setRole('all');setImplementation('all');setSelected(r.id);}}><b>{r.title}</b><span>{r.subcategory}{scenes[r.id]?' · live':''}</span></button>)}</div></div></div>}
      </section>}
    </main>
  </div>
}
