import {EXAMPLES, hydrateExample} from './examples.js';
import {getTheme} from './lib/themes.js';
import {renderChart, validateSpec, svgToString} from './lib/d3viz-core.js';
import {generateSpec, generateStandaloneHTML, generateReact, generatePowerBI, generateFabric, generateDatabricks, generateJupyter, generateBigQuery, generateAdapter, flattenBundle} from './lib/exporters.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const ADVANCED_MARKS = ['barRace', 'force', 'pack', 'flowMap'];
const SPECIAL_MARKS = ['metro', 'geoBubble', ...ADVANCED_MARKS];
const state = {exampleId:'economist-gdp', spec:null, target:'react', adapter:'pandas', renderResult:null, custom:false};
const targetMeta = {
  react:['React component','jsx'], powerbi:['Power BI custom visual bundle','txt'], fabric:['Microsoft Fabric notebook','py'],
  databricks:['Databricks notebook','py'], jupyter:['Jupyter notebook cell','py'], bigquery:['BigQuery / Colab Enterprise notebook','py'],
  html:['Standalone HTML','html'], spec:['Canonical chart spec','json']
};
const clone = value => JSON.parse(JSON.stringify(value));

function setTab(id) {
  $$('.top-tabs button').forEach(button => button.classList.toggle('active', button.dataset.tab === id));
  $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === id));
  if (id === 'showcase') requestAnimationFrame(renderShowcase);
}

function renderExampleList() {
  const root = $('#example-list'); root.innerHTML = '';
  EXAMPLES.forEach(example => {
    const button = document.createElement('button');
    button.className = `example-item ${example.id === state.exampleId ? 'active' : ''}`;
    button.innerHTML = `<span><em>${example.group}</em><em>${example.publisher}</em></span><b>${example.label}</b><small>${example.description}</small>`;
    button.addEventListener('click', () => selectExample(example.id));
    root.appendChild(button);
  });
}

async function selectExample(id) {
  const base = EXAMPLES.find(example => example.id === id); if (!base) return;
  state.exampleId = id; state.custom = false; renderExampleList(); $('#render-status').textContent = 'Loading example…';
  try {
    const hydrated = await hydrateExample(base);
    state.spec = hydrated.spec;
    $('#preview-name').textContent = hydrated.label;
    syncInspector(); renderCurrent(); updateCode();
  } catch (error) {
    $('#render-status').textContent = `Could not load example: ${error.message}`;
  }
}

function fieldKeys() {
  if (!state.spec?.data?.length) return [];
  const row = state.spec.data[0]; if (row?.type === 'Feature') return [];
  return Object.keys(row).filter(key => !['geometry', 'properties'].includes(key));
}

function inferType(field) {
  const values = (state.spec?.data || []).map(d => d[field]).filter(value => value !== null && value !== undefined && value !== '');
  if (!values.length) return 'nominal';
  if (values.every(value => typeof value === 'number' || (!Number.isNaN(Number(value)) && String(value).trim() !== ''))) return 'quantitative';
  const hits = values.slice(0, 10).map(value => Date.parse(value)).filter(Number.isFinite);
  return hits.length >= Math.min(3, values.slice(0, 10).length) ? 'temporal' : 'nominal';
}

function fillSelect(select, keys, current, allowNone = false) {
  const values = allowNone ? ['', ...keys] : keys;
  select.innerHTML = values.map(key => `<option value="${escapeAttr(key)}">${key || 'None'}</option>`).join('');
  if (values.includes(current)) select.value = current;
}

function syncInspector() {
  const spec = state.spec; if (!spec) return;
  $('#theme-select').value = spec.theme || 'economist';
  $('#title-input').value = spec.title || '';
  $('#subtitle-input').value = spec.subtitle || '';
  $('#source-input').value = spec.source || '';
  $('#mark-select').value = spec.mark;
  $('#animate-toggle').checked = spec.options?.animate !== false;
  $('#labels-toggle').checked = spec.options?.directLabels !== false;
  const theme = getTheme(spec.theme, spec.accent);
  $('#accent-input').value = normalizeHex(spec.accent || theme.accent);
  const keys = fieldKeys(), special = SPECIAL_MARKS.includes(spec.mark), markSelect = $('#mark-select');
  $('#encoding-controls').classList.toggle('disabled', special);
  markSelect.disabled = special;
  fillSelect($('#x-field'), keys, spec.encoding?.x?.field || keys[0]);
  fillSelect($('#y-field'), keys, spec.encoding?.y?.field || keys[1] || keys[0]);
  fillSelect($('#series-field'), keys, spec.encoding?.series?.field || '', true);
  updateSummary();
}

