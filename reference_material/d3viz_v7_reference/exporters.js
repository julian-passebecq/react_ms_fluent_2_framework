const CORE_URL = 'https://d3ecosite.netlify.app/sandbox/lib/d3viz-core.js';
const D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';

function cleanSpec(spec) {
  const copy = JSON.parse(JSON.stringify(spec));
  if (copy.mark === 'geoBubble' && Array.isArray(copy.data) && copy.data.length > 80) copy.data = copy.data.slice(-80);
  return copy;
}

export function generateSpec(spec) { return JSON.stringify(cleanSpec(spec), null, 2); }

export function generateStandaloneHTML(spec) {
  const json = JSON.stringify(cleanSpec(spec)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(spec.title || 'D3 chart')}</title><script src="${D3_URL}"></script><style>body{margin:0;background:#f5f5f3;font-family:Arial,sans-serif}#chart{max-width:960px;margin:32px auto;background:#fff;box-shadow:0 10px 35px rgba(0,0,0,.08)}.chart-tooltip{position:absolute;background:#111;color:#fff;padding:8px 10px;font-size:12px;pointer-events:none;border-radius:3px}.chart-tooltip span{display:block;margin-top:4px}</style></head>
<body><div id="chart"></div><script type="module">import {renderChart} from '${CORE_URL}'; const spec=${json}; renderChart(document.querySelector('#chart'), spec);</script></body></html>`;
}

export function generateReact(spec) {
  const json = JSON.stringify(cleanSpec(spec), null, 2);
  return `import * as d3 from "d3";
import {useEffect, useRef} from "react";
import {renderChart} from "./d3viz-core.js";

const spec = ${json};

export default function EditorialChart({data = spec.data, width}) {
  const ref = useRef(null);
  useEffect(() => {
    globalThis.d3 = d3;
    renderChart(ref.current, {...spec, data, ...(width ? {width} : {})});
  }, [data, width]);
  return <div ref={ref} style={{width: "100%"}} />;
}`;
}

function powerBiRoles(spec) {
  if (['metro','geoBubble'].includes(spec.mark)) return [
    {name:'label', displayName:'Label', kind:'Grouping'}, {name:'x', displayName:'Longitude / X', kind:'Measure'},
    {name:'y', displayName:'Latitude / Y', kind:'Measure'}, {name:'size', displayName:'Size / magnitude', kind:'Measure'}
  ];
  const roles=[];
  if(spec.encoding?.x) roles.push({name:'x',displayName:spec.encoding.x.field||'X',kind:spec.encoding.x.type==='quantitative'?'Measure':'Grouping'});
  if(spec.encoding?.y) roles.push({name:'y',displayName:spec.encoding.y.field||'Y',kind:spec.encoding.y.type==='quantitative'?'Measure':'Grouping'});
  if(spec.encoding?.series) roles.push({name:'series',displayName:spec.encoding.series.field||'Series',kind:'Grouping'});
  return roles;
}

export function generatePowerBI(spec) {
  const roles=powerBiRoles(spec), roleJson=roles.map(r=>({displayName:r.displayName,name:r.name,kind:r.kind})), select=roles.map(r=>({for:{in:r.name}}));
  const capabilities={privileges:[],dataRoles:roleJson,dataViewMappings:[{table:{rows:{select}}}],supportsHighlight:true};
  const baseSpec=cleanSpec(spec); baseSpec.data=[]; delete baseSpec.sources; delete baseSpec.geography; delete baseSpec.lines;
  const visualTs=`import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
const chartSpec: any = ${JSON.stringify(baseSpec,null,2)};
export class Visual implements IVisual {
  private host: HTMLElement; private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  constructor(options: VisualConstructorOptions){this.host=options.element;this.svg=d3.select(this.host).append("svg").attr("class","d3viz-powerbi");}
  public update(options: VisualUpdateOptions): void {
    const view=options.dataViews?.[0],table=view?.table;if(!table)return;
    const width=Math.max(1,options.viewport.width),height=Math.max(1,options.viewport.height);this.svg.attr("width",width).attr("height",height).selectAll("*").remove();
    const columns=table.columns||[],rows=table.rows||[];const names=columns.map((c,i)=>c.roles?Object.keys(c.roles).find(k=>c.roles![k])||c.displayName||String(i):c.displayName||String(i));
    const data=rows.map(row=>Object.fromEntries(row.map((v,i)=>[names[i],v])));const margin={top:24,right:28,bottom:34,left:56},innerW=Math.max(10,width-margin.left-margin.right),innerH=Math.max(10,height-margin.top-margin.bottom),g=this.svg.append("g").attr("transform",\`translate(\${margin.left},\${margin.top})\`),accent=chartSpec.accent||"#e3120b";
    if(chartSpec.mark==="bar"||chartSpec.mark==="dot"){
      const xKey="x",yKey="y",x=d3.scaleLinear().domain(d3.extent(data,(d:any)=>Number(d[xKey])) as [number,number]).nice().range([0,innerW]),y=d3.scaleBand().domain(data.map((d:any)=>String(d[yKey]))).range([0,innerH]).padding(.28);g.append("g").attr("transform",\`translate(0,\${innerH})\`).call(d3.axisBottom(x));g.append("g").call(d3.axisLeft(y));
      if(chartSpec.mark==="bar")g.selectAll("rect").data(data).join("rect").attr("x",Math.min(0,x(0))).attr("y",(d:any)=>y(String(d[yKey]))!).attr("height",y.bandwidth()).attr("width",(d:any)=>Math.abs(x(Number(d[xKey]))-x(0))).attr("fill",accent);
      else g.selectAll("circle").data(data).join("circle").attr("cx",(d:any)=>x(Number(d[xKey]))).attr("cy",(d:any)=>y(String(d[yKey]))!+y.bandwidth()/2).attr("r",5).attr("fill",accent);
    } else {
      const xKey="x",yKey="y",sKey="series",x=d3.scaleLinear().domain(d3.extent(data,(d:any)=>Number(d[xKey])) as [number,number]).nice().range([0,innerW]),y=d3.scaleLinear().domain(d3.extent(data,(d:any)=>Number(d[yKey])) as [number,number]).nice().range([innerH,0]);g.append("g").attr("transform",\`translate(0,\${innerH})\`).call(d3.axisBottom(x));g.append("g").call(d3.axisLeft(y));
      if(chartSpec.mark==="scatter"||chartSpec.mark==="geoBubble"||chartSpec.mark==="metro")g.selectAll("circle").data(data).join("circle").attr("cx",(d:any)=>x(Number(d[xKey]))).attr("cy",(d:any)=>y(Number(d[yKey]))).attr("r",(d:any)=>Math.max(4,Math.sqrt(Math.abs(Number(d.size||16))))).attr("fill",accent).attr("fill-opacity",.7);
      else {const grouped=d3.groups(data,(d:any)=>String(d[sKey]??"Series")),color=d3.scaleOrdinal<string>().domain(grouped.map(d=>d[0])).range([accent,"#0f6b78","#6b7c93","#d9a441"]),line=d3.line<any>().x(d=>x(Number(d[xKey]))).y(d=>y(Number(d[yKey])));g.selectAll("path.series").data(grouped).join("path").attr("class","series").attr("fill","none").attr("stroke",d=>color(d[0])).attr("stroke-width",2.2).attr("d",d=>line(d[1])||"");}
    }
  }
}`;
  return {label:'Power BI custom visual bundle',files:{'src/visual.ts':visualTs,'capabilities.json':JSON.stringify(capabilities,null,2),'INSTALL.txt':'1. npm i -g powerbi-visuals-tools\n2. pbiviz new D3VizGenerated\n3. cd D3VizGenerated && npm i d3@latest @types/d3 --save\n4. Replace src/visual.ts and capabilities.json with the generated files.\n5. Run pbiviz start, then pbiviz package.\n\nTargets the modern Power BI custom visual API, not the retired 2017 editor-style D3 visual.'}};
}

function pythonSpecLiteral(spec){return JSON.stringify(cleanSpec(spec),null,2).replace(/'''/g,'\\u0027\\u0027\\u0027');}
function pythonHtmlBuilder(spec){const specText=pythonSpecLiteral(spec);return `import json\n\nspec = json.loads(r'''${specText}''')\n\ndef d3_html(chart_spec):\n    payload = json.dumps(chart_spec).replace("</", "<\\\\/")\n    return f'''<div id="chart"></div>\n<script src="${D3_URL}"></script>\n<script type="module">\nimport {renderChart} from "${CORE_URL}";\nconst spec = {payload};\nrenderChart(document.querySelector("#chart"), spec);\n</script>'''`;}
export function generateFabric(spec){return `# Microsoft Fabric notebook\n# Aggregate with PySpark/pandas, then render only a compact result.\n\n${pythonHtmlBuilder(spec)}\n\n# records = spark.sql("SELECT ...").limit(5000).toPandas().to_dict("records")\n# spec["data"] = records\n\ndisplayHTML(d3_html(spec))`;}
export function generateDatabricks(spec){return `# Databricks notebook\n# Use Spark/SQL for heavy computation; keep the browser payload compact.\n\n${pythonHtmlBuilder(spec)}\n\n# records = spark.sql("SELECT ...").limit(5000).toPandas().to_dict("records")\n# spec["data"] = records\n\ndisplayHTML(d3_html(spec))`;}
export function generateJupyter(spec){return `from IPython.display import HTML, display\n\n${pythonHtmlBuilder(spec)}\n\n# pandas: records = df.to_dict(orient="records")\n# Polars: records = df.to_dicts()\n# spec["data"] = records\n\ndisplay(HTML(d3_html(spec)))`;}
export function generateBigQuery(spec){return `# BigQuery Studio / Colab Enterprise notebook\nfrom IPython.display import HTML, display\n\n${pythonHtmlBuilder(spec)}\n\n# After a SQL cell produces df:\n# records = df.to_dict(orient="records")\n# spec["data"] = records\n\ndisplay(HTML(d3_html(spec)))`;}

export function generateAdapter(kind,spec){const x=spec.encoding?.x?.field||'x',y=spec.encoding?.y?.field||'y',series=spec.encoding?.series?.field,cols=[x,y,series].filter(Boolean);if(kind==='pandas')return `# pandas -> canonical records\nplot_df = df[[${cols.map(c=>`'${c}'`).join(', ')}]].dropna().copy()\nrecords = plot_df.to_dict(orient='records')\n# spec['data'] = records`;if(kind==='polars')return `# Polars -> canonical records\nplot_df = df.select([${cols.map(c=>`'${c}'`).join(', ')}]).drop_nulls()\nrecords = plot_df.to_dicts()\n# spec['data'] = records`;if(kind==='pyspark')return `# PySpark -> canonical records\nplot_sdf = df.select(${cols.map(c=>`'${c}'`).join(', ')})\n# Aggregate/filter first; never collect an unbounded Spark table into the browser.\nrecords = [row.asDict(recursive=True) for row in plot_sdf.limit(5000).collect()]\n# spec['data'] = records`;return '';}
export function flattenBundle(bundle){if(typeof bundle==='string')return bundle;return Object.entries(bundle.files).map(([name,content])=>`// ===== ${name} =====\n${content}`).join('\n\n');}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
