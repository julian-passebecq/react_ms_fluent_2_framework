const D = () => {
  if (!globalThis.d3) throw Error('D3 v7 is required');
  return globalThis.d3;
};

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function drawPath(selection, {duration = 900, delay = 0} = {}) {
  if (prefersReducedMotion()) return selection;
  selection.each(function(_, i) {
    const d3 = D();
    const length = this.getTotalLength?.() || 0;
    d3.select(this)
      .attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
      .delay(typeof delay === 'function' ? delay(_, i) : delay)
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);
  });
  return selection;
}

export function attachZoom(svg, layer, {
  scaleExtent = [0.65, 8],
  translateExtent = null,
  onZoom = null
} = {}) {
  const d3 = D();
  const zoom = d3.zoom().scaleExtent(scaleExtent).on('zoom', event => {
    layer.attr('transform', event.transform);
    onZoom?.(event.transform);
  });
  if (translateExtent) zoom.translateExtent(translateExtent);
  svg.call(zoom);
  svg.on('dblclick.zoom', null);
  return zoom;
}

export function createPlayback(c, {
  values,
  onFrame,
  theme,
  interval = 900,
  autoPlay = true,
  startIndex = 0,
  format = value => String(value)
}) {
  const d3 = D();
  if (!values?.length) return {setIndex() {}, play() {}, pause() {}};

  let index = Math.max(0, Math.min(values.length - 1, startIndex));
  let timer = null;
  let playing = false;
  const width = Math.min(440, c.w - 230);
  const x0 = (c.w - width) / 2;
  const y = c.b + 22;
  const scale = d3.scaleLinear().domain([0, Math.max(1, values.length - 1)]).range([x0, x0 + width]);
  const g = c.svg.append('g').attr('class', 'motion-playback');

  g.append('line')
    .attr('x1', x0).attr('x2', x0 + width)
    .attr('y1', y).attr('y2', y)
    .attr('stroke', theme.grid).attr('stroke-width', 5).attr('stroke-linecap', 'round');

  const progress = g.append('line')
    .attr('x1', x0).attr('x2', scale(index))
    .attr('y1', y).attr('y2', y)
    .attr('stroke', theme.accent).attr('stroke-width', 5).attr('stroke-linecap', 'round');

  const knob = g.append('circle')
    .attr('cx', scale(index)).attr('cy', y).attr('r', 7)
    .attr('fill', theme.accent).style('cursor', 'ew-resize');

  const valueLabel = g.append('text')
    .attr('x', scale(index)).attr('y', y - 15)
    .attr('text-anchor', 'middle').attr('fill', theme.ink)
    .attr('font-size', 11).attr('font-weight', 700).text(format(values[index]));

  const control = g.append('g').attr('transform', `translate(${x0 - 38},${y - 11})`).style('cursor', 'pointer');
  control.append('rect').attr('width', 24).attr('height', 24).attr('rx', 12).attr('fill', theme.soft).attr('stroke', theme.grid);
  const glyph = control.append('path').attr('fill', theme.ink);

  function updateGlyph() {
    glyph.attr('d', playing ? 'M8 7h3v10H8zM13 7h3v10h-3z' : 'M9 6l9 6-9 6z');
  }

  function setIndex(next, immediate = false) {
    index = Math.max(0, Math.min(values.length - 1, next));
    const x = scale(index);
    const duration = immediate || prefersReducedMotion() ? 0 : 180;
    knob.interrupt().transition().duration(duration).attr('cx', x);
    progress.interrupt().transition().duration(duration).attr('x2', x);
    valueLabel.interrupt().transition().duration(duration).attr('x', x).text(format(values[index]));
    onFrame(values[index], index);
  }

  function pause() {
    timer?.stop();
    timer = null;
    playing = false;
    updateGlyph();
  }

  function play() {
    if (playing || values.length < 2 || prefersReducedMotion()) return;
    playing = true;
    updateGlyph();
    timer = d3.interval(() => {
      const next = index + 1;
      if (next >= values.length) {
        pause();
        return;
      }
      setIndex(next);
    }, interval);
  }

  control.on('click', () => {
    if (playing) pause();
    else {
      if (index >= values.length - 1) setIndex(0, true);
      play();
    }
  });

  knob.call(d3.drag().on('start', pause).on('drag', event => {
    const clamped = Math.max(x0, Math.min(x0 + width, event.x));
    setIndex(Math.round(scale.invert(clamped)), true);
  }));

  updateGlyph();
  setIndex(index, true);
  if (autoPlay) play();
  c.registerCleanup?.(() => pause());
  return {setIndex, play, pause, get index() { return index; }};
}

export function animatePathParticles(c, paths, layer, {
  theme,
  particlesPerPath = 2,
  speed = 0.00013,
  radius = 3.2
} = {}) {
  const d3 = D();
  if (prefersReducedMotion() || !paths?.length) return null;

  const particles = [];
  paths.each(function(datum, pathIndex) {
    const length = this.getTotalLength?.() || 0;
    for (let i = 0; i < particlesPerPath; i += 1) {
      particles.push({
        path: this,
        datum,
        length,
        phase: (i / particlesPerPath + pathIndex * 0.173) % 1,
        speed: speed * (0.82 + (pathIndex % 4) * 0.09)
      });
    }
  });

  const dots = layer.selectAll('circle.flow-particle').data(particles).join('circle')
    .attr('class', 'flow-particle')
    .attr('r', radius)
    .attr('fill', theme.accent)
    .attr('stroke', theme.background)
    .attr('stroke-width', 1.2)
    .attr('pointer-events', 'none');

  const timer = d3.timer(elapsed => {
    dots.attr('transform', p => {
      if (!p.length) return 'translate(-999,-999)';
      const t = (p.phase + elapsed * p.speed) % 1;
      const point = p.path.getPointAtLength(t * p.length);
      return `translate(${point.x},${point.y})`;
    });
  });
  c.registerCleanup?.(() => timer.stop());
  return timer;
}
