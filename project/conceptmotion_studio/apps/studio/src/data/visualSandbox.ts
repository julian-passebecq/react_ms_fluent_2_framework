import { compileTableState, compileWorkflowRun, validateDiagramSpec, validateLineageSpec, validateWorkflowSpec, type WorkflowSpec } from '@conceptmotion/core';
import { resolveSvgScene, type SvgSceneSpec } from '@conceptmotion/svg';
import { validateFigureSpec, type FigureSpec } from '@datapass/content';
import { createDefaultFigureRendererRegistry } from '@datapass/figure';

const registry = createDefaultFigureRendererRegistry();
function bounded(value: unknown, depth = 0): void {
  if (depth > 30) throw new Error('Specs may nest at most 30 levels.');
  if (Array.isArray(value)) {
    if(value.length > 1000) throw new Error('Spec arrays are limited to 1000 entries.');
    value.forEach(item=>bounded(item,depth+1));
  } else if (value && typeof value === 'object') Object.values(value).forEach(item=>bounded(item,depth+1));
}
/** Production contracts/compilers validate input; no imported code is evaluated. */
export function parseSandboxFigure(source: string): { figure?: FigureSpec; issues: readonly string[] } {
  try {
    if(source.length>1_000_000 || new TextEncoder().encode(source).byteLength>1_000_000) throw new Error('The Figure JSON limit is 1 MB.');
    const input:unknown=JSON.parse(source);
    bounded(input);
    const contentResult=validateFigureSpec(input);
    if(!contentResult.valid) return {issues:contentResult.issues.map(issue=>`${issue.path}: ${issue.message}`)};
    const figure=input as FigureSpec;
    const adapter=registry.get(figure.rendererId);
    // Unknown adapters deliberately exercise FigureView's accessible fallback.
    if(!adapter) return {figure,issues:[]};
    const adapterIssues=adapter.validate?.(figure)??[];
    if(adapterIssues.length) return {issues:adapterIssues};
    if(figure.rendererId.startsWith('static.')) return {figure,issues:[]};
    const spec=figure.spec as unknown as SvgSceneSpec;
    if(figure.rendererId.startsWith('workflow.')) {
      const workflow=figure.spec as unknown as WorkflowSpec;
      const validation=validateWorkflowSpec(workflow);
      if(!validation.valid) return {issues:validation.issues.map(issue=>issue.message)};
      workflow.runs?.forEach(run=>compileWorkflowRun(workflow,run.id));
    } else {
      if(!['table','join','loop','regression','diagram','lineage'].includes(spec.kind)) throw new Error('Unknown semantic scene kind.');
      if(spec.kind==='diagram' || spec.kind==='lineage') {
        const validation=spec.kind==='diagram'?validateDiagramSpec(spec):validateLineageSpec(spec);
        if(!validation.valid) return {issues:validation.issues.map(issue=>issue.message)};
      }
      const frames='frames' in spec ? spec.frames : undefined;
      if(frames && frames.length>256) throw new Error('A preview may contain at most 256 frames.');
      if(spec.kind==='join') {
        // Validate resource cost before the production compiler allocates every
        // matching pair. Even small JSON can describe a million-row cross join.
        const left=spec.join.left, right=spec.join.right;
        const pairs=left.rows.length*right.rows.length;
        const worstRows=pairs+left.rows.length+right.rows.length;
        if(pairs>10_000 || worstRows*(left.columns.length+right.columns.length)>10_000)
          throw new Error('Preview join budget exceeded (10,000 candidate pairs/cells). Reduce the example tables.');
      }
      if(spec.kind==='table') {
        for(const frame of spec.frames) {
          if(frame.rows.length*frame.columns.length>10_000) throw new Error('Preview table budget exceeded (10,000 cells). Reduce the example table.');
          compileTableState({id:frame.tableId,columns:frame.columns,rows:frame.rows});
          const ids=new Set(frame.rows.map(row=>row.id));
          if(frame.rowOrder.some(id=>!ids.has(id)) || frame.visibleRowIds.some(id=>!ids.has(id))) throw new Error('Table frame references an unknown row.');
        }
      }
      for(let index=0;index<Math.max(1,frames?.length??0);index++) resolveSvgScene(spec,index);
    }
    return {figure,issues:[]};
  } catch(error) { return {issues:[error instanceof Error?error.message:String(error)]}; }
}
