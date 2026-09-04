import React, { useMemo, useState } from 'react';
import { scenes } from '../data/scenes.js';
import Storyboard from './Storyboard.jsx';

export default function StoryboardGallery(){
  const ids=useMemo(()=>Object.keys(scenes),[]);
  const [selected,setSelected]=useState('sql-window-concept');
  return <div className="story-gallery">
    <div className="gallery-rail panel"><div><span className="micro">{ids.length} REUSABLE SCENES</span><h2>Storyboard library</h2><p>Every live scene is deterministic state + renderer + synchronized code lines. Catalogue entries marked Planned are roadmap items, not hidden implementations.</p></div><div className="scene-rail">{ids.map(id=><button key={id} onClick={()=>setSelected(id)} className={selected===id?'active':''}><b>{scenes[id].title}</b><span>{scenes[id].renderer}</span></button>)}</div></div>
    <main><Storyboard scene={scenes[selected]} /></main>
  </div>
}
