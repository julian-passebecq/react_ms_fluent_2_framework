export const THEMES = {
  economist: {
    id: 'economist', name: 'Economist inspired', description: 'Editorial red rule, restrained grid, direct labels and compact typography.',
    background: '#ffffff', panel: '#ffffff', ink: '#1f1f1f', muted: '#6b6b6b', grid: '#d7d3cb', soft: '#f2f0eb', accent: '#e3120b',
    palette: ['#e3120b', '#0f6b78', '#6b7c93', '#d9a441', '#7a5195', '#5c8a5e'],
    font: 'Arial, Helvetica, sans-serif', titleWeight: 800, rule: true
  },
  bbc: {
    id: 'bbc', name: 'BBC inspired', description: 'Clear hierarchy, soft grey grid, strong blue/orange palette and direct annotation.',
    background: '#ffffff', panel: '#ffffff', ink: '#222222', muted: '#555555', grid: '#cbcbcb', soft: '#f4f4f4', accent: '#1380a1',
    palette: ['#1380a1', '#faab18', '#990000', '#588300', '#7a5195', '#6f4e7c'],
    font: 'Arial, Helvetica, sans-serif', titleWeight: 800, rule: false
  },
  newsroom: {
    id: 'newsroom', name: 'Newsroom neutral', description: 'Platform-neutral light theme for product dashboards and technical reporting.',
    background: '#ffffff', panel: '#ffffff', ink: '#172033', muted: '#677085', grid: '#e3e7ee', soft: '#f6f8fb', accent: '#315efb',
    palette: ['#315efb', '#00a38c', '#f59e0b', '#db2777', '#7c3aed', '#64748b'],
    font: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', titleWeight: 750, rule: false
  }
};

export function getTheme(themeId = 'economist', accentOverride) {
  const base = THEMES[themeId] || THEMES.economist;
  if (!accentOverride) return {...base, palette: [...base.palette]};
  return {...base, accent: accentOverride, palette: [accentOverride, ...base.palette.slice(1)]};
}
