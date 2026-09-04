import {getTheme} from './themes.js';
import {ADVANCED_MARKS, renderAdvancedMark} from './advanced-patterns.js';
import {createPlayback, drawPath, prefersReducedMotion} from './motion.js';

const D = () => {
  if (!globalThis.d3) throw Error('D3 v7 is required');
  return globalThis.d3;
};

const BASE_MARKS = ['line', 'bar', 'dot', 'scatter', 'metro', 'geoBubble'];
const SPECIAL_MARKS = ['metro', 'geoBubble', ...ADVANCED_MARKS];
export const SUPPORTED_MARKS = [...BASE_MARKS, ...ADVANCED_MARKS];

export function validateSpec(s) {
  const errors = [];
  if (!s || typeof s !== 'object') errors.push('Spec must be an object.');
  if (!SUPPORTED_MARKS.includes(s?.mark)) errors.push(`Unsupported mark: ${s?.mark || 'missing'}`);
  if (!Array.isArray(s?.data)) errors.push('spec.data must be an array.');
  if (!s?.encoding && !SPECIAL_MARKS.includes(s?.mark)) errors.push('spec.encoding is required.');
  if (s?.mark === 'force' && !Array.isArray(s?.links)) errors.push('force requires spec.links.');
  if (s?.mark === 'pack' && !s?.hierarchy) errors.push('pack requires spec.hierarchy.');
  return {valid: !errors.length, errors};
}

const field = (d, key) => d?.properties && key in d.properties ? d.properties[key] : d?.[key];
const num = value => Number(value) || 0;
const fmt = (value, suffix = '') => {
  const n = Number(value), d3 = D();
  if (!Number.isFinite(n)) return String(value ?? '');
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}bn${suffix}`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}m${suffix}`;
  return `${d3.format(Number.isInteger(n) ? ',.0f' : ',.1f')(n)}${suffix}`;
};

function scaffold(el, s, t) {
  const d3 = D();
  if (Array.isArray(el.__d3vizCleanup)) {
    for (const cleanup of el.__d3vizCleanup) {
      try { cleanup(); } catch (_) { /* best-effort teardown */ }
    }
  }
  el.__d3vizCleanup = [];
  el.innerHTML = '';
  el.style.position = 'relative';
  const w = Math.max(520, Math.min(s.width || 900, el.clientWidth || 900));
  const h = Math.max(420, s.height || 560);
  const svg = d3.select(el).append('svg')
    .attr('width', '100%').attr('viewBox', `0 0 ${w} ${h}`)
    .attr('role', 'img').attr('aria-label', `${s.title || 'Chart'}. ${s.subtitle || ''}`)
    .style('display', 'block').style('font-family', t.font).style('background', t.background);
  if (t.rule) svg.append('rect').attr('width', w).attr('height', 8).attr('fill', t.accent);
  svg.append('text').attr('x', 34).attr('y', t.rule ? 50 : 42).attr('fill', t.ink).attr('font-size', 27).attr('font-weight', t.titleWeight).text(s.title || 'Untitled chart');
  svg.append('text').attr('x', 34).attr('y', t.rule ? 78 : 70).attr('fill', t.muted).attr('font-size', 15.5).text(s.subtitle || '');
  const fy = h - 18;
  svg.append('line').attr('x1', 34).attr('x2', w - 34).attr('y1', fy - 21).attr('y2', fy - 21).attr('stroke', t.grid);
  svg.append('text').attr('x', 34).attr('y', fy).attr('fill', t.muted).attr('font-size', 11.5).text(s.source ? `Source: ${String(s.source).replace(/^Source:\s*/i, '')}` : '');
  svg.append('text').attr('x', w - 34).attr('y', fy).attr('text-anchor', 'end').attr('fill', t.muted).attr('font-size', 10.5).text('D3 Viz Generator');
  const tip = d3.select(el).append('div').attr('class', 'chart-tooltip').style('opacity', 0);
  return {
    svg, tip, w, h, l: 70, r: w - 80, top: t.rule ? 110 : 102, b: h - 62,
    registerCleanup(fn) { el.__d3vizCleanup.push(fn); }
  };
}

