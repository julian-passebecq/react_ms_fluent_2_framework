import type {
  CompiledRegressionFrame,
  LocalizedText,
  RegressionPoint,
  RegressionSceneSpec,
} from '@conceptmotion/core';

import { BaseSvgRenderer } from '../base-renderer.js';
import {
  ensureChild,
  keyedChildren,
  round,
  setAccessibleText,
  setAttributes,
  setText,
} from '../dom.js';
import type { RendererRegistration } from '../types.js';
import { localText, makeSelectable, renderHeading } from './shared.js';

export interface RegressionRendererInput {
  spec: RegressionSceneSpec;
  frame: CompiledRegressionFrame;
  title?: LocalizedText;
  description?: LocalizedText;
}

function extent(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  let minimum = Math.min(...values);
  let maximum = Math.max(...values);
  if (minimum === maximum) {
    minimum -= 1;
    maximum += 1;
  }
  const padding = (maximum - minimum) * 0.12;
  return [minimum - padding, maximum + padding];
}

function scale(domain: [number, number], range: [number, number]): (value: number) => number {
  const span = domain[1] - domain[0] || 1;
  return (value) => range[0] + ((value - domain[0]) / span) * (range[1] - range[0]);
}

export class RegressionRenderer extends BaseSvgRenderer<RegressionRendererInput> {
  constructor() {
    super('regression');
  }

  protected render(input: RegressionRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const title = localText(input.title ?? input.spec.title, options) || input.spec.id;
    const caption = localText(input.description ?? input.frame.frame.caption, options);
    const description = `${caption} Slope ${round(input.frame.frame.slope, 3)}, intercept ${round(input.frame.frame.intercept, 3)}, MSE ${round(input.frame.mse, 3)}.`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);
    const layer = ensureChild(surface.root, 'g[data-role="regression"]', 'g', { 'data-role': 'regression' });

    const plot = {
      x: 58,
      y: top + 18,
      width: Math.max(260, surface.viewport.width - 92),
      height: Math.max(190, surface.viewport.height - top - 72),
    };
    const predictionById = new Map(input.frame.predictions.map((prediction) => [prediction.pointId, prediction]));
    const xDomain = extent(input.spec.points.map((point) => point.x));
    const yDomain = extent([
      ...input.spec.points.map((point) => point.y),
      ...input.frame.predictions.map((prediction) => prediction.predictedY),
    ]);
    const x = scale(xDomain, [plot.x, plot.x + plot.width]);
    const y = scale(yDomain, [plot.y + plot.height, plot.y]);

    const plotBackground = ensureChild(layer, 'rect[data-role="plot"]', 'rect', {
      'data-role': 'plot',
      x: plot.x,
      y: plot.y,
      width: plot.width,
      height: plot.height,
      fill: surface.theme.surface,
      stroke: surface.theme.border,
      rx: surface.theme.radius,
    });
    plotBackground.setAttribute('aria-hidden', 'true');

    const ticks = [0, 0.25, 0.5, 0.75, 1];
    keyedChildren(
      layer,
      'line[data-role="grid"]',
      'line',
      ticks.flatMap((ratio) => [
        { id: `x:${ratio}`, x1: plot.x + ratio * plot.width, y1: plot.y, x2: plot.x + ratio * plot.width, y2: plot.y + plot.height },
        { id: `y:${ratio}`, x1: plot.x, y1: plot.y + ratio * plot.height, x2: plot.x + plot.width, y2: plot.y + ratio * plot.height },
      ]),
      (tick) => tick.id,
      (line, tick) => setAttributes(line, { ...tick, id: undefined, 'data-role': 'grid', stroke: surface.theme.grid, 'stroke-width': 1 }),
    );

    keyedChildren(
      layer,
      'line[data-role="residual"]',
      'line',
      input.spec.points,
      (point) => point.id,
      (line, point) => {
        const prediction = predictionById.get(point.id)!;
        setAttributes(line, {
          'data-role': 'residual',
          'data-point-id': point.id,
          x1: round(x(point.x)),
          y1: round(y(point.y)),
          x2: round(x(point.x)),
          y2: round(y(prediction.predictedY)),
          stroke: Math.abs(prediction.residual) > Math.sqrt(input.frame.mse) ? surface.theme.error : surface.theme.warning,
          'stroke-width': 1.5,
          'stroke-dasharray': '3 3',
        });
        line.style.transition = this.reducedMotion ? 'none' : `all ${this.durationMs}ms ease`;
      },
    );

    const lineStart = { x: xDomain[0], y: input.frame.frame.intercept + input.frame.frame.slope * xDomain[0] };
    const lineEnd = { x: xDomain[1], y: input.frame.frame.intercept + input.frame.frame.slope * xDomain[1] };
    const fitLine = ensureChild(layer, 'line[data-role="fit-line"]', 'line', {
      'data-role': 'fit-line',
      x1: round(x(lineStart.x)),
      y1: round(y(lineStart.y)),
      x2: round(x(lineEnd.x)),
      y2: round(y(lineEnd.y)),
      stroke: surface.theme.accent,
      'stroke-width': 3,
    });
    fitLine.style.transition = this.reducedMotion ? 'none' : `all ${this.durationMs}ms ease`;

    keyedChildren(
      layer,
      'g[data-role="point"]',
      'g',
      input.spec.points,
      (point) => point.id,
      (group, point) => {
        setAttributes(group, {
          'data-role': 'point',
          'data-point-id': point.id,
          transform: `translate(${round(x(point.x))} ${round(y(point.y))})`,
        });
        makeSelectable(group, point.id, `Point ${point.id}: x ${point.x}, y ${point.y}`, options);
        const circle = ensureChild(group, 'circle', 'circle', {
          r: options.selectedId === point.id ? 6 : 4.5,
          fill: surface.theme.surface,
          stroke: options.selectedId === point.id ? surface.theme.accent : surface.theme.ink,
          'stroke-width': options.selectedId === point.id ? 2.5 : 1.6,
        });
        circle.setAttribute('aria-hidden', 'true');
      },
    );

    const metric = ensureChild(layer, 'text[data-role="metric"]', 'text', {
      'data-role': 'metric',
      x: plot.x + 8,
      y: plot.y + 18,
      fill: surface.theme.ink,
      'font-family': surface.theme.monoFontFamily,
      'font-size': 11,
      'font-weight': 650,
    });
    setText(metric, `ŷ = ${round(input.frame.frame.slope, 2)}x + ${round(input.frame.frame.intercept, 2)}   MSE ${round(input.frame.mse, 3)}`);

    const legend = ensureChild(layer, 'text[data-role="legend"]', 'text', {
      'data-role': 'legend',
      x: plot.x,
      y: plot.y + plot.height + 24,
      fill: surface.theme.mutedInk,
      'font-size': 10,
    });
    setText(legend, 'Dashed vertical segments are residuals; changing slope moves the same fitted line and residual endpoints.');
  }
}

export const regressionRendererRegistration: RendererRegistration<RegressionRendererInput> = {
  id: 'statistics.regression',
  family: 'statistics',
  description: 'Direct-parameter linear regression with stable points and residuals.',
  create: () => new RegressionRenderer(),
};

export function registerRegressionRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(regressionRendererRegistration);
}
