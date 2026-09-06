import { describe, expect, it } from 'vitest';
import type { WorkflowSpec } from '@conceptmotion/core';
import { migratedFigures } from '../../../../content/visuals';
import { tableTraceSandboxExamples } from './tableTraceExample';
import { parseSandboxFigure } from './visualSandbox';
describe('production Visual Sandbox validation',()=>{
  it('accepts every migrated production scene',()=>{for(const figure of migratedFigures)expect(parseSandboxFigure(JSON.stringify(figure)),figure.id).toMatchObject({figure,issues:[]});});
  it('accepts all five editable table-trace motion examples',()=>{
    expect(tableTraceSandboxExamples.map(figure=>figure.id)).toEqual(['sandbox-table-trace-filter','sandbox-table-trace-sort','sandbox-table-trace-group-sum','sandbox-table-trace-pivot','sandbox-table-trace-join']);
    for(const figure of tableTraceSandboxExamples){
      const result=parseSandboxFigure(JSON.stringify(figure));
      expect(result.issues,figure.id).toEqual([]);
      expect(result.figure?.id).toBe(figure.id);
    }
  });
  it('accepts a JSON-authored table trace and validates semantic references',()=>{
    const figure={id:'trace-filter',kind:'concept',rendererId:'table.trace',title:'Filter',fallbackText:'Filter rows.',spec:{kind:'table-trace',version:'1',id:'trace-filter',title:'Filter',views:[{id:'before',role:'input',table:{id:'orders',columns:[{id:'status'}],rows:[{id:'o1',values:{status:'late'}},{id:'o2',values:{status:'ok'}}]}},{id:'after',role:'output',table:{id:'orders',columns:[{id:'status'}],rows:[{id:'o1',values:{status:'late'}}]}}],relations:[{id:'predicate',kind:'use',from:[{viewId:'before',kind:'cell',rowId:'o1',columnId:'status'},{viewId:'before',kind:'cell',rowId:'o2',columnId:'status'}]},{id:'keep',kind:'map',from:[{viewId:'before',kind:'row',rowId:'o1'}],to:[{viewId:'after',kind:'row',rowId:'o1'}]},{id:'drop',kind:'drop',from:[{viewId:'before',kind:'row',rowId:'o2'}]}],frames:[{id:'read',activeRelationIds:['predicate']},{id:'result',activeRelationIds:['keep','drop']}]}};
    expect(parseSandboxFigure(JSON.stringify(figure))).toMatchObject({figure,issues:[]});
    const invalid={...figure,spec:{...figure.spec,relations:[{id:'bad',kind:'use',from:[{viewId:'before',kind:'cell',rowId:'o1',columnId:'missing'}]}]}};
    expect(parseSandboxFigure(JSON.stringify(invalid)).issues.join(' ')).toContain('unknown column');
  });
  it('rejects malformed JSON, wrong contracts and invalid graph references',()=>{
    expect(parseSandboxFigure('{').figure).toBeUndefined();
    expect(parseSandboxFigure('{}').issues.length).toBeGreaterThan(0);
    const figure={id:'bad',kind:'diagram',rendererId:'diagram.flow',title:'Bad',fallbackText:'Bad edge',spec:{kind:'diagram',id:'bad',version:'3',title:'Bad',nodes:[],edges:[{id:'bad',from:{nodeId:'missing'},to:{nodeId:'also-missing'}}]}};
    expect(parseSandboxFigure(JSON.stringify(figure)).issues.join(' ')).toContain('Unknown');
  });
  it('keeps future adapters renderable as accessible fallback and bounds large input',()=>{
    expect(parseSandboxFigure(JSON.stringify({id:'future',kind:'chart',rendererId:'future.chart',title:'Future',fallbackText:'Fallback',spec:{}})).figure).toBeDefined();
    expect(parseSandboxFigure(' '.repeat(1_000_001)).issues).toEqual(['The Figure JSON limit is 1 MB.']);
    expect(parseSandboxFigure('ø'.repeat(600_000)).issues).toEqual(['The Figure JSON limit is 1 MB.']);
  });
  it('rejects multiplicative joins before allocating their output',()=>{
    const rows=Array.from({length:1000},(_,index)=>({id:`r${index}`,values:{key:1}}));
    const figure={id:'large-join',kind:'concept',rendererId:'table.join',title:'Too large',fallbackText:'A bounded example is required.',spec:{kind:'join',id:'large-join',version:'3',join:{id:'cross',joinType:'cross',left:{id:'l',columns:[{id:'key'}],rows},right:{id:'r',columns:[{id:'key'}],rows},leftKey:'key',rightKey:'key'},revealCounts:[1]}};
    const result=parseSandboxFigure(JSON.stringify(figure));
    expect(result.figure).toBeUndefined();
    expect(result.issues[0]).toContain('Preview join budget exceeded');
  });
  it('bounds table traces by total teaching cells before rendering',()=>{
    const columns=Array.from({length:6},(_,index)=>({id:`c${index}`}));
    const rows=Array.from({length:1000},(_,rowIndex)=>({id:`r${rowIndex}`,values:Object.fromEntries(columns.map((column,columnIndex)=>[column.id,rowIndex+columnIndex]))}));
    const figure={id:'large-trace',kind:'concept',rendererId:'table.trace',title:'Too large',fallbackText:'A bounded trace is required.',spec:{kind:'table-trace',version:'1',id:'large-trace',title:'Too large',views:[{id:'before',role:'input',table:{id:'t',columns,rows}},{id:'after',role:'output',table:{id:'t',columns,rows}}],relations:[]}};
    const result=parseSandboxFigure(JSON.stringify(figure));
    expect(result.figure).toBeUndefined();
    expect(result.issues[0]).toContain('Preview table-trace budget exceeded');
  });
  it('validates workflow explanation references before replacing the last applied preview',()=>{
    const figure=migratedFigures.find(item=>item.id==='de-retry')!;
    const spec=figure.spec as unknown as WorkflowSpec;
    expect(spec.explanation).toBeDefined();
    const invalid={...figure,spec:{...spec,explanation:{...spec.explanation,steps:spec.explanation!.steps.map((step,index)=>index?step:{...step,focus:{...step.focus,entityIds:['task.missing']}})}}};
    const result=parseSandboxFigure(JSON.stringify(invalid));
    expect(result.figure).toBeUndefined();
    expect(result.issues.join(' ')).toContain('focus.entityIds');
  });
});
