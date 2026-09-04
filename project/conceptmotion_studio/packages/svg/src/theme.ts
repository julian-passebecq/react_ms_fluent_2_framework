export interface SemanticTheme {
  surface: string;
  surfaceRaised: string;
  ink: string;
  mutedInk: string;
  border: string;
  grid: string;
  accent: string;
  accentSubtle: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  dataBatch: string;
  dataStream: string;
  cdc: string;
  control: string;
  lineage: string;
  fontFamily: string;
  monoFontFamily: string;
  density: 'compact' | 'comfortable';
  radius: number;
}

export const defaultSemanticTheme: Readonly<SemanticTheme> = Object.freeze({
  surface: '#ffffff',
  surfaceRaised: '#f8fafc',
  ink: '#172033',
  mutedInk: '#596579',
  border: '#c9d1dc',
  grid: '#e6eaf0',
  accent: '#315d8a',
  accentSubtle: '#e7f0f8',
  success: '#26734d',
  warning: '#8a5a14',
  error: '#b42318',
  info: '#315d8a',
  dataBatch: '#315d8a',
  dataStream: '#0f766e',
  cdc: '#7c3f91',
  control: '#596579',
  lineage: '#7157a4',
  fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
  monoFontFamily: 'Cascadia Code, SFMono-Regular, Consolas, monospace',
  density: 'compact',
  radius: 6,
});

export function resolveSemanticTheme(theme?: Partial<SemanticTheme>): SemanticTheme {
  return { ...defaultSemanticTheme, ...theme };
}
