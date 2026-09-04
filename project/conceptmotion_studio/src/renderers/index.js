import * as d3 from 'd3';
import { validateSceneShape } from '../lib/scene.js';
import { daxEffectiveFilters, joinResultRows } from '../lib/semantics.js';

const W = 960, H = 520;
const ink = 'var(--ink)', muted = 'var(--muted)', line = 'var(--line)', accent = 'var(--accent)', accentSoft = 'var(--accent-soft)', good='var(--good)', goodSoft='var(--good-soft)', bad='var(--bad)', badSoft='var(--bad-soft)', surface='var(--surface)', surface2='var(--surface-2)';

function base(svg, title, subtitle='') {
  svg.attr('viewBox',`0 0 ${W} ${H}`).attr('role','img').attr('aria-label',`${title}. ${subtitle}`);
  svg.selectAll('title').data([title]).join('title').text(title);
  const head = svg.selectAll('g.viz-head').data([0]).join('g').attr('class','viz-head');
  head.selectAll('text.title').data([title]).join('text').attr('class','title').attr('x',28).attr('y',38).attr('fill',ink).attr('font-size',22).attr('font-weight',850).text(title);
  head.selectAll('text.sub').data([subtitle]).join('text').attr('class','sub').attr('x',28).attr('y',60).attr('fill',muted).attr('font-size',11).text(subtitle);
}

function resetLayer(svg, name='main') {
  const all = svg.selectAll(`g.layer-${name}`).data([0]);
  all.exit().remove();
  const g = all.join('g').attr('class',`layer-${name}`);
  g.selectAll('*').remove();
  return g;
}

function text(g,x,y,str,opts={}){
  return g.append('text').attr('x',x).attr('y',y).attr('fill',opts.fill||ink).attr('font-size',opts.size||12).attr('font-weight',opts.weight||600).attr('text-anchor',opts.anchor||'start').text(str);
}
function rect(g,x,y,w,h,opts={}){
  return g.append('rect').attr('x',x).attr('y',y).attr('width',w).attr('height',h).attr('rx',opts.rx??12).attr('fill',opts.fill||surface).attr('stroke',opts.stroke||line).attr('stroke-width',opts.sw||1.2);
}
function pill(g,x,y,label,fill=accentSoft,stroke=accent){
  const w=Math.max(66,label.length*7+18); rect(g,x,y,w,25,{rx:12,fill,stroke}); text(g,x+w/2,y+17,label,{size:10,weight:850,anchor:'middle',fill:stroke}); return w;
}
function table(g,{x,y,w,columns,rows,title,focus=[],mutedRows=[],cellH=38}){
  if(title) text(g,x,y-12,title,{size:12,weight:850});
  const colW=w/columns.length;
  rect(g,x,y,w,31,{rx:9,fill:surface2});
  columns.forEach((c,i)=>text(g,x+i*colW+10,y+20,c,{size:9,weight:850,fill:muted}));
  rows.forEach((r,ri)=>{
    const fy=y+35+ri*cellH;
    rect(g,x,fy,w,cellH-4,{rx:8,fill:focus.includes(ri)?accentSoft:surface,stroke:focus.includes(ri)?accent:line,sw:focus.includes(ri)?2:1});
    if(mutedRows.includes(ri)) g.append('rect').attr('x',x).attr('y',fy).attr('width',w).attr('height',cellH-4).attr('rx',8).attr('fill','rgba(127,127,127,.12)');
    r.forEach((v,ci)=>text(g,x+ci*colW+10,fy+24,String(v),{size:11,weight:ci===0?750:600,fill:mutedRows.includes(ri)?muted:ink}));
  });
  return {colW,rowY:(ri)=>y+35+ri*cellH+17};
}

function renderJoin(svg,s,f,duration){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg);
  const pairs=f.pairs||[]; const focusL=f.focus?.left||[], focusR=f.focus?.right||[];
  const L=table(g,{x:35,y:105,w:300,columns:s.left.columns,rows:s.left.rows,title:s.left.title,focus:focusL,cellH:32});
  const R=table(g,{x:625,y:105,w:300,columns:s.right.columns,rows:s.right.rows,title:s.right.title,focus:focusR,cellH:32});
  const arcLayer=g.append('g').attr('class','pairs');
  pairs.forEach(([li,ri])=>{
    if(li==null && ri!=null){
      const y=R.rowY(ri);
      g.append('path').attr('d',`M405,${y} C480,${y} 530,${y} 625,${y}`).attr('fill','none').attr('stroke',accent).attr('stroke-width',2).attr('stroke-dasharray','5 5');
      pill(g,382,y-13,'NULL');
    } else if(ri==null && li!=null){
      const y=L.rowY(li);
      g.append('path').attr('d',`M335,${y} C430,${y} 470,${y} 555,${y}`).attr('fill','none').attr('stroke',accent).attr('stroke-width',2).attr('stroke-dasharray','5 5');
      pill(g,472,y-13,'NULL');
    } else if(li!=null && ri!=null){
      const y1=L.rowY(li),y2=R.rowY(ri);
      arcLayer.append('path').attr('d',`M335,${y1} C455,${y1} 505,${y2} 625,${y2}`).attr('fill','none').attr('stroke',accent).attr('stroke-width',2.2).attr('opacity',.86);
    }
  });
  text(g,480,92,s.joinType==='cross'?'every left row × every right row':'ON customer_id = customer_id',{size:10,weight:850,anchor:'middle',fill:accent});

  const result=joinResultRows(s,f);
  const resultRows=result.rows.map((row)=>row.values);
  table(g,{x:250,y:326,w:460,columns:result.columns,rows:resultRows,title:'Result built so far',cellH:24});
  pill(g,402,286,`${resultRows.length} result row${resultRows.length===1?'':'s'}`,f.done?goodSoft:accentSoft,f.done?good:accent);
}