function updateSummary() {
  const spec = state.spec, check = validateSpec(spec), badge = $('#spec-valid'), rows = spec?.data?.length || 0, enc = spec?.encoding || {};
  badge.textContent = check.valid ? 'valid' : 'invalid'; badge.classList.toggle('invalid', !check.valid);
  const details = [`mark: ${spec?.mark || '—'}`, `theme: ${spec?.theme || '—'}`, `rows: ${rows.toLocaleString()}`];
  if (SPECIAL_MARKS.includes(spec?.mark)) {
    const hard = {
      barRace:'playback + keyed rank transitions', force:'simulation + drag + zoom', pack:'hierarchy + click zoom', flowMap:'geo paths + particles + zoom',
      metro:'projection + route draw', geoBubble:'projection + temporal playback'
    };
    details.push(`pattern: ${hard[spec.mark] || 'advanced'}`);
  } else {
    details.push(`x: ${enc.x?.field || '—'} (${enc.x?.type || '—'})`, `y: ${enc.y?.field || '—'} (${enc.y?.type || '—'})`, `series: ${enc.series?.field || '—'}`);
  }
  $('#spec-summary').textContent = details.join('\n');
}

function renderCurrent() {
  if (!state.spec) return;
  try {
    state.renderResult = renderChart($('#chart-stage'), state.spec);
    $('#render-status').textContent = `${state.spec.mark} · ${(state.spec.data?.length || 0).toLocaleString()} rows · ${state.spec.theme} theme`;
  } catch (error) {
    $('#chart-stage').innerHTML = `<div class="render-error"><b>Render error</b><span>${escapeHtml(error.message)}</span></div>`;
    $('#render-status').textContent = 'Render error';
  }
  updateSummary();
}

function powerBiAdvancedNotice() {
  return `// Advanced D3 pattern: ${state.spec.mark}\n// Web / React / Fabric / Databricks / Jupyter exports use the shared renderer today.\n// Power BI needs a pattern-specific data-role + selection adapter before packaging.\n// Do not fall back to an unrelated line chart.\n\n${generateSpec(state.spec)}`;
}

function generatedOutput(target = state.target) {
  if (!state.spec) return '';
  if (target === 'powerbi' && ADVANCED_MARKS.includes(state.spec.mark)) return powerBiAdvancedNotice();
  const factories = {
    react:() => generateReact(state.spec), powerbi:() => flattenBundle(generatePowerBI(state.spec)), fabric:() => generateFabric(state.spec),
    databricks:() => generateDatabricks(state.spec), jupyter:() => generateJupyter(state.spec), bigquery:() => generateBigQuery(state.spec),
    html:() => generateStandaloneHTML(state.spec), spec:() => generateSpec(state.spec)
  };
  return factories[target]();
}

function updateCode() {
  if (!state.spec) return;
  const output = generatedOutput(); $('#code-output').textContent = output;
  $('#code-label').textContent = targetMeta[state.target][0]; $('#code-lines').textContent = `${output.split('\n').length} lines`;
  $('#adapter-output').textContent = generateAdapter(state.adapter, state.spec);
}

function updateSpecFromInspector() {
  const spec = state.spec; if (!spec) return;
  spec.title = $('#title-input').value.trim(); spec.subtitle = $('#subtitle-input').value.trim(); spec.source = $('#source-input').value.trim();
  spec.theme = $('#theme-select').value; spec.accent = $('#accent-input').value; spec.options = spec.options || {};
  spec.options.animate = $('#animate-toggle').checked; spec.options.directLabels = $('#labels-toggle').checked;
  if (!SPECIAL_MARKS.includes(spec.mark)) {
    const mark = $('#mark-select').value, xField = $('#x-field').value, yField = $('#y-field').value, seriesField = $('#series-field').value;
    spec.mark = mark; spec.encoding = spec.encoding || {};
    spec.encoding.x = {field:xField, type:inferType(xField)}; spec.encoding.y = {field:yField, type:inferType(yField)};
    if (seriesField) spec.encoding.series = {field:seriesField, type:'nominal'}; else delete spec.encoding.series;
    if (mark === 'bar') { spec.options.orientation = inferType(yField) === 'nominal' ? 'horizontal' : 'vertical'; spec.options.yZero = true; }
  }
  renderCurrent(); updateCode();
}

