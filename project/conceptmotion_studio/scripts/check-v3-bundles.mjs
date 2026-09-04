import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireBundlePrivacy } from './check-bundle-privacy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const apps=['formation','code-sandbox','code-interview','algorithm-atlas','architecture-atlas','pilot-center'];
const privacy=requireBundlePrivacy(root,apps.map(app=>`dist-${app}`));
const reports=apps.map(app=>{
  const output=path.join(root,`dist-${app}`);
  const manifest=JSON.parse(readFileSync(path.join(output,'.vite/manifest.json'),'utf8'));
  const entries=Object.keys(manifest).filter(key=>manifest[key].isEntry);
  if(entries.length===0)throw new Error(`${app}: application entry missing`);
  const closure=(start,dynamic=false)=>{
    const seen=new Set(),queue=[...start];
    while(queue.length){const key=queue.pop();if(seen.has(key))continue;seen.add(key);queue.push(...(manifest[key]?.imports??[]));if(dynamic)queue.push(...(manifest[key]?.dynamicImports??[]));}
    return [...seen];
  };
  const isMonaco=key=>/MonacoSurfaces|monaco-editor|monacoLoader|editor\.worker|json\.worker/i.test(key+' '+manifest[key]?.file);
  const initial=closure(entries);
  if(initial.some(isMonaco))throw new Error(`${app}: initial reading/catalog route eagerly includes Monaco`);
  const all=closure(entries,true);
  const initialStaticBytes=initial.reduce((sum,key)=>sum+statSync(path.join(output,manifest[key].file)).size,0);
  // Audited static closures are 366–493 kB; these floors leave bounded growth
  // without permitting a complete corpus or editor to slip into the entry path.
  const initialBudget={formation:650_000,'code-sandbox':550_000,'code-interview':650_000,'algorithm-atlas':700_000,'architecture-atlas':650_000,'pilot-center':650_000}[app];
  if(initialStaticBytes>initialBudget)throw new Error(`${app}: initial JS ${initialStaticBytes} exceeds audited budget ${initialBudget}`);
  const assets=path.join(output,'assets');
  const javascript=readdirSync(assets).filter(name=>name.endsWith('.js')).map(name=>readFileSync(path.join(assets,name),'utf8')).join('\n');
  if(javascript.includes('V3_PRIVATE_OVERLAY_MUST_NEVER_BUNDLE'))throw new Error(`${app}: private fixture leaked`);
  // A private overlay may only be read at user request at runtime; it is not a source import.
  if(Object.keys(manifest).some(key=>/projects\.private\.local/.test(key)))throw new Error(`${app}: private overlay appears in build graph`);
  const lazyEditor=all.filter(isMonaco);
  if(['formation','code-sandbox','code-interview'].includes(app)&&lazyEditor.length===0)throw new Error(`${app}: expected shared lazy editor is absent`);
  return {app,initialStaticBytes,initialBudget,initialExcludesMonaco:true,editorLazyChunks:lazyEditor.map(key=>manifest[key].file),privateOverlayExcluded:true};
});
const output=path.join(root,'qa/v3-bundles.json');
mkdirSync(path.dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify({schemaVersion:1,reports,privacy},null,2)+'\n');
console.log(JSON.stringify(reports,null,2));
console.log('V3 bundle/privacy boundaries: PASS');