function renderWindow(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const cols=s.columns, rows=s.rows;
  const x=150,y=105,w=660,cellH=50,colW=w/cols.length;
  rect(g,x,y,w,34,{rx:9,fill:surface2}); cols.forEach((c,i)=>text(g,x+i*colW+12,y+22,c.toUpperCase(),{size:9,weight:850,fill:muted}));
  rows.forEach((r,i)=>{
    const yy=y+40+i*cellH; const active=f.active?.includes(i); const cur=f.cursor===i;
    rect(g,x,yy,w,cellH-6,{rx:9,fill:active?accentSoft:surface,stroke:cur?accent:(active?accent:line),sw:cur?2.5:active?1.5:1});
    if(active) g.append('rect').attr('x',x).attr('y',yy).attr('width',6).attr('height',cellH-6).attr('rx',3).attr('fill',accent);
    r.forEach((v,ci)=>text(g,x+ci*colW+12,yy+29,String(v),{size:12,weight:ci===2?850:620}));
    if(cur) pill(g,820,yy+9,'CURRENT');
  });
  pill(g,365,445,`rolling sum = ${f.metric}`,goodSoft,good);
}

function renderRank(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg);
  const rows=s.rows.map(([name,score])=>[name,score]);
  table(g,{x:130,y:120,w:440,columns:['NAME','SCORE'],rows,focus:d3.range((f.upto??0)+1)});
  const ranks=[1,2,2,4],dense=[1,2,2,3];
  text(g,650,116,'RANK',{size:10,weight:900,fill:muted}); text(g,780,116,'DENSE_RANK',{size:10,weight:900,fill:muted});
  rows.forEach((r,i)=>{const yy=155+i*38; rect(g,620,yy,80,32,{rx:8,fill:i<=f.upto?accentSoft:surface2,stroke:i<=f.upto?accent:line}); text(g,660,yy+21,i<=f.upto?ranks[i]:'—',{anchor:'middle',weight:850}); rect(g,760,yy,100,32,{rx:8,fill:i<=f.upto?goodSoft:surface2,stroke:i<=f.upto?good:line}); text(g,810,yy+21,i<=f.upto?dense[i]:'—',{anchor:'middle',weight:850});});
}

