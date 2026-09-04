export const EXAMPLES = [
  {
    id: 'economist-gdp',
    group: 'Editorial',
    label: 'GDP per hour',
    publisher: 'Economist inspired',
    description: 'Multi-series indexed productivity line chart with direct labels.',
    spec: {
      version: '1.0', mark: 'line', theme: 'economist',
      title: 'Productivity has pulled apart', subtitle: 'GDP per hour worked index, 2012 = 100',
      source: 'The Economist GDP/hour dataset supplied to this project · indexed 2012=100', width: 900, height: 560,
      data: [
        {year:'2012-01-01', country:'United States', value:100.0}, {year:'2014-01-01', country:'United States', value:104.8}, {year:'2016-01-01', country:'United States', value:108.1}, {year:'2018-01-01', country:'United States', value:115.3}, {year:'2020-01-01', country:'United States', value:125.9}, {year:'2022-01-01', country:'United States', value:141.5}, {year:'2023-01-01', country:'United States', value:148.9},
        {year:'2012-01-01', country:'Germany', value:100.0}, {year:'2014-01-01', country:'Germany', value:107.8}, {year:'2016-01-01', country:'Germany', value:115.8}, {year:'2018-01-01', country:'Germany', value:125.2}, {year:'2020-01-01', country:'Germany', value:137.4}, {year:'2022-01-01', country:'Germany', value:153.8}, {year:'2023-01-01', country:'Germany', value:156.0},
        {year:'2012-01-01', country:'France', value:100.0}, {year:'2014-01-01', country:'France', value:108.7}, {year:'2016-01-01', country:'France', value:115.3}, {year:'2018-01-01', country:'France', value:123.4}, {year:'2020-01-01', country:'France', value:141.3}, {year:'2022-01-01', country:'France', value:142.9}, {year:'2023-01-01', country:'France', value:146.7},
        {year:'2012-01-01', country:'Korea', value:100.0}, {year:'2014-01-01', country:'Korea', value:104.7}, {year:'2016-01-01', country:'Korea', value:116.5}, {year:'2018-01-01', country:'Korea', value:130.4}, {year:'2020-01-01', country:'Korea', value:143.1}, {year:'2022-01-01', country:'Korea', value:155.6}, {year:'2023-01-01', country:'Korea', value:159.3}
      ],
      encoding: {x:{field:'year', type:'temporal'}, y:{field:'value', type:'quantitative'}, series:{field:'country', type:'nominal'}},
      options: {directLabels:true, animate:true, showPoints:false, yZero:false}
    }
  },
  {
    id: 'economist-bigmac', group: 'Editorial', label: 'Big Mac comparison', publisher: 'Economist inspired',
    description: 'Diverging dot plot built for compact cross-country comparisons.',
    spec: {
      version:'1.0', mark:'dot', theme:'economist', title:'Currencies still look cheap against the dollar', subtitle:'Big Mac valuation, % vs dollar',
      source:'Big Mac data snapshot supplied to this project · July 2026 · USD valuation', width:900, height:560,
      data:[{country:'Switzerland',value:48.5},{country:'Norway',value:33.6},{country:'Britain',value:33.1},{country:'Euro area',value:29.1},{country:'China',value:-23.8},{country:'South Africa',value:-29.9},{country:'Japan',value:-47.2}],
      encoding:{x:{field:'value',type:'quantitative'},y:{field:'country',type:'nominal'}}, options:{animate:true,directLabels:true,diverging:true,xSuffix:'%'}
    }
  },
  {
    id:'bbc-life', group:'Editorial', label:'BBC bar chart', publisher:'BBC inspired', description:'Horizontal ranked bars with direct values and a publication footer.',
    spec:{version:'1.0',mark:'bar',theme:'bbc',title:'Living longer',subtitle:'Illustrative life expectancy, selected countries',source:'Illustrative data · BBC-style cookbook pattern',width:900,height:560,
      data:[{country:'Japan',value:84.5},{country:'Switzerland',value:84.0},{country:'Norway',value:83.4},{country:'France',value:83.1},{country:'United Kingdom',value:81.2}],
      encoding:{x:{field:'value',type:'quantitative'},y:{field:'country',type:'nominal'}},options:{orientation:'horizontal',sort:'descending',directLabels:true,animate:true,xSuffix:' yrs',yZero:true}}
  },
  {
    id:'bar-race', group:'Animated patterns', label:'Ranked timeline race', publisher:'D3 pattern',
    description:'Reusable temporal ranking engine with stable keyed transitions and a shared play/scrub controller.',
    spec:{version:'1.0',mark:'barRace',theme:'newsroom',title:'Workload mix changes over time',subtitle:'Illustrative jobs processed by domain',source:'Illustrative data · reusable temporal ranking pattern',width:900,height:590,
      data:[
        {time:2022,name:'Finance',value:38},{time:2022,name:'Sales',value:34},{time:2022,name:'Product',value:29},{time:2022,name:'Operations',value:27},{time:2022,name:'Marketing',value:19},{time:2022,name:'Support',value:15},
        {time:2023,name:'Finance',value:43},{time:2023,name:'Sales',value:39},{time:2023,name:'Product',value:37},{time:2023,name:'Operations',value:31},{time:2023,name:'Marketing',value:25},{time:2023,name:'Support',value:21},
        {time:2024,name:'Finance',value:48},{time:2024,name:'Product',value:47},{time:2024,name:'Sales',value:44},{time:2024,name:'Operations',value:40},{time:2024,name:'Marketing',value:30},{time:2024,name:'Support',value:27},
        {time:2025,name:'Product',value:58},{time:2025,name:'Finance',value:54},{time:2025,name:'Operations',value:50},{time:2025,name:'Sales',value:49},{time:2025,name:'Marketing',value:37},{time:2025,name:'Support',value:34},
        {time:2026,name:'Product',value:68},{time:2026,name:'Operations',value:63},{time:2026,name:'Finance',value:60},{time:2026,name:'Sales',value:56},{time:2026,name:'Support',value:44},{time:2026,name:'Marketing',value:42}
      ],
      options:{animate:true,timeField:'time',nameField:'name',valueField:'value',topN:6,interval:1050}}
  },
  {
    id:'lineage-force', group:'Animated patterns', label:'Interactive lineage network', publisher:'D3 force',
    description:'Drag + zoom force simulation for pipelines, lineage, architecture and dependency graphs.',
    spec:{version:'1.0',mark:'force',theme:'newsroom',title:'From source systems to decisions',subtitle:'Interactive lineage · drag nodes, pan or zoom',source:'Illustrative data engineering lineage',width:900,height:590,
      data:[
        {id:'ERP',group:'source',value:8},{id:'CRM',group:'source',value:7},{id:'Events',group:'source',value:6},{id:'Ingest',group:'pipeline',value:10},{id:'Bronze',group:'lakehouse',value:11},{id:'Silver',group:'lakehouse',value:13},{id:'Gold',group:'lakehouse',value:12},{id:'Semantic',group:'bi',value:10},{id:'Dashboard',group:'bi',value:9},{id:'ML Feature',group:'ml',value:8}
      ],
      links:[
        {source:'ERP',target:'Ingest',value:3},{source:'CRM',target:'Ingest',value:3},{source:'Events',target:'Ingest',value:2},{source:'Ingest',target:'Bronze',value:4},{source:'Bronze',target:'Silver',value:5},{source:'Silver',target:'Gold',value:4},{source:'Silver',target:'ML Feature',value:2},{source:'Gold',target:'Semantic',value:4},{source:'Semantic',target:'Dashboard',value:5}
      ],
      options:{animate:true,idField:'id',groupField:'group',valueField:'value',zoom:true,linkDistance:82,charge:-190}}
  },
  {
    id:'zoom-pack', group:'Animated patterns', label:'Zoomable hierarchy', publisher:'D3 hierarchy',
    description:'Click-to-zoom circle packing for cloud cost, org trees, file systems and nested business structures.',
    spec:{version:'1.0',mark:'pack',theme:'bbc',title:'A data platform is a hierarchy',subtitle:'Click a group to zoom · click the background to return',source:'Illustrative platform hierarchy',width:900,height:590,data:[],
      hierarchy:{name:'Platform',children:[
        {name:'Lakehouse',children:[{name:'Bronze',value:18},{name:'Silver',value:28},{name:'Gold',value:22}]},
        {name:'BI',children:[{name:'Semantic',value:17},{name:'Reports',value:13},{name:'Self-service',value:9}]},
        {name:'ML',children:[{name:'Features',value:11},{name:'Models',value:8},{name:'Serving',value:6}]},
        {name:'Ops',children:[{name:'Orchestration',value:10},{name:'Monitoring',value:8},{name:'CI/CD',value:7}]}
      ]}, options:{animate:true,nameField:'name',valueField:'value'}}
  },
  {
    id:'flow-map', group:'Animated patterns', label:'Animated geographic flows', publisher:'D3 geo',
    description:'Great-arc routes with path drawing, moving particles and pan/zoom for traffic, trade or data replication.',
    spec:{version:'1.0',mark:'flowMap',theme:'economist',title:'Data moves between regional hubs',subtitle:'Illustrative replication flows · line width encodes volume',source:'Illustrative routes · geographic pattern',width:900,height:590,data:[
      {id:'oslo-london',name:'Oslo → London',source:[10.7522,59.9139],target:[-0.1276,51.5072],value:42},
      {id:'london-frankfurt',name:'London → Frankfurt',source:[-0.1276,51.5072],target:[8.6821,50.1109],value:57},
      {id:'frankfurt-newyork',name:'Frankfurt → New York',source:[8.6821,50.1109],target:[-74.0060,40.7128],value:49},
      {id:'frankfurt-singapore',name:'Frankfurt → Singapore',source:[8.6821,50.1109],target:[103.8198,1.3521],value:36},
      {id:'newyork-london',name:'New York → London',source:[-74.0060,40.7128],target:[-0.1276,51.5072],value:31}
    ],geography:null,sources:{geography:'./data/geo/world-mini.geojson'},options:{animate:true,zoom:true,particlesPerPath:2,particleSpeed:.00012}}
  },
  {
    id:'ratp', group:'Legacy rebuilt', label:'RATP metro traffic', publisher:'DataVis legacy',
    description:'Recovered Paris Metro schema modernised with D3 geographic projection and traffic-scaled stations.',
    spec:{version:'1.0',mark:'metro',theme:'newsroom',title:'Paris metro traffic',subtitle:'Station size represents annual traffic · recovered schema sample',source:'Bundled RATP-shaped recovery data',width:900,height:590,data:[],lines:[],sources:{stations:'./data/ratp/stations.json',lines:'./data/ratp/lines.json'},options:{animate:true,directLabels:true}}
  },
  {
    id:'earthquakes', group:'Legacy rebuilt', label:'Earthquake playback', publisher:'DataVis legacy',
    description:'World map with animated magnitude bubbles and shared play/scrub timeline using the bundled recovery fixture.',
    spec:{version:'1.0',mark:'geoBubble',theme:'newsroom',title:'Earthquakes since 1901',subtitle:'Animated recovery demo · bubble area scales with magnitude',source:'Bundled synthetic recovery fixture',width:900,height:590,data:[],geography:null,sources:{points:'./data/geo/earthquakes-dummy.geojson',geography:'./data/geo/world-mini.geojson'},options:{animate:true,timeline:true,startYear:1901,endYear:2020,trailYears:7,interval:220}}
  }
];

export async function hydrateExample(example) {
  const copy = JSON.parse(JSON.stringify(example));
  const spec = copy.spec;
  if (!spec.sources) return copy;
  if (spec.mark === 'metro') {
    const [stations, lines] = await Promise.all([fetch(spec.sources.stations).then(r => r.json()), fetch(spec.sources.lines).then(r => r.json())]);
    spec.data = stations.features || [];
    spec.lines = lines.features || [];
  }
  if (spec.mark === 'geoBubble') {
    const [points, geography] = await Promise.all([fetch(spec.sources.points).then(r => r.json()), fetch(spec.sources.geography).then(r => r.json())]);
    spec.data = points.features || [];
    spec.geography = geography;
  }
  if (spec.mark === 'flowMap' && spec.sources.geography) {
    spec.geography = await fetch(spec.sources.geography).then(r => r.json());
  }
  return copy;
}
