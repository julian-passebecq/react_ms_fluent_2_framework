import {attachZoom, animatePathParticles, createPlayback, drawPath, prefersReducedMotion} from './motion.js';

const D = () => {
  if (!globalThis.d3) throw Error('D3 v7 is required');
  return globalThis.d3;
};
const num = value => Number(value) || 0;
const showTip = (tip, event, html) => tip.html(html).style('opacity', 1).style('left', `${event.offsetX + 16}px`).style('top', `${event.offsetY + 14}px`);
const hideTip = tip => tip.style('opacity', 0);
const valueFmt = value => D().format(',.0f')(num(value));

export const ADVANCED_MARKS = ['barRace', 'force', 'pack', 'flowMap'];

function barRace(c, s, t) {
  const d3 = D();
  const timeField = s.options?.timeField || 'time';
  const nameField = s.options?.nameField || 'name';
  const valueField = s.options?.valueField || 'value';
  const topN = s.options?.topN || 7;
  const times = Array.from(new Set(s.data.map(d => d[timeField]))).sort((a, b) => d3.ascending(a, b));
  const plotTop = c.top + 6;
  const plotBottom = c.b - 32;
  const g = c.svg.append('g');
  const xAxis = c.svg.append('g').attr('transform', `translate(0,${plotBottom})`);
  const title = c.svg.append('text').attr('x', c.r).attr('y', c.top + 12).attr('text-anchor', 'end').attr('fill', t.muted).attr('font-size', 44).attr('font-weight', 700).attr('opacity', .16);
  const color = d3.scaleOrdinal().range(t.palette);

  function frame(time) {
    const rows = s.data.filter(d => d[timeField] === time).sort((a, b) => num(b[valueField]) - num(a[valueField])).slice(0, topN);
    const max = d3.max(rows, d => num(d[valueField])) || 1;
    const x = d3.scaleLinear().domain([0, max * 1.08]).range([c.l + 80, c.r]);
    const y = d3.scaleBand().domain(rows.map(d => d[nameField])).range([plotTop + 20, plotBottom - 8]).padding(.22);
    color.domain(rows.map(d => d[nameField]));
    title.text(time);
    xAxis.transition().duration(prefersReducedMotion() ? 0 : 450).call(d3.axisBottom(x).ticks(5).tickSize(-(plotBottom - plotTop - 16)).tickFormat(d3.format('~s')));
    xAxis.select('.domain').remove();
    xAxis.selectAll('.tick line').attr('stroke', t.grid);
    xAxis.selectAll('.tick text').attr('fill', t.muted).attr('font-size', 10.5);

    const bars = g.selectAll('rect.race-bar').data(rows, d => d[nameField]);
    bars.exit().transition().duration(250).attr('width', 0).remove();
    bars.enter().append('rect').attr('class', 'race-bar')
      .attr('x', c.l + 80).attr('y', d => y(d[nameField]) ?? plotBottom).attr('height', y.bandwidth())
      .attr('width', 0).attr('rx', 2).attr('fill', d => color(d[nameField]))
      .merge(bars)
      .on('mousemove', (event, d) => showTip(c.tip, event, `<strong>${d[nameField]}</strong><span>${timeField}: ${d[timeField]}</span><span>${valueFmt(d[valueField])}</span>`))
      .on('mouseleave', () => hideTip(c.tip))
      .transition().duration(prefersReducedMotion() ? 0 : 520)
      .attr('x', c.l + 80).attr('y', d => y(d[nameField])).attr('height', y.bandwidth()).attr('width', d => x(num(d[valueField])) - (c.l + 80));

    const labels = g.selectAll('text.race-name').data(rows, d => d[nameField]);
    labels.exit().remove();
    labels.enter().append('text').attr('class', 'race-name').attr('text-anchor', 'end').attr('fill', t.ink).attr('font-size', 11.5).attr('font-weight', 700)
      .merge(labels).text(d => d[nameField]).transition().duration(prefersReducedMotion() ? 0 : 520)
      .attr('x', c.l + 72).attr('y', d => y(d[nameField]) + y.bandwidth() / 2 + 4);

    const values = g.selectAll('text.race-value').data(rows, d => d[nameField]);
    values.exit().remove();
    values.enter().append('text').attr('class', 'race-value').attr('fill', t.ink).attr('font-size', 10.5).attr('font-weight', 700)
      .merge(values).text(d => valueFmt(d[valueField])).transition().duration(prefersReducedMotion() ? 0 : 520)
      .attr('x', d => x(num(d[valueField])) + 7).attr('y', d => y(d[nameField]) + y.bandwidth() / 2 + 4);
  }

  createPlayback(c, {
    values: times,
    onFrame: frame,
    theme: t,
    interval: s.options?.interval || 1050,
    autoPlay: s.options?.animate !== false,
    format: value => String(value)
  });
}

