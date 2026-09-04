import {
  createDefaultRendererRegistry,
  type RenderOptions,
  type RendererRegistry,
  type SvgRenderer,
} from '@conceptmotion/svg';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

const defaultRegistry = createDefaultRendererRegistry();

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface RendererHostProps<Input> {
  rendererId: string;
  input: Input;
  registry?: RendererRegistry;
  options?: RenderOptions;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  fallback?: ReactNode;
  onRendererReady?: (renderer: SvgRenderer<Input> | null) => void;
}

export function RendererHost<Input>({
  rendererId,
  input,
  registry = defaultRegistry,
  options,
  className,
  style,
  ariaLabel,
  fallback,
  onRendererReady,
}: RendererHostProps<Input>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rendererRef = useRef<SvgRenderer<Input> | null>(null);
  const inputRef = useRef(input);
  const optionsRef = useRef(options);
  const readyRef = useRef(onRendererReady);
  const [error, setError] = useState<Error | null>(null);

  inputRef.current = input;
  optionsRef.current = options;
  readyRef.current = onRendererReady;

  useEffect(() => {
    const host = svgRef.current;
    if (!host) return;
    let renderer: SvgRenderer<Input> | null = null;
    try {
      renderer = registry.create<Input>(rendererId);
      rendererRef.current = renderer;
      renderer.mount(host, inputRef.current, optionsRef.current);
      setError(null);
      readyRef.current?.(renderer);
    } catch (caught) {
      const nextError = caught instanceof Error ? caught : new Error(String(caught));
      setError(nextError);
      rendererRef.current = null;
      readyRef.current?.(null);
    }
    return () => {
      try {
        renderer?.destroy();
      } finally {
        if (rendererRef.current === renderer) rendererRef.current = null;
        readyRef.current?.(null);
      }
    };
  }, [registry, rendererId]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    try {
      renderer.update(input, options);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    }
  }, [input, options]);

  const fallbackContent = useMemo(
    () => fallback ?? (error ? `Visualization unavailable: ${error.message}` : 'An accessible visualization summary was not supplied.'),
    [error, fallback],
  );

  return (
    <div
      className={className}
      data-conceptmotion-host={rendererId}
      data-renderer-error={error ? 'true' : undefined}
      style={{ position: 'relative', minWidth: 0, ...style }}
    >
      <svg
        ref={svgRef}
        aria-label={ariaLabel}
        role={options?.onSelect ? 'group' : 'img'}
        style={{ display: error ? 'none' : 'block', width: '100%', height: 'auto', maxWidth: '100%' }}
      />
      <div role={error ? 'alert' : 'note'} style={error ? undefined : visuallyHidden} data-conceptmotion-fallback>
        {fallbackContent}
      </div>
    </div>
  );
}
