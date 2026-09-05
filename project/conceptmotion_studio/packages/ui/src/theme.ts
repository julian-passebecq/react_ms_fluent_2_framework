import { createLightTheme } from '@fluentui/react-components';
import type { BrandVariants, Theme } from '@fluentui/react-components';

/** A quiet azure/teal ramp intended for application chrome, not marketing pages. */
export const datapassBrandVariants: BrandVariants = {
  10: '#020304',
  20: '#091A1D',
  30: '#0B2B30',
  40: '#0B3B42',
  50: '#0B4C55',
  60: '#0C5E68',
  70: '#0F707C',
  80: '#16838F',
  90: '#3196A1',
  100: '#52A9B3',
  110: '#72BBC4',
  120: '#91CDD4',
  130: '#AFDDE2',
  140: '#CDECEF',
  150: '#E2F5F6',
  160: '#F3FBFB',
};

const generatedLightTheme = createLightTheme(datapassBrandVariants);

/** Semantic surfaces shared by Fluent chrome and renderer presentation adapters. */
export const datapassSurfaceTokens = {
  canvasWarm: '#f8f8f5', surfaceBase: '#ffffff', surfaceRaised: '#f1f3f2',
  inkPrimary: '#102d43', inkSecondary: '#4f5d64', accentTeal: '#0b6870',
  accentAmber: '#8a5a14', borderSubtle: '#dce3e5',
  elevationLow: '0 2px 8px rgb(16 45 67 / 5%)', radiusCard: '10px', radiusControl: '6px',
} as const;

export const datapassLightTheme: Theme = {
  ...generatedLightTheme,
  colorNeutralBackground1: datapassSurfaceTokens.surfaceBase,
  colorNeutralBackground2: datapassSurfaceTokens.canvasWarm,
  colorNeutralBackground3: '#F1F3F5',
  colorNeutralForeground1: datapassSurfaceTokens.inkPrimary,
  colorNeutralForeground2: datapassSurfaceTokens.inkSecondary,
  colorNeutralStroke1: '#DDE3E6',
  colorNeutralStroke2: '#E9EDEF',
  colorBrandForeground1: '#0F707C',
  colorBrandForeground2: '#0B5A63',
  colorBrandBackground: '#0B6870',
  colorBrandBackgroundHover: '#095A61',
  colorBrandBackgroundPressed: '#084D53',
  fontFamilyBase:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