function renderBTree(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const visited=new Set(f.visited||[]);
  if(f.scan){
    text(g,55,112,'Table scan',{size:12,weight:850}); const vals=s.values;
    vals.forEach((v,i)=>{const x=55+(i%7)*118,y=145+Math.floor(i/7)*66; rect(g,x,y,90,44,{rx:9,fill:v===s.target?goodSoft:surface,stroke:v===s.target?good:line}); text(g,x+45,y+27,v,{anchor:'middle',weight:850});});
    text(g,55,315,'Rows are inspected broadly because there is no useful access path.',{size:11,fill:muted}); return;
  }
  const nodes=[{label:'45',x:480,y:105},{label:'18',x:275,y:210},{label:'73',x:685,y:210},{label:'5 · 12',x:150,y:350},{label:'24 · 31 · 39',x:360,y:350},{label:'52 · 61 · 68',x:600,y:350},{label:'73 · 80 · 88 · 94',x:790,y:350}];
  const edges=[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  edges.forEach(([a,b])=>g.append('line').attr('x1',nodes[a].x).attr('y1',nodes[a].y+28).attr('x2',nodes[b].x).attr('y2',nodes[b].y-28).attr('stroke',line).attr('stroke-width',2));
  nodes.forEach(n=>{const v=visited.has(n.label); rect(g,n.x-75,n.y-26,150,52,{rx:12,fill:v?accentSoft:surface,stroke:v?accent:line,sw:v?2.5:1.2}); text(g,n.x,n.y+5,n.label,{anchor:'middle',weight:850,fill:v?accent:ink});});
  pill(g,396,442,`target = ${s.target}`);
}

function renderPlan(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const active=new Set(f.active||[]); const nodes=new Map(s.nodes.map(n=>[n.id,n]));
  s.links.forEach(([a,b])=>{const A=nodes.get(a),B=nodes.get(b); g.append('path').attr('d',`M${A.x+75},${A.y} C${(A.x+B.x)/2},${A.y} ${(A.x+B.x)/2},${B.y} ${B.x-75},${B.y}`).attr('fill','none').attr('stroke',active.has(b)?accent:line).attr('stroke-width',active.has(b)?4:2);});
  s.nodes.forEach(n=>{const on=active.has(n.id); rect(g,n.x-75,n.y-30,150,60,{rx:13,fill:on?accentSoft:surface,stroke:on?accent:line,sw:on?2.5:1}); text(g,n.x,n.y-2,n.label,{anchor:'middle',weight:850}); text(g,n.x,n.y+17,n.meta,{anchor:'middle',size:9,fill:muted});});
  text(g,48,465,'Read plans bottom-up for data sources and left-to-right/upstream-to-downstream for row flow.',{size:10,fill:muted});
}

function partitionPositions(s,phase){
  const dest=s.destinations||{}; return s.records.map((r,i)=>{
    const input=r[2]; if(phase<2) return input; return dest[r[0]];
  });
}
function renderPartition(svg,s,f,duration){
  base(svg,s.title,s.subtitle); const g=svg.selectAll('g.layer-main').data([0]).join('g').attr('class','layer-main');
  const phase=f.phase??0; const bucketX=[35,185,335,555,705,855];
  const buckets=g.selectAll('g.bucket').data(s.buckets.map((b,i)=>({b,i})),d=>d.b);
  const be=buckets.enter().append('g').attr('class','bucket'); be.append('rect'); be.append('text').attr('class','bt');
  buckets.merge(be).attr('transform',d=>`translate(${bucketX[d.i]-60},105)`).each(function(d){const x=d3.select(this); x.select('rect').attr('width',120).attr('height',300).attr('rx',14).attr('fill',d.i<3?surface:surface2).attr('stroke',line); x.select('.bt').attr('x',60).attr('y',24).attr('text-anchor','middle').attr('fill',d.i<3?muted:ink).attr('font-size',9).attr('font-weight',850).text(d.b);});
  const pos=partitionPositions(s,phase); const records=s.records.map((r,i)=>({id:i,key:r[0],amt:r[1],bucket:pos[i]}));
  const sel=g.selectAll('g.record').data(records,d=>d.id); const en=sel.enter().append('g').attr('class','record'); en.append('rect').attr('width',86).attr('height',38).attr('rx',9); en.append('text').attr('class','rk').attr('x',10).attr('y',16); en.append('text').attr('class','ra').attr('x',10).attr('y',31);
  const counts={}; records.forEach(r=>{const idx=counts[r.bucket]||0;r.slot=idx;counts[r.bucket]=idx+1;});
  sel.merge(en).transition().duration(duration).attr('transform',d=>`translate(${bucketX[d.bucket]-43},${145+d.slot*44})`);
  sel.merge(en).select('rect').attr('fill',phase===2?accentSoft:surface).attr('stroke',phase===2?accent:line);
  sel.merge(en).select('.rk').attr('fill',ink).attr('font-size',10).attr('font-weight',850).text(d=>`key ${d.key}`);
  sel.merge(en).select('.ra').attr('fill',muted).attr('font-size',9).text(d=>`amount ${d.amt}`);
  if(phase===1) pill(g,398,432,'HASH PARTITION KEY');
  if(phase>=2) pill(g,407,432,'NETWORK SHUFFLE');
}

function renderBroadcast(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0;
  const xs=[120,420,720];
  s.workers.forEach((w,i)=>{rect(g,xs[i]-90,190,180,170,{rx:16,fill:surface,stroke:line}); text(g,xs[i],217,w,{anchor:'middle',weight:850}); text(g,xs[i],245,`${s.factRows[i]}M fact rows`,{anchor:'middle',size:10,fill:muted}); if(phase>=1){rect(g,xs[i]-58,276,116,44,{rx:10,fill:accentSoft,stroke:accent}); text(g,xs[i],303,`DIM ${s.dimMB} MB`,{anchor:'middle',size:10,weight:850,fill:accent});} if(phase>=2) pill(g,xs[i]-47,330,'LOCAL JOIN',goodSoft,good);});
  if(phase===0){rect(g,395,88,170,54,{rx:12,fill:accentSoft,stroke:accent});text(g,480,120,`Dimension = ${s.dimMB} MB`,{anchor:'middle',weight:850,fill:accent});}
  if(phase===1){g.append('line').attr('x1',480).attr('y1',118).attr('x2',120).attr('y2',276).attr('stroke',accent).attr('stroke-width',2).attr('stroke-dasharray','5 5');g.append('line').attr('x1',480).attr('y1',118).attr('x2',420).attr('y2',276).attr('stroke',accent).attr('stroke-width',2).attr('stroke-dasharray','5 5');g.append('line').attr('x1',480).attr('y1',118).attr('x2',720).attr('y2',276).attr('stroke',accent).attr('stroke-width',2).attr('stroke-dasharray','5 5');}
}

function renderPipeline(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0;
  const stages=phase===0?s.stages:s.optimized; const x0=45, y=210, gap=(870)/(stages.length-1||1);
  stages.forEach((st,i)=>{const x=x0+i*gap; if(i<stages.length-1) g.append('line').attr('x1',x+68).attr('y1',y).attr('x2',x+gap-68).attr('y2',y).attr('stroke',i<phase?accent:line).attr('stroke-width',3); rect(g,x-68,y-42,136,84,{rx:14,fill:i<=phase?accentSoft:surface,stroke:i<=phase?accent:line}); const ls=String(st).split('\n');ls.forEach((t,j)=>text(g,x,y-6+j*18,t,{anchor:'middle',size:10,weight:j===0?850:650,fill:j===0?ink:muted}));});
  if(phase>0) pill(g,390,355,'OPTIMIZED PLAN',goodSoft,good);
}

function renderDax(svg,s,f){
  base(svg,s.title,s.subtitle);
  const g=resetLayer(svg);
  const filters=f.filters||{};
  const calc=f.calc||{};
  const remove=new Set(f.remove||[]);
  const effective=daxEffectiveFilters(f);
  text(g,55,110,'FILTER CONTEXT',{size:10,weight:900,fill:muted});
  let px=55;
  Object.entries(effective).forEach(([k,v])=>{px+=pill(g,px,125,`${k} = ${v}`)+8;});
  if(px===55) pill(g,55,125,'(no filters)',surface2,muted);
  const dims=Object.keys(s.dimensions);
  const dx=[90,350];
  dims.forEach((dim,i)=>{
    const selected=effective[dim];
    rect(g,dx[i],205,190,120,{rx:15,fill:surface,stroke:selected!=null?accent:line,sw:selected!=null?2.4:1});
    text(g,dx[i]+95,230,`Dim${dim}`,{anchor:'middle',weight:850});
    s.dimensions[dim].forEach((v,j)=>{
      const active=selected==null || String(selected)===String(v);
      text(g,dx[i]+30+j*75,278,String(v),{anchor:'middle',size:11,weight:active?850:500,fill:active?ink:muted});
    });
  });
  rect(g,590,180,305,190,{rx:16,fill:surface,stroke:line});
  text(g,742,207,'Sales fact rows',{anchor:'middle',weight:850});
  s.fact.forEach((r,i)=>{
    const ok=Object.entries(effective).every(([k,v])=>{const di=dims.indexOf(k);return di<0||String(r[di])===String(v);});
    const y=236+i*28;
    rect(g,610,y,265,24,{rx:6,fill:ok?accentSoft:surface2,stroke:ok?accent:line});
    text(g,622,y+16,r.join(' · '),{size:9,weight:ok?800:550,fill:ok?ink:muted});
  });
  pill(g,690,405,`MEASURE = ${f.metric}`,goodSoft,good);
}

function renderStar(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const active=new Set(f.active||[]);
  const all=[...s.dims.map(d=>({...d,type:'dim'})),{...s.fact,id:'fact',type:'fact'}];
  s.dims.forEach(d=>g.append('line').attr('x1',d.x+(d.x<s.fact.x?160:0)).attr('y1',d.y+65).attr('x2',s.fact.x+(d.x<s.fact.x?0:180)).attr('y2',s.fact.y+75).attr('stroke',active.has(d.id)?accent:line).attr('stroke-width',active.has(d.id)?4:2));
  all.forEach(t=>{const on=active.has(t.id); const w=t.type==='fact'?180:160,h=t.type==='fact'?150:130; rect(g,t.x,t.y,w,h,{rx:14,fill:on?accentSoft:surface,stroke:on?accent:line,sw:on?2.5:1.2}); text(g,t.x+14,t.y+25,t.label,{weight:900,size:12});t.fields.forEach((fd,i)=>text(g,t.x+14,t.y+50+i*18,fd,{size:9,fill:i===0?accent:muted,weight:i===0?850:600}));});
}

function renderInterval(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0;
  const rows=[]; if(phase<2) rows.push(['C-042','Oslo','2024-01-01','9999-12-31','true']); else rows.push(['C-042','Oslo','2024-01-01','2026-09-04','false']); if(phase>=3) rows.push(['C-042','Bergen','2026-09-04','9999-12-31','true']);
  table(g,{x:75,y:155,w:810,columns:['CUSTOMER','CITY','VALID_FROM','VALID_TO','CURRENT'],rows,focus:phase===1?[0]:phase>=2?d3.range(rows.length):[]});
  if(phase>=1){pill(g,300,90,'incoming: Oslo → Bergen');}
  if(phase>=2){g.append('line').attr('x1',195).attr('y1',370).attr('x2',790).attr('y2',370).attr('stroke',line).attr('stroke-width',4); pill(g,445,356,'2026-09-04',surface2,muted); text(g,195,398,'historical Oslo',{size:10,fill:muted}); if(phase>=3) text(g,675,398,'current Bergen',{size:10,fill:good,weight:850});}
}

function renderIdempotency(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0;
  table(g,{x:55,y:140,w:330,columns:['EVENT_ID','VALUE'],rows:s.input,title:'Incoming retry batch',focus:phase>=1?[0,1,2]:[]});
  const target=phase<2?s.target:[['E1',100],['E2',80],['E3',60]]; table(g,{x:575,y:140,w:330,columns:['EVENT_ID','VALUE'],rows:target,title:'Target table',focus:phase>=2?d3.range(target.length):[]});
  text(g,480,230,'→',{size:40,weight:500,anchor:'middle',fill:phase>=2?good:muted}); if(phase===1) pill(g,410,280,'MATCH BY event_id'); if(phase>=2) pill(g,413,280,'UPSERT',goodSoft,good); if(phase===3) pill(g,363,400,'SECOND RUN = SAME STATE',goodSoft,good);
}

function renderWatermark(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleLinear().domain([0,9]).range([90,865]); const yEvent=210,yArr=330;
  g.append('line').attr('x1',90).attr('y1',yEvent).attr('x2',865).attr('y2',yEvent).attr('stroke',line).attr('stroke-width',3);g.append('line').attr('x1',90).attr('y1',yArr).attr('x2',865).attr('y2',yArr).attr('stroke',line).attr('stroke-width',3);
  text(g,40,yEvent+4,'event',{size:9,fill:muted}); text(g,40,yArr+4,'arrival',{size:9,fill:muted});
  s.events.forEach(e=>{if(e.arrival>f.t)return; const late=e.arrival>e.event; g.append('line').attr('x1',x(e.event)).attr('y1',yEvent+12).attr('x2',x(e.arrival)).attr('y2',yArr-12).attr('stroke',late?accent:line).attr('stroke-width',2).attr('stroke-dasharray',late?'4 3':null);g.append('circle').attr('cx',x(e.event)).attr('cy',yEvent).attr('r',9).attr('fill',late?accentSoft:surface).attr('stroke',late?accent:line);text(g,x(e.event),yEvent+4,e.id,{anchor:'middle',size:9,weight:850});g.append('circle').attr('cx',x(e.arrival)).attr('cy',yArr).attr('r',8).attr('fill',late?accent:muted);});
  const observed=Math.max(...s.events.filter(e=>e.arrival<=f.t).map(e=>e.event)); const wm=observed-s.allowed; g.append('line').attr('x1',x(wm)).attr('x2',x(wm)).attr('y1',145).attr('y2',390).attr('stroke',bad).attr('stroke-width',3); pill(g,x(wm)-45,120,`WM ${wm}`,badSoft,bad);
}

function renderDag(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const done=new Set(f.done||[]),active=new Set(f.active||[]),failed=new Set(f.failed||[]),blocked=new Set(f.blocked||[]); const map=new Map(s.nodes.map(([id,x,y])=>[id,{id,x,y}]));
  s.links.forEach(([a,b])=>{const A=map.get(a),B=map.get(b);g.append('path').attr('d',`M${A.x+60},${A.y} C${(A.x+B.x)/2},${A.y} ${(A.x+B.x)/2},${B.y} ${B.x-60},${B.y}`).attr('fill','none').attr('stroke',failed.has(a)?bad:(done.has(a)&&active.has(b)?accent:line)).attr('stroke-width',failed.has(a)?3:2.3);});
  s.nodes.forEach(([id,x,y])=>{let fill=surface,stroke=line;if(done.has(id)){fill=goodSoft;stroke=good}if(active.has(id)){fill=accentSoft;stroke=accent}if(failed.has(id)){fill=badSoft;stroke=bad}if(blocked.has(id)){fill=surface2;stroke=line}rect(g,x-60,y-28,120,56,{rx:13,fill,stroke,sw:(active.has(id)||failed.has(id))?2.5:1.2});text(g,x,y+4,id.replaceAll('_',' '),{anchor:'middle',size:10,weight:850,fill:blocked.has(id)?muted:ink});});
}

function renderStorage(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0; const cols=s.columns; const rgX=[65,355,645];
  s.rowGroups.forEach((rg,i)=>{rect(g,rgX[i],135,250,235,{rx:15,fill:phase>=2&&i===1?surface2:surface,stroke:phase>=2&&i===1?muted:line,sw:1.3});text(g,rgX[i]+125,162,`Row group ${i+1}`,{anchor:'middle',weight:900});text(g,rgX[i]+125,180,rg.rows,{anchor:'middle',size:9,fill:muted});cols.forEach((c,ci)=>{const active=phase<1||['customer_id','country','revenue'].includes(c); const y=202+ci*38;rect(g,rgX[i]+18,y,214,30,{rx:8,fill:active?accentSoft:surface2,stroke:active?accent:line});text(g,rgX[i]+30,y+20,c,{size:10,weight:active?850:550,fill:active?ink:muted});});if(phase>=2&&i===1){pill(g,rgX[i]+72,324,'SKIPPED',surface2,muted);}});
  if(phase===1) pill(g,365,406,'read 3 / 4 columns'); if(phase>=2) pill(g,356,406,'skip impossible row groups',goodSoft,good);
}

function renderDelta(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const v=f.version; const versions=[10,11,12];
  versions.forEach((ver,i)=>{const x=95+i*265; rect(g,x,120,205,66,{rx:13,fill:(v===ver||v==='time-travel')?accentSoft:surface,stroke:(v===ver||v==='time-travel')?accent:line});text(g,x+102,148,`_delta_log v${ver}`,{anchor:'middle',weight:850});text(g,x+102,169,s.code[i],{anchor:'middle',size:8,fill:muted});if(i<2)g.append('line').attr('x1',x+205).attr('y1',153).attr('x2',x+265).attr('y2',153).attr('stroke',line).attr('stroke-width',2);});
  const files=v===10?['A','B']:v===11?['B','C']:['B','C','D']; const all=['A','B','C','D']; all.forEach((file,i)=>{const on=files.includes(file);rect(g,170+i*170,285,120,76,{rx:13,fill:on?goodSoft:surface2,stroke:on?good:line});text(g,230+i*170,318,`file ${file}.parquet`,{anchor:'middle',weight:850,fill:on?ink:muted});text(g,230+i*170,340,on?'ACTIVE':'inactive',{anchor:'middle',size:9,fill:on?good:muted,weight:850});});
  if(v==='time-travel') pill(g,360,410,'CHOOSE HISTORICAL SNAPSHOT');
}

function renderBinary(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleBand().domain(d3.range(s.values.length)).range([55,905]).padding(.08); const y=215;
  s.values.forEach((v,i)=>{let fill=surface,stroke=line,op=.35;if(i>=f.lo&&i<=f.hi){fill=accentSoft;stroke=accent;op=1}if(i===f.mid){fill=goodSoft;stroke=good;op=1}rect(g,x(i),y,x.bandwidth(),70,{rx:10,fill,stroke,sw:i===f.mid?2.5:1});text(g,x(i)+x.bandwidth()/2,y+42,v,{anchor:'middle',weight:850,fill:op<1?muted:ink});text(g,x(i)+x.bandwidth()/2,y+91,i,{anchor:'middle',size:8,fill:muted});});
  text(g,x(f.lo)+x.bandwidth()/2,185,'lo',{anchor:'middle',size:9,weight:850,fill:accent}); text(g,x(f.mid)+x.bandwidth()/2,165,'mid',{anchor:'middle',size:9,weight:850,fill:good}); text(g,x(f.hi)+x.bandwidth()/2,185,'hi',{anchor:'middle',size:9,weight:850,fill:accent});
}

function renderArray(svg,s,f,duration){
  base(svg,s.title,s.subtitle); const g=svg.selectAll('g.layer-main').data([0]).join('g').attr('class','layer-main'); const order=f.order||d3.range(s.values.length); const x=d3.scaleBand().domain(d3.range(order.length)).range([80,880]).padding(.16); const max=d3.max(s.values); const y=d3.scaleLinear().domain([0,max]).range([400,130]); const data=s.values.map((v,i)=>({id:i,v,slot:order.indexOf(i)})); const sel=g.selectAll('g.arr').data(data,d=>d.id); const en=sel.enter().append('g').attr('class','arr');en.append('rect');en.append('text'); sel.merge(en).transition().duration(duration).attr('transform',d=>`translate(${x(d.slot)},0)`);sel.merge(en).select('rect').attr('y',d=>y(d.v)).attr('width',x.bandwidth()).attr('height',d=>400-y(d.v)).attr('rx',8).attr('fill',d=>f.done?.includes(d.id)?goodSoft:f.focus?.includes(d.slot)?accentSoft:surface2).attr('stroke',d=>f.done?.includes(d.id)?good:f.focus?.includes(d.slot)?accent:line).attr('stroke-width',d=>f.focus?.includes(d.slot)?2.5:1.3);sel.merge(en).select('text').attr('x',x.bandwidth()/2).attr('y',d=>y(d.v)-10).attr('text-anchor','middle').attr('fill',ink).attr('font-size',12).attr('font-weight',850).text(d=>d.v);
}

function histogram(values,bins=12){const ext=d3.extent(values);const b=d3.bin().domain(ext).thresholds(bins)(values);return b;}
function renderSampling(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const rng=d3.randomLcg(.42); const means=[]; for(let r=0;r<f.reps;r++){let sum=0;for(let i=0;i<f.n;i++)sum+=s.population[Math.floor(rng()*s.population.length)];means.push(sum/f.n);} const bins=histogram(means,14); const x=d3.scaleLinear().domain(d3.extent(means)).range([80,880]); const y=d3.scaleLinear().domain([0,d3.max(bins,b=>b.length)]).range([400,130]); bins.forEach(b=>{const xx=x(b.x0),ww=Math.max(1,x(b.x1)-x(b.x0)-2);rect(g,xx,y(b.length),ww,400-y(b.length),{rx:2,fill:accentSoft,stroke:accent});}); pill(g,360,430,`sample size n = ${f.n} · ${f.reps} repetitions`);
}

function renderScatter(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleLinear().domain([0,8]).range([85,875]),y=d3.scaleLinear().domain([0,9]).range([400,110]); g.append('line').attr('x1',85).attr('y1',400).attr('x2',875).attr('y2',400).attr('stroke',line);g.append('line').attr('x1',85).attr('y1',400).attr('x2',85).attr('y2',100).attr('stroke',line);s.points.forEach(([px,py])=>g.append('circle').attr('cx',x(px)).attr('cy',y(py)).attr('r',7).attr('fill',surface).attr('stroke',accent).attr('stroke-width',2));const x1=.2,x2=7.8;g.append('line').attr('x1',x(x1)).attr('y1',y(f.b0+f.b1*x1)).attr('x2',x(x2)).attr('y2',y(f.b0+f.b1*x2)).attr('stroke',good).attr('stroke-width',4);s.points.forEach(([px,py])=>{const yh=f.b0+f.b1*px;g.append('line').attr('x1',x(px)).attr('x2',x(px)).attr('y1',y(py)).attr('y2',y(yh)).attr('stroke',bad).attr('stroke-dasharray','3 3');});
}

function sigmoid(z){return 1/(1+Math.exp(-z));}
function renderSigmoid(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleLinear().domain([-6,6]).range([90,880]),y=d3.scaleLinear().domain([0,1]).range([400,110]); const pts=d3.range(-6,6.01,.1);const lineGen=d3.line().x(d=>x(d)).y(d=>y(sigmoid(d)));g.append('path').attr('d',lineGen(pts)).attr('fill','none').attr('stroke',accent).attr('stroke-width',4);g.append('line').attr('x1',90).attr('y1',400).attr('x2',880).attr('y2',400).attr('stroke',line);g.append('line').attr('x1',90).attr('y1',400).attr('x2',90).attr('y2',100).attr('stroke',line);if(f.showThreshold){g.append('line').attr('x1',90).attr('x2',880).attr('y1',y(f.threshold)).attr('y2',y(f.threshold)).attr('stroke',bad).attr('stroke-width',2).attr('stroke-dasharray','6 5');pill(g,720,y(f.threshold)-33,`threshold ${f.threshold.toFixed(2)}`,badSoft,bad);}text(g,95,95,'probability',{size:9,fill:muted});text(g,880,424,'linear score z',{size:9,fill:muted,anchor:'end'});
}

function renderDecisionTree(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0;
  const nodes=[['All rows',480,115],['Sunny',260,225],['Overcast',480,225],['Rain',700,225],['Humidity?',260,335],['Yes',480,335],['Wind?',700,335],['No / Yes',260,430],['Yes',480,430],['No / Yes',700,430]]; const edges=[[0,1],[0,2],[0,3],[1,4],[2,5],[3,6],[4,7],[5,8],[6,9]];edges.forEach(([a,b])=>{if(phase<1&&a>0)return;if(phase<2&&a>=1)return;if(phase<3&&a>=4)return;g.append('line').attr('x1',nodes[a][1]).attr('y1',nodes[a][2]+25).attr('x2',nodes[b][1]).attr('y2',nodes[b][2]-25).attr('stroke',line).attr('stroke-width',2);});nodes.forEach((n,i)=>{if((phase<1&&i>0)||(phase<2&&i>3)||(phase<3&&i>6))return;const leaf=i>=7||i===5;rect(g,n[1]-65,n[2]-23,130,46,{rx:11,fill:leaf?goodSoft:(i===0?accentSoft:surface),stroke:leaf?good:(i===0?accent:line)});text(g,n[1],n[2]+4,n[0],{anchor:'middle',size:10,weight:850});});
}

function renderForest(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const n=f.trees||1; const max=7; for(let i=0;i<n;i++){const row=Math.floor(i/4),col=i%4,x=90+col*210,y=130+row*170;rect(g,x,y,145,125,{rx:13,fill:surface,stroke:line});text(g,x+72,y+22,`Tree ${i+1}`,{anchor:'middle',weight:850});g.append('line').attr('x1',x+72).attr('y1',y+40).attr('x2',x+38).attr('y2',y+78).attr('stroke',accent);g.append('line').attr('x1',x+72).attr('y1',y+40).attr('x2',x+108).attr('y2',y+78).attr('stroke',accent);g.append('circle').attr('cx',x+72).attr('cy',y+38).attr('r',6).attr('fill',accentSoft).attr('stroke',accent);g.append('circle').attr('cx',x+38).attr('cy',y+82).attr('r',6).attr('fill',goodSoft).attr('stroke',good);g.append('circle').attr('cx',x+108).attr('cy',y+82).attr('r',6).attr('fill',badSoft).attr('stroke',bad);} if(f.vote) pill(g,370,458,'FINAL VOTE / AVERAGE',goodSoft,good);
}

function assign(points,centroids){return points.map(p=>{let best=0,bd=Infinity;centroids.forEach((c,i)=>{const d=(p[0]-c[0])**2+(p[1]-c[1])**2;if(d<bd){bd=d;best=i;}});return best;});}
function renderKmeans(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleLinear().domain([0,10]).range([100,870]),y=d3.scaleLinear().domain([0,9]).range([410,110]); const as=f.assign?assign(s.points,f.centroids):s.points.map(()=>-1);s.points.forEach((p,i)=>g.append('circle').attr('cx',x(p[0])).attr('cy',y(p[1])).attr('r',8).attr('fill',as[i]===0?accentSoft:as[i]===1?goodSoft:surface).attr('stroke',as[i]===0?accent:as[i]===1?good:muted).attr('stroke-width',2));f.centroids.forEach((c,i)=>{g.append('path').attr('d',d3.symbol().type(d3.symbolStar).size(260)()).attr('transform',`translate(${x(c[0])},${y(c[1])})`).attr('fill',i===0?accent:good);});
}

function renderPca(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const x=d3.scaleLinear().domain([-4,4]).range([120,840]),y=d3.scaleLinear().domain([-3.5,3.5]).range([410,110]);s.points.forEach(p=>g.append('circle').attr('cx',x(p[0])).attr('cy',y(p[1])).attr('r',7).attr('fill',surface).attr('stroke',accent).attr('stroke-width',2));const a=f.angle*Math.PI/180,dx=Math.cos(a)*4,dy=Math.sin(a)*4;g.append('line').attr('x1',x(-dx)).attr('y1',y(-dy)).attr('x2',x(dx)).attr('y2',y(dy)).attr('stroke',good).attr('stroke-width',4);if(f.project){s.points.forEach(p=>{const t=p[0]*Math.cos(a)+p[1]*Math.sin(a);const q=[t*Math.cos(a),t*Math.sin(a)];g.append('line').attr('x1',x(p[0])).attr('y1',y(p[1])).attr('x2',x(q[0])).attr('y2',y(q[1])).attr('stroke',muted).attr('stroke-dasharray','3 3');});}
}

function renderMatrix(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const vals=s.values; const cells=[['TP',vals.TP,260,170,goodSoft,good],['FP',vals.FP,510,170,badSoft,bad],['FN',vals.FN,260,315,badSoft,bad],['TN',vals.TN,510,315,goodSoft,good]];text(g,185,135,'Actual +',{size:10,fill:muted});text(g,680,135,'Actual −',{size:10,fill:muted});text(g,100,220,'Pred +',{size:10,fill:muted});text(g,100,365,'Pred −',{size:10,fill:muted});const focus=new Set(f.focus||[]);cells.forEach(([k,v,x,y,fi,st])=>{const on=focus.has(k);rect(g,x,y,190,105,{rx:15,fill:on?fi:surface,stroke:on?st:line,sw:on?3:1.2});text(g,x+22,y+30,k,{weight:900,fill:on?st:muted});text(g,x+95,y+72,v,{anchor:'middle',size:32,weight:900});});
}

function renderLayers(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0; const y0=365; s.layers.forEach((l,i)=>{const y=y0-i*62;rect(g,240,y,480,48,{rx:10,fill:i===2?accentSoft:surface,stroke:i===2?accent:line});text(g,480,y+29,l,{anchor:'middle',weight:800,size:11});}); if(phase>=1){rect(g,220,86,520,46,{rx:11,fill:goodSoft,stroke:good});text(g,480,115,'writable container layer',{anchor:'middle',weight:850,fill:good});g.append('line').attr('x1',480).attr('y1',132).attr('x2',480).attr('y2',302).attr('stroke',good).attr('stroke-dasharray','5 4');}if(phase>=2){pill(g,360,430,'same image → many containers');}if(phase>=3){pill(g,365,155,'use volumes for durable state',surface2,muted);}
}

function renderGit(svg,s,f){
  base(svg,s.title,s.subtitle); const g=resetLayer(svg); const phase=f.phase??0; const stages=[['working tree',120],['staging index',330],['local commit',555],['remote repo',785]]; stages.forEach(([label,x],i)=>{rect(g,x-80,205,160,95,{rx:15,fill:i<=phase?accentSoft:surface,stroke:i<=phase?accent:line,sw:i===phase?2.7:1.2});text(g,x,245,label,{anchor:'middle',weight:850});text(g,x,270,['files','selected changes','snapshot + parent','hosted refs'][i],{anchor:'middle',size:9,fill:muted});if(i<stages.length-1)g.append('line').attr('x1',x+80).attr('y1',252).attr('x2',stages[i+1][1]-80).attr('y2',252).attr('stroke',i<phase?accent:line).attr('stroke-width',3);});
}

export const renderers = {
  join:renderJoin, window:renderWindow, rank:renderRank, btree:renderBTree, plan:renderPlan,
  partition:renderPartition, broadcast:renderBroadcast, pipeline:renderPipeline, dax:renderDax,
  star:renderStar, interval:renderInterval, idempotency:renderIdempotency, watermark:renderWatermark,
  dag:renderDag, storage:renderStorage, delta:renderDelta, binary:renderBinary, array:renderArray,
  sampling:renderSampling, scatter:renderScatter, sigmoid:renderSigmoid, decisionTree:renderDecisionTree,
  forest:renderForest, kmeans:renderKmeans, pca:renderPca, matrix:renderMatrix, layers:renderLayers, git:renderGit
};

export function renderScene(svgNode, scene, frame, {duration=520}={}) {
  const normalized=validateSceneShape(scene);
  const svg=d3.select(svgNode);
  svg.selectAll('*').interrupt();
  const renderer=renderers[normalized.renderer];
  if(!renderer) throw new Error(`Unknown renderer ${normalized.renderer}`);
  renderer(svg,normalized,frame,duration);
  svg.selectAll('desc').data([0]).join('desc').text(`${normalized.subtitle || ''} ${frame.caption || ''}`.trim());
}