function force(c, s, t) {
  const d3 = D();
  const nodes = s.data.map(d => ({...d}));
  const links = (s.links || []).map(d => ({...d}));
  const idField = s.options?.idField || 'id';
  const groupField = s.options?.groupField || 'group';
  const valueField = s.options?.valueField || 'value';
  const layer = c.svg.append('g');
  const linkLayer = layer.append('g').attr('stroke', t.grid).attr('stroke-opacity', .7);
  const nodeLayer = layer.append('g');
  const labelLayer = layer.append('g').attr('pointer-events', 'none');
  const color = d3.scaleOrdinal().domain(Array.from(new Set(nodes.map(d => d[groupField])))).range(t.palette);
  const radius = d3.scaleSqrt().domain([0, d3.max(nodes, d => num(d[valueField])) || 1]).range([7, 19]);
  const linksSel = linkLayer.selectAll('line').data(links).join('line').attr('stroke-width', d => Math.max(1, Math.sqrt(num(d.value) || 1)));
  const nodesSel = nodeLayer.selectAll('circle').data(nodes, d => d[idField]).join('circle')
    .attr('r', d => radius(d[valueField])).attr('fill', d => color(d[groupField])).attr('stroke', t.background).attr('stroke-width', 2)
    .on('mousemove', (event, d) => showTip(c.tip, event, `<strong>${d[idField]}</strong><span>${d[groupField] || ''}</span><span>weight ${valueFmt(d[valueField])}</span>`))
    .on('mouseleave', () => hideTip(c.tip));
  const labels = labelLayer.selectAll('text').data(nodes, d => d[idField]).join('text').text(d => d[idField]).attr('fill', t.ink).attr('font-size', 9.5).attr('font-weight', 700).attr('text-anchor', 'middle');
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d[idField]).distance(s.options?.linkDistance || 78).strength(.55))
    .force('charge', d3.forceManyBody().strength(s.options?.charge ?? -170))
    .force('collide', d3.forceCollide(d => radius(d[valueField]) + 4))
    .force('center', d3.forceCenter((c.l + c.r) / 2, (c.top + c.b) / 2));

  simulation.on('tick', () => {
    linksSel.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodesSel.attr('cx', d => d.x).attr('cy', d => d.y);
    labels.attr('x', d => d.x).attr('y', d => d.y + 3);
  });

  nodesSel.call(d3.drag()
    .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(.25).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));
  if (s.options?.zoom !== false) attachZoom(c.svg, layer, {scaleExtent: [.55, 5]});
  c.registerCleanup?.(() => simulation.stop());
}