function parseCustomData(raw) {
  const text = raw.trim(); if (!text) throw Error('Paste CSV or JSON first.');
  let rows;
  if (text.startsWith('[') || text.startsWith('{')) {
    const parsed = JSON.parse(text); rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.data) ? parsed.data : null;
    if (!rows) throw Error('JSON must be an array of row objects, or an object with a data array.');
  } else rows = d3.csvParse(text);
  if (!rows.length) throw Error('No rows found.');
  return rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (typeof value === 'string') {
      const v = value.trim(); if (v !== '' && /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(v)) return [key, Number(v)]; return [key, v];
    }
    return [key, value];
  })));
}

function makeCustomSpec(rows) {
  const keys = Object.keys(rows[0]);
  const typeOf = key => {
    const values = rows.map(row => row[key]).filter(value => value !== null && value !== undefined && value !== '');
    if (values.length && values.every(value => typeof value === 'number')) return 'quantitative';
    const hits = values.slice(0, 8).filter(value => typeof value === 'string' && Number.isFinite(Date.parse(value))).length;
    return hits >= Math.min(3, values.slice(0, 8).length) ? 'temporal' : 'nominal';
  };
  const quant = keys.filter(key => typeOf(key) === 'quantitative'), temp = keys.filter(key => typeOf(key) === 'temporal'), nom = keys.filter(key => typeOf(key) === 'nominal');
  const xField = temp[0] || nom[0] || quant[0] || keys[0], yField = quant.find(key => key !== xField) || quant[0] || keys[1] || keys[0];
  const series = nom.find(key => key !== xField && key !== yField), mark = temp.length && quant.length ? 'line' : nom.length && quant.length ? 'bar' : 'scatter';
  return {version:'1.0', mark, theme:'newsroom', title:'Custom visualization', subtitle:'Imported dataset', source:'User-provided data', width:900, height:560, data:rows,
    encoding:{x:{field:xField,type:typeOf(xField)},y:{field:yField,type:typeOf(yField)},...(series?{series:{field:series,type:'nominal'}}:{})},
    options:{animate:true,directLabels:true,orientation:mark === 'bar' ? 'vertical' : undefined,yZero:mark === 'bar'}};
}