function axis(g, t) {
  g.select('.domain').remove();
  g.selectAll('.tick line').attr('stroke', t.grid);
  g.selectAll('.tick text').attr('fill', t.muted).attr('font-size', 11.5);
}
function tipShow(tip, event, html) { tip.html(html).style('opacity', 1).style('left', `${event.offsetX + 16}px`).style('top', `${event.offsetY + 14}px`); }
const tipHide = tip => tip.style('opacity', 0);

function line(c, s, t) {
  const d3 = D(), xe = s.encoding.x, ye = s.encoding.y, series = s.encoding.series?.field;
  const xv = xe.type === 'temporal' ? row => new Date(row[xe.field]) : row => num(row[xe.field]);
  const yv = row => num(row[ye.field]);
  const groups = series ? d3.groups(s.data, row => row[series]) : [['Series', s.data]];
  const xd = d3.extent(s.data, xv), yd = d3.extent(s.data, yv), pad = (yd[1] - yd[0] || 1) * .12;
  const x = xe.type === 'temporal' ? d3.scaleUtc().domain(xd).range([c.l, c.r]) : d3.scaleLinear().domain(xd).nice().range([c.l, c.r]);
  const y = d3.scaleLinear().domain(s.options?.yZero ? [0, yd[1] + pad] : [yd[0] - pad, yd[1] + pad]).nice().range([c.b, c.top]);
  const yg = c.svg.append('g').attr('transform', `translate(${c.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(c.r - c.l)).tickFormat(d3.format('~s')));
  axis(yg, t);
  const xg = c.svg.append('g').attr('transform', `translate(0,${c.b})`).call((xe.type === 'temporal' ? d3.axisBottom(x).ticks(6).tickFormat(d3.utcFormat('%Y')) : d3.axisBottom(x).ticks(6)).tickSizeOuter(0));
  axis(xg, t); xg.selectAll('.tick line').remove();
  const color = d3.scaleOrdinal().domain(groups.map(g => g[0])).range(t.palette);
  const shape = d3.line().x(row => x(xv(row))).y(row => y(yv(row))).curve(d3.curveMonotoneX);
  const paths = c.svg.append('g').selectAll('path').data(groups).join('path').attr('fill', 'none').attr('stroke', g => color(g[0])).attr('stroke-width', 2.5).attr('d', g => shape(g[1].slice().sort((a, b) => +xv(a) - +xv(b))));
  if (s.options?.animate !== false) drawPath(paths, {duration: 800});
  if (s.options?.directLabels !== false) groups.forEach(([name, rows]) => {
    const last = rows.slice().sort((a, b) => +xv(a) - +xv(b)).at(-1);
    c.svg.append('text').attr('x', Math.min(c.w - 12, x(xv(last)) + 8)).attr('y', y(yv(last)) + 4).attr('fill', color(name)).attr('font-size', 11.5).attr('font-weight', 700).text(name);
  });
  c.svg.append('rect').attr('x', c.l).attr('y', c.top).attr('width', c.r - c.l).attr('height', c.b - c.top).attr('fill', 'transparent')
    .on('mousemove', function(event) {
      const [mx] = d3.pointer(event, c.svg.node()), x0 = x.invert(mx);
      const rows = groups.map(([name, rs]) => {
        const sorted = rs.slice().sort((a, b) => +xv(a) - +xv(b));
        const i = xe.type === 'temporal' ? d3.bisector(xv).center(sorted, x0) : d3.leastIndex(sorted, row => Math.abs(+xv(row) - +x0));
        return [name, sorted[Math.max(0, i)]];
      });
      tipShow(c.tip, event, `<strong>${xe.type === 'temporal' ? d3.utcFormat('%Y')(x0) : fmt(x0)}</strong>${rows.map(([name, row]) => `<span>${name}: ${fmt(yv(row))}</span>`).join('')}`);
    }).on('mouseleave', () => tipHide(c.tip));
}

function bar(c, s, t) {
  const d3 = D(), xf = s.encoding.x.field, yf = s.encoding.y.field, data = s.data.slice();
  if (s.options?.sort === 'descending') data.sort((a, b) => num(b[xf]) - num(a[xf]));
  const vals = data.map(row => num(row[xf])), min = Math.min(0, d3.min(vals)), max = Math.max(0, d3.max(vals));
  const x = d3.scaleLinear().domain([min, max * 1.08 || 1]).nice().range([c.l, c.r]);
  const y = d3.scaleBand().domain(data.map(row => row[yf])).range([c.top, c.b]).padding(.28);
  const xg = c.svg.append('g').attr('transform', `translate(0,${c.b})`).call(d3.axisBottom(x).ticks(5).tickSize(-(c.b - c.top)).tickFormat(d3.format('~s')));
  const yg = c.svg.append('g').attr('transform', `translate(${c.l},0)`).call(d3.axisLeft(y).tickSize(0));
  axis(xg, t); axis(yg, t); yg.selectAll('text').attr('fill', t.ink).attr('font-size', 12.5);
  const bars = c.svg.append('g').selectAll('rect').data(data).join('rect')
    .attr('x', row => x(Math.min(0, num(row[xf])))).attr('y', row => y(row[yf])).attr('height', y.bandwidth())
    .attr('width', s.options?.animate === false ? row => Math.abs(x(num(row[xf])) - x(0)) : 0).attr('fill', t.accent)
    .on('mousemove', (event, row) => tipShow(c.tip, event, `<strong>${row[yf]}</strong><span>${fmt(row[xf], s.options?.xSuffix || '')}</span>`)).on('mouseleave', () => tipHide(c.tip));
  if (s.options?.animate !== false) bars.transition().duration(prefersReducedMotion() ? 0 : 650).attr('width', row => Math.abs(x(num(row[xf])) - x(0)));
  if (s.options?.directLabels !== false) c.svg.append('g').selectAll('text').data(data).join('text')
    .attr('x', row => x(num(row[xf])) + (num(row[xf]) >= 0 ? 7 : -7)).attr('y', row => y(row[yf]) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', row => num(row[xf]) >= 0 ? 'start' : 'end').attr('fill', t.ink).attr('font-size', 11.5).attr('font-weight', 700).text(row => fmt(row[xf], s.options?.xSuffix || ''));
}

function dot(c, s, t) {
  const d3 = D(), xf = s.encoding.x.field, yf = s.encoding.y.field, data = s.data.slice().sort((a, b) => num(b[xf]) - num(a[xf]));
  const vals = data.map(row => num(row[xf])), min = Math.min(0, d3.min(vals)), max = Math.max(0, d3.max(vals)), pad = Math.max(5, (max - min) * .08);
  const x = d3.scaleLinear().domain([min - pad, max + pad]).nice().range([c.l, c.r]);
  const y = d3.scaleBand().domain(data.map(row => row[yf])).range([c.top, c.b]).padding(.38);
  const xg = c.svg.append('g').attr('transform', `translate(0,${c.b})`).call(d3.axisBottom(x).ticks(6).tickSize(-(c.b - c.top)).tickFormat(value => `${value}${s.options?.xSuffix || ''}`));
  const yg = c.svg.append('g').attr('transform', `translate(${c.l},0)`).call(d3.axisLeft(y).tickSize(0)); axis(xg, t); axis(yg, t);
  c.svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', c.top).attr('y2', c.b).attr('stroke', t.ink);
  const color = row => num(row[xf]) >= 0 ? t.accent : t.palette[1];
  const dots = c.svg.append('g').selectAll('circle').data(data).join('circle').attr('cy', row => y(row[yf]) + y.bandwidth() / 2).attr('cx', x(0)).attr('r', 5.5).attr('fill', color)
    .on('mousemove', (event, row) => tipShow(c.tip, event, `<strong>${row[yf]}</strong><span>${fmt(row[xf], s.options?.xSuffix || '')}</span>`)).on('mouseleave', () => tipHide(c.tip));
  (s.options?.animate === false || prefersReducedMotion() ? dots : dots.transition().duration(700)).attr('cx', row => x(num(row[xf])));
  if (s.options?.directLabels !== false) c.svg.append('g').selectAll('text').data(data).join('text').attr('x', row => x(num(row[xf])) + (num(row[xf]) >= 0 ? 10 : -10)).attr('y', row => y(row[yf]) + y.bandwidth() / 2 + 4).attr('text-anchor', row => num(row[xf]) >= 0 ? 'start' : 'end').attr('fill', color).attr('font-size', 11.5).attr('font-weight', 700).text(row => fmt(row[xf], s.options?.xSuffix || ''));
}

function scatter(c, s, t) {
  const d3 = D(), xf = s.encoding.x.field, yf = s.encoding.y.field;
  const x = d3.scaleLinear().domain(d3.extent(s.data, row => num(row[xf]))).nice().range([c.l, c.r]);
  const y = d3.scaleLinear().domain(d3.extent(s.data, row => num(row[yf]))).nice().range([c.b, c.top]);
  const xg = c.svg.append('g').attr('transform', `translate(0,${c.b})`).call(d3.axisBottom(x).ticks(6).tickSize(-(c.b - c.top)));
  const yg = c.svg.append('g').attr('transform', `translate(${c.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(c.r - c.l))); axis(xg, t); axis(yg, t);
  const dots = c.svg.append('g').selectAll('circle').data(s.data).join('circle').attr('cx', row => x(num(row[xf]))).attr('cy', row => y(num(row[yf]))).attr('r', s.options?.animate === false ? 6 : 0).attr('fill', t.accent).attr('fill-opacity', .8)
    .on('mousemove', (event, row) => tipShow(c.tip, event, `<strong>${xf}: ${row[xf]}</strong><span>${yf}: ${row[yf]}</span>`)).on('mouseleave', () => tipHide(c.tip));
  if (s.options?.animate !== false) dots.transition().duration(prefersReducedMotion() ? 0 : 600).attr('r', 6);
}

function metro(c, s, t) {
  const d3 = D(), lines = s.lines || [], stations = s.data || [], fc = {type: 'FeatureCollection', features: [...lines, ...stations]};
  const projection = d3.geoMercator().fitExtent([[c.l, c.top], [c.r, c.b]], fc), path = d3.geoPath(projection);
  const lineSel = c.svg.append('g').selectAll('path').data(lines).join('path').attr('d', path).attr('fill', 'none').attr('stroke', row => field(row, 'COLOR') || t.grid).attr('stroke-width', 4).attr('stroke-linecap', 'round').attr('opacity', .82);
  if (s.options?.animate !== false) drawPath(lineSel, {duration: 900, delay: (_, i) => i * 80});
  const traffic = row => num(field(row, 'TRAFIC')), rad = d3.scaleSqrt().domain([0, d3.max(stations, traffic) || 1]).range([3.5, 14]);
  const dots = c.svg.append('g').selectAll('circle').data(stations).join('circle').attr('cx', row => projection(row.geometry.coordinates)[0]).attr('cy', row => projection(row.geometry.coordinates)[1]).attr('r', s.options?.animate === false ? row => rad(traffic(row)) : 0).attr('fill', t.background).attr('stroke', t.ink).attr('stroke-width', 1.5)
    .on('mousemove', (event, row) => tipShow(c.tip, event, `<strong>${field(row, 'STATION')}</strong><span>${fmt(traffic(row))} trips</span><span>Lines ${field(row, 'LINES') || ''}</span>`)).on('mouseleave', () => tipHide(c.tip));
  if (s.options?.animate !== false) dots.transition().duration(prefersReducedMotion() ? 0 : 700).delay((_, i) => i * 25).attr('r', row => rad(traffic(row)));
  if (s.options?.directLabels !== false) stations.slice().sort((a, b) => traffic(b) - traffic(a)).slice(0, 5).forEach(row => {
    const [x, y] = projection(row.geometry.coordinates);
    c.svg.append('text').attr('x', x + rad(traffic(row)) + 5).attr('y', y + 4).attr('fill', t.ink).attr('font-size', 10.5).attr('font-weight', 700).text(field(row, 'STATION'));
  });
}

function geo(c, s, t) {
  const d3 = D(), features = s.data || [];
  const projection = d3.geoNaturalEarth1().fitExtent([[c.l, c.top], [c.r, c.b - 18]], s.geography || {type: 'Sphere'}), path = d3.geoPath(projection);
  if (s.geography?.features) c.svg.append('g').selectAll('path').data(s.geography.features).join('path').attr('d', path).attr('fill', t.soft).attr('stroke', t.grid).attr('stroke-width', .8);
  else c.svg.append('path').datum({type: 'Sphere'}).attr('d', path).attr('fill', t.soft).attr('stroke', t.grid);
  const mag = row => num(field(row, 'mag')), rad = d3.scaleSqrt().domain([5, Math.max(9, d3.max(features, mag) || 9)]).range([2.5, 15]);
  const years = features.map(row => num(field(row, 'year'))), min = s.options?.startYear || d3.min(years) || 1901, max = s.options?.endYear || d3.max(years) || 2020;
  const trail = s.options?.trailYears || 7, g = c.svg.append('g');
  function draw(year) {
    const rows = features.filter(row => num(field(row, 'year')) <= year && num(field(row, 'year')) >= year - trail);
    const sel = g.selectAll('circle').data(rows, row => `${field(row, 'year')}-${row.geometry.coordinates}`);
    sel.exit().transition().duration(120).attr('r', 0).remove();
    sel.enter().append('circle').attr('cx', row => projection(row.geometry.coordinates)[0]).attr('cy', row => projection(row.geometry.coordinates)[1]).attr('r', 0).attr('fill', t.accent).attr('fill-opacity', .3).attr('stroke', t.accent)
      .on('mousemove', (event, row) => tipShow(c.tip, event, `<strong>M${mag(row).toFixed(1)}</strong><span>${field(row, 'place') || 'Earthquake'}</span><span>${field(row, 'year')}</span>`)).on('mouseleave', () => tipHide(c.tip))
      .merge(sel).transition().duration(prefersReducedMotion() ? 0 : 240).attr('r', row => rad(mag(row)));
  }
  if (s.options?.timeline !== false) {
    const span = max - min + 1, step = Math.max(1, Math.ceil(span / 70));
    const values = d3.range(min, max + 1, step); if (values.at(-1) !== max) values.push(max);
    createPlayback(c, {values, onFrame: draw, theme: t, interval: s.options?.interval || 220, autoPlay: s.options?.animate !== false, startIndex: s.options?.animate === false ? values.length - 1 : 0});
  } else draw(max);
}

const baseRenderers = {line, bar, dot, scatter, metro, geoBubble: geo};
export function renderChart(el, s) {
  const check = validateSpec(s); if (!check.valid) throw Error(check.errors.join(' '));
  const t = getTheme(s.theme, s.accent), c = scaffold(el, s, t);
  if (ADVANCED_MARKS.includes(s.mark)) renderAdvancedMark(s.mark, c, s, t);
  else baseRenderers[s.mark](c, s, t);
  return {svg: c.svg.node(), theme: t};
}

export function svgToString(node) {
  const clone = node.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(clone);
}