function pack(c, s, t) {
  const d3 = D();
  const hierarchy = s.hierarchy || {name: 'root', children: []};
  const valueField = s.options?.valueField || 'value';
  const nameField = s.options?.nameField || 'name';
  const size = Math.min(c.r - c.l, c.b - c.top);
  const x0 = (c.l + c.r - size) / 2;
  const y0 = c.top + Math.max(0, (c.b - c.top - size) / 2);
  const root = d3.pack().size([size, size]).padding(4)(d3.hierarchy(hierarchy).sum(d => num(d[valueField]) || 1).sort((a, b) => b.value - a.value));
  const color = d3.scaleLinear().domain([0, Math.max(1, root.height)]).range([t.soft, t.accent]).interpolate(d3.interpolateHcl);
  const g = c.svg.append('g').attr('transform', `translate(${x0},${y0})`);
  let focus = root;
  let view;
  const nodes = g.selectAll('circle').data(root.descendants().slice(1)).join('circle')
    .attr('fill', d => d.children ? color(d.depth) : t.background)
    .attr('stroke', d => d.children ? t.background : t.accent)
    .attr('stroke-width', 1.3)
    .style('cursor', d => d.children ? 'pointer' : 'default')
    .on('mousemove', (event, d) => showTip(c.tip, event, `<strong>${d.data[nameField]}</strong><span>${valueFmt(d.value)}</span>`))
    .on('mouseleave', () => hideTip(c.tip))
    .on('click', (event, d) => { if (focus !== d && d.children) { zoom(event, d); event.stopPropagation(); } });
  const labels = g.selectAll('text').data(root.descendants().slice(1)).join('text')
    .attr('text-anchor', 'middle').attr('fill', t.ink).attr('font-size', 10).attr('pointer-events', 'none')
    .style('display', d => d.parent === root ? 'inline' : 'none').style('fill-opacity', d => d.parent === root ? 1 : 0)
    .text(d => d.data[nameField]);

  c.svg.on('click', event => zoom(event, root));
  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
    const k = size / v[2];
    view = v;
    labels.attr('transform', d => `translate(${(d.x - v[0]) * k + size / 2},${(d.y - v[1]) * k + size / 2})`);
    nodes.attr('transform', d => `translate(${(d.x - v[0]) * k + size / 2},${(d.y - v[1]) * k + size / 2})`).attr('r', d => d.r * k);
  }

  function zoom(event, target) {
    focus = target;
    const transition = c.svg.transition().duration(prefersReducedMotion() ? 0 : (event.altKey ? 3000 : 700))
      .tween('zoom', () => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return t0 => zoomTo(i(t0));
      });
    labels.filter(function(d) { return d.parent === focus || this.style.display === 'inline'; })
      .transition(transition).style('fill-opacity', d => d.parent === focus ? 1 : 0)
      .on('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
      .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; });
  }
}

function flowMap(c, s, t) {
  const d3 = D();
  const routes = s.data || [];
  const geography = s.geography || {type: 'Sphere'};
  const projection = d3.geoNaturalEarth1().fitExtent([[c.l, c.top], [c.r, c.b]], geography);
  const path = d3.geoPath(projection);
  const layer = c.svg.append('g');
  const mapLayer = layer.append('g');
  const flowLayer = layer.append('g');
  const particleLayer = layer.append('g');
  if (geography.features) mapLayer.selectAll('path').data(geography.features).join('path').attr('d', path).attr('fill', t.soft).attr('stroke', t.grid).attr('stroke-width', .7);
  else mapLayer.append('path').datum({type: 'Sphere'}).attr('d', path).attr('fill', t.soft).attr('stroke', t.grid);
  const max = d3.max(routes, d => num(d.value)) || 1;
  const width = d3.scaleSqrt().domain([0, max]).range([1.3, 6]);
  const pathData = routes.map((route, i) => ({...route, id: route.id || `route-${i}`, geometry: {type: 'LineString', coordinates: [route.source, route.target]}}));
  const flows = flowLayer.selectAll('path').data(pathData, d => d.id).join('path')
    .attr('d', d => path(d.geometry)).attr('fill', 'none').attr('stroke', d => d.color || t.accent)
    .attr('stroke-width', d => width(d.value)).attr('stroke-opacity', .42).attr('stroke-linecap', 'round')
    .on('mousemove', (event, d) => showTip(c.tip, event, `<strong>${d.name || d.id}</strong><span>${valueFmt(d.value)}</span>`))
    .on('mouseleave', () => hideTip(c.tip));
  if (s.options?.animate !== false) drawPath(flows, {duration: 950, delay: (_, i) => i * 80});
  animatePathParticles(c, flows, particleLayer, {theme: t, particlesPerPath: s.options?.particlesPerPath || 2, speed: s.options?.particleSpeed || .00012});
  if (s.options?.zoom !== false) attachZoom(c.svg, layer, {scaleExtent: [.75, 6]});
}

const renderers = {barRace, force, pack, flowMap};
export function renderAdvancedMark(mark, c, spec, theme) {
  const renderer = renderers[mark];
  if (!renderer) throw Error(`Unsupported advanced mark: ${mark}`);
  renderer(c, spec, theme);
}