function downloadText(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], {type:mime}), url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
}
function downloadSVG() { const svg = state.renderResult?.svg; if (svg) downloadText(`${slug(state.spec.title || 'chart')}.svg`, svgToString(svg), 'image/svg+xml;charset=utf-8'); }
function downloadPNG() {
  const svg = state.renderResult?.svg; if (!svg) return;
  const blob = new Blob([svgToString(svg)], {type:'image/svg+xml;charset=utf-8'}), url = URL.createObjectURL(blob), image = new Image();
  image.onload = () => {
    const vb = svg.viewBox.baseVal, scale = 2, canvas = document.createElement('canvas'); canvas.width = Math.max(1, vb.width * scale); canvas.height = Math.max(1, vb.height * scale);
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.scale(scale, scale); ctx.drawImage(image, 0, 0, vb.width, vb.height);
    canvas.toBlob(png => { const pngUrl = URL.createObjectURL(png), link = document.createElement('a'); link.href = pngUrl; link.download = `${slug(state.spec.title || 'chart')}.png`; link.click(); setTimeout(() => URL.revokeObjectURL(pngUrl), 500); }, 'image/png');
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

function renderShowcase() {
  const root = $('#showcase-grid'); if (root.dataset.rendered === '1') return; root.dataset.rendered = '1'; root.innerHTML = '';
  EXAMPLES.filter(example => example.group !== 'Legacy rebuilt').forEach(example => {
    const card = document.createElement('article'); card.className = 'showcase-card';
    card.innerHTML = `<div class="showcase-card-head"><div><b>${example.label}</b><small>${example.description}</small></div><span>${example.publisher}</span></div><div class="showcase-chart"></div>`;
    root.appendChild(card);
    const spec = clone(example.spec); spec.width = 760; spec.height = 430; spec.options = {...spec.options, animate:false};
    if (spec.mark === 'flowMap' && !spec.geography) spec.geography = {type:'Sphere'};
    renderChart(card.querySelector('.showcase-chart'), spec);
  });
  EXAMPLES.filter(example => example.group === 'Legacy rebuilt').forEach(example => {
    const card = document.createElement('article'); card.className = 'showcase-card legacy-showcase';
    card.innerHTML = `<div class="showcase-card-head"><div><b>${example.label}</b><small>${example.description}</small></div><span>${example.publisher}</span></div><div class="legacy-showcase-body"><strong>${example.spec.mark === 'metro' ? 'Projected transport network' : 'Temporal event playback'}</strong><p>${example.id === 'ratp' ? 'Uses recovered RATP-shaped GeoJSON plus shared path-draw motion.' : 'Uses the existing 1901–2020 earthquake fixture plus the same playback controller as the ranking pattern.'}</p><button data-load-example="${example.id}">Open interactive version</button></div>`;
    root.appendChild(card);
  });
  bindLoadButtons();
}

function bindLoadButtons() {
  $$('[data-load-example]').forEach(button => {
    if (button.dataset.bound) return; button.dataset.bound = '1';
    button.addEventListener('click', async () => { setTab('studio'); await selectExample(button.dataset.loadExample); window.scrollTo({top:document.querySelector('#studio').offsetTop - 80, behavior:'smooth'}); });
  });
}

const normalizeHex = value => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#e3120b';
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'd3-chart';
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const escapeAttr = value => escapeHtml(value).replace(/`/g, '&#96;');

function bindUI() {
  $$('.top-tabs button').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
  $('#theme-select').addEventListener('change', () => { state.spec.theme = $('#theme-select').value; const theme = getTheme(state.spec.theme); state.spec.accent = theme.accent; $('#accent-input').value = normalizeHex(theme.accent); renderCurrent(); updateCode(); });
  ['title-input','subtitle-input','source-input','accent-input','mark-select','x-field','y-field','series-field','animate-toggle','labels-toggle'].forEach(id => {
    const el = document.getElementById(id); el.addEventListener(el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change', updateSpecFromInspector);
  });
  $('#target-tabs').addEventListener('click', event => { const button = event.target.closest('[data-target]'); if (!button) return; state.target = button.dataset.target; $$('#target-tabs button').forEach(b => b.classList.toggle('active', b === button)); updateCode(); });
  $$('.adapter-strip button').forEach(button => button.addEventListener('click', () => { state.adapter = button.dataset.adapter; $$('.adapter-strip button').forEach(b => b.classList.toggle('active', b === button)); $('#adapter-output').textContent = generateAdapter(state.adapter, state.spec); }));
  $('#copy-code').addEventListener('click', async () => { await navigator.clipboard.writeText($('#code-output').textContent); const original = $('#copy-code').textContent; $('#copy-code').textContent = 'Copied'; setTimeout(() => $('#copy-code').textContent = original, 900); });
  $('#download-code').addEventListener('click', () => { const [label, ext] = targetMeta[state.target]; downloadText(`${slug(state.spec.title)}-${slug(label)}.${ext}`, $('#code-output').textContent, ext === 'html' ? 'text/html;charset=utf-8' : ext === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8'); });
  $('#download-svg').addEventListener('click', downloadSVG); $('#download-png').addEventListener('click', downloadPNG); $('#open-data').addEventListener('click', () => $('#data-dialog').showModal());
  $('#load-data').addEventListener('click', () => { try { const rows = parseCustomData($('#data-input').value); state.spec = makeCustomSpec(rows); state.exampleId = ''; state.custom = true; $('#data-error').textContent = ''; $('#data-dialog').close(); $('#preview-name').textContent = 'Custom dataset'; renderExampleList(); syncInspector(); renderCurrent(); updateCode(); } catch (error) { $('#data-error').textContent = error.message; } });
  bindLoadButtons();
  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if ($('#studio').classList.contains('active')) renderCurrent(); }, 160); });
}

bindUI(); renderExampleList(); selectExample(state.exampleId);
