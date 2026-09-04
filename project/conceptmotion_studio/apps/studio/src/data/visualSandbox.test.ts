import { describe, expect, it } from 'vitest';
import { migratedFigures } from '../../../../content/visuals';
import { parseSandboxFigure } from './visualSandbox';
describe('production Visual Sandbox validation',()=>{
  it('accepts every migrated production scene',()=>{for(const figure of migratedFigures)expect(parseSandboxFigure(JSON.stringify(figure)),figure.id).toMatchObject({figure,issues:[]});});
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
});
