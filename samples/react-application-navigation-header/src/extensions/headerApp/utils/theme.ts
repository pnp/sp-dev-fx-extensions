import type { CSSProperties } from 'react';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { validateHexColor, validateFontSize } from './validation';

const DEFAULT_HEADER_CHROME_BACKGROUND = '#323130';
const DEFAULT_LIGHT_TEXT_COLOR = '#ffffff';
const DEFAULT_DARK_TEXT_COLOR = '#323130';

const MIN_CONTRAST_RATIO_AA = 4.5;

const CSS_NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  orange: '#ffa500',
  purple: '#800080',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  maroon: '#800000',
  navy: '#000080',
  teal: '#008080',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  fuchsia: '#ff00ff',
  transparent: '#00000000'
};

export type IHeaderShellCssVariables = CSSProperties & {
  '--header-background'?: string;
  '--header-glass-background'?: string;
  '--header-chrome-background'?: string;
  '--header-chrome-text'?: string;
  '--header-chrome-hover-background'?: string;
  '--header-chrome-hover-background-strong'?: string;
  '--header-chrome-active-background-strong'?: string;
  '--header-chrome-indicator'?: string;
  '--header-surface'?: string;
  '--header-surface-hover'?: string;
  '--header-panel-header-background'?: string;
  '--header-border'?: string;
  '--header-border-strong'?: string;
  '--header-link'?: string;
  '--header-link-hover'?: string;
  '--header-accent'?: string;
  '--header-accent-hover'?: string;
  '--header-accent-subtle'?: string;
  '--header-menu-shadow'?: string;
  '--header-body-text'?: string;
  '--header-subtext'?: string;
  '--header-hover-background'?: string;
  '--header-active-background'?: string;
  '--header-focus-ring'?: string;
  '--header-shadow'?: string;
  '--header-shadow-color'?: string;
  '--header-font-size-body'?: string;
  '--header-font-size-caption'?: string;
  '--header-font-size-subtext'?: string;
  '--header-font-size-title'?: string;
  '--header-font-size-title-large'?: string;
};

export interface IHeaderColorOverrides {
  background?: string;
  chromeBackground?: string;
  chromeText?: string;
  surface?: string;
  surfaceHover?: string;
  border?: string;
  borderStrong?: string;
  link?: string;
  linkHover?: string;
  accent?: string;
  accentHover?: string;
  bodyText?: string;
  subtext?: string;
  hoverBackground?: string;
  activeBackground?: string;
  focusRing?: string;
  shadow?: string;
}

export function normalizeColorOverrides(raw: Record<string, unknown> | string | undefined): IHeaderColorOverrides {
  let parsedRaw: Record<string, unknown> | undefined;

  if (typeof raw === 'string') {
    try {
      parsedRaw = JSON.parse(raw);
    } catch {
      return {};
    }
  } else if (raw && typeof raw === 'object') {
    parsedRaw = raw;
  }

  if (!parsedRaw) {
    return {};
  }

  const result: IHeaderColorOverrides = {};
  const stringKeys: Array<keyof IHeaderColorOverrides> = [
    'background',
    'chromeBackground',
    'chromeText',
    'surface',
    'surfaceHover',
    'border',
    'borderStrong',
    'link',
    'linkHover',
    'accent',
    'accentHover',
    'bodyText',
    'subtext',
    'hoverBackground',
    'activeBackground',
    'focusRing',
    'shadow'
  ];

  for (const key of stringKeys) {
    const value = parsedRaw[key];
    if (typeof value !== 'string' || !value.trim()) {
      continue;
    }

    const trimmed = value.trim();

    if (validateHexColor(trimmed) !== undefined) {
      continue;
    }

    (result[key] as string) = trimmed;
  }

  return result;
}

export interface IHeaderFontOverrides {
  body?: string;
  caption?: string;
  subtext?: string;
  title?: string;
  titleLarge?: string;
}

export function normalizeFontOverrides(raw: Record<string, unknown> | string | undefined): IHeaderFontOverrides {
  let parsedRaw: Record<string, unknown> | undefined;

  if (typeof raw === 'string') {
    try {
      parsedRaw = JSON.parse(raw);
    } catch {
      return {};
    }
  } else if (raw && typeof raw === 'object') {
    parsedRaw = raw;
  }

  if (!parsedRaw) {
    return {};
  }

  const result: IHeaderFontOverrides = {};
  const stringKeys: Array<keyof IHeaderFontOverrides> = [
    'body',
    'caption',
    'subtext',
    'title',
    'titleLarge'
  ];

  for (const key of stringKeys) {
    const value = parsedRaw[key];
    if (typeof value !== 'string' || !value.trim()) {
      continue;
    }

    const trimmed = value.trim();

    if (validateFontSize(trimmed) !== undefined) {
      continue;
    }

    (result[key] as string) = trimmed;
  }

  return result;
}

function getThemeStyles(
  themeVariant?: IReadonlyTheme,
  fontScale?: number,
  colorOverrides?: IHeaderColorOverrides,
  fontOverrides?: IHeaderFontOverrides
): IHeaderShellCssVariables {
  const palette = themeVariant?.palette;
  const semanticColors = themeVariant?.semanticColors;
  const fonts = themeVariant?.fonts;
  const isDark = !!themeVariant?.isInverted;
  const headerLinkColor = resolveHeaderLinkColor(themeVariant);
  const headerLinkHoverColor = resolveHeaderLinkHoverColor(themeVariant);
  const headerChromeColors = resolveHeaderChromeColors(themeVariant);
  const surfaceColor = semanticColors?.menuBackground ?? semanticColors?.bodyBackground ?? (isDark ? '#252525' : '#ffffff');
  const backgroundColor = semanticColors?.bodyBackground ?? (isDark ? '#1f1f1f' : '#ffffff');
  const chromeBackgroundColor = headerChromeColors.backgroundColor;
  const activeBackgroundColor = pickFirstColor(
    palette?.neutralLighterAlt,
    palette?.neutralLighter,
    semanticColors?.menuItemBackgroundHovered,
    isDark ? '#333333' : '#f3f2f1'
  );
  const chromeTextColor = headerChromeColors.textColor;
  const chromeTextLuminance = getRelativeLuminanceFromString(chromeTextColor);
  const isChromeTextLight = chromeTextLuminance > 0.5;
  const shadowBaseColor = isChromeTextLight ? '#000000' : '#323130';
  const accentColor = resolveAccentColor(themeVariant);
  const accentHoverColor = resolveAccentHoverColor(themeVariant, accentColor);
  const scale = fontScale && fontScale > 0 ? fontScale / 100 : 1;
  const overrides = colorOverrides ?? {};

  const styles: IHeaderShellCssVariables = {
    '--header-background': backgroundColor,
    '--header-glass-background': chromeBackgroundColor,
    '--header-chrome-background': chromeBackgroundColor,
    '--header-chrome-text': chromeTextColor,
    '--header-chrome-hover-background': withAlpha(chromeTextColor, isChromeTextLight ? 0.12 : 0.08),
    '--header-chrome-hover-background-strong': withAlpha(chromeTextColor, isChromeTextLight ? 0.18 : 0.12),
    '--header-chrome-active-background-strong': withAlpha(chromeTextColor, isChromeTextLight ? 0.24 : 0.18),
    '--header-chrome-indicator': withAlpha(chromeTextColor, 0.96),
    '--header-surface': surfaceColor,
    '--header-surface-hover': semanticColors?.menuItemBackgroundHovered ?? palette?.neutralLighterAlt ?? (isDark ? '#2c2c2c' : '#faf9f8'),
    '--header-panel-header-background': `linear-gradient(180deg, ${withAlpha(surfaceColor, 0.98)}, ${withAlpha(chromeBackgroundColor, 0.12)})`,
    '--header-border': semanticColors?.bodyFrameDivider ?? semanticColors?.bodyDivider ?? palette?.neutralLight ?? (isDark ? '#3a3a3a' : '#edebe9'),
    '--header-border-strong': palette?.neutralQuaternaryAlt ?? (isDark ? '#4a4a4a' : '#d2d0ce'),
    '--header-link': headerLinkColor,
    '--header-link-hover': headerLinkHoverColor,
    '--header-accent': accentColor,
    '--header-accent-hover': accentHoverColor,
    '--header-accent-subtle': withAlpha(accentColor, 0.12),
    '--header-menu-shadow': `0 24px 64px -16px ${withAlpha(shadowBaseColor, 0.30)}, 0 6px 18px -8px ${withAlpha(shadowBaseColor, 0.18)}`,
    '--header-body-text': semanticColors?.bodyText ?? (isDark ? '#ffffff' : '#323130'),
    '--header-subtext': semanticColors?.bodySubtext ?? (isDark ? '#d0d0d0' : '#605e5c'),
    '--header-hover-background': palette?.neutralLighter ?? (isDark ? '#333333' : '#f3f2f1'),
    '--header-active-background': activeBackgroundColor,
    '--header-focus-ring': withAlpha(chromeTextColor, isChromeTextLight ? 0.72 : 0.58),
    '--header-shadow': `0 4px 12px ${withAlpha(shadowBaseColor, isChromeTextLight ? 0.18 : 0.08)}`,
    '--header-shadow-color': withAlpha(shadowBaseColor, isChromeTextLight ? 0.18 : 0.08),
    '--header-font-size-body': toScaledFontSize(fonts?.medium?.fontSize, '18px', scale),
    '--header-font-size-caption': toScaledFontSize(fonts?.small?.fontSize, '15px', scale),
    '--header-font-size-subtext': toScaledFontSize(fonts?.small?.fontSize, '15px', scale),
    '--header-font-size-title': toScaledFontSize(fonts?.large?.fontSize, '24px', scale),
    '--header-font-size-title-large': toScaledFontSize(fonts?.xLarge?.fontSize, '28px', scale)
  };

  if (overrides.background) { styles['--header-background'] = overrides.background; }
  if (overrides.chromeBackground) {
    styles['--header-chrome-background'] = overrides.chromeBackground;
    styles['--header-glass-background'] = overrides.chromeBackground;
  }
  if (overrides.chromeText) {
    styles['--header-chrome-text'] = overrides.chromeText;
  }
  if (overrides.surface) { styles['--header-surface'] = overrides.surface; }
  if (overrides.surfaceHover) { styles['--header-surface-hover'] = overrides.surfaceHover; }
  if (overrides.border) { styles['--header-border'] = overrides.border; }
  if (overrides.borderStrong) { styles['--header-border-strong'] = overrides.borderStrong; }
  if (overrides.link) { styles['--header-link'] = overrides.link; }
  if (overrides.linkHover) { styles['--header-link-hover'] = overrides.linkHover; }
  if (overrides.accent) {
    styles['--header-accent'] = overrides.accent;
    styles['--header-accent-subtle'] = withAlpha(overrides.accent, 0.12);
  }
  if (overrides.accentHover) { styles['--header-accent-hover'] = overrides.accentHover; }
  if (overrides.bodyText) { styles['--header-body-text'] = overrides.bodyText; }
  if (overrides.subtext) { styles['--header-subtext'] = overrides.subtext; }
  if (overrides.hoverBackground) { styles['--header-hover-background'] = overrides.hoverBackground; }
  if (overrides.activeBackground) { styles['--header-active-background'] = overrides.activeBackground; }
  if (overrides.focusRing) { styles['--header-focus-ring'] = overrides.focusRing; }
  if (overrides.shadow) { styles['--header-shadow'] = overrides.shadow; }

  const fontOvr = fontOverrides ?? {};
  if (fontOvr.body) { styles['--header-font-size-body'] = fontOvr.body; }
  if (fontOvr.caption) { styles['--header-font-size-caption'] = fontOvr.caption; }
  if (fontOvr.subtext) { styles['--header-font-size-subtext'] = fontOvr.subtext; }
  if (fontOvr.title) { styles['--header-font-size-title'] = fontOvr.title; }
  if (fontOvr.titleLarge) { styles['--header-font-size-title-large'] = fontOvr.titleLarge; }

  return styles;
}

interface IHeaderChromeColors {
  backgroundColor: string;
  textColor: string;
}

function resolveHeaderChromeColors(themeVariant?: IReadonlyTheme): IHeaderChromeColors {
  const backgroundColor = resolveHeaderChromeBackgroundColor(themeVariant);

  return {
    backgroundColor,
    textColor: resolveHeaderChromeTextColor(themeVariant, backgroundColor)
  };
}

function resolveHeaderLinkColor(themeVariant?: IReadonlyTheme): string {
  return pickFirstColor(
    themeVariant?.semanticColors?.bodyText,
    themeVariant?.semanticColors?.bodySubtext,
    themeVariant?.palette?.neutralPrimary,
    DEFAULT_DARK_TEXT_COLOR
  );
}

function resolveAccentColor(themeVariant?: IReadonlyTheme): string {
  return pickFirstColor(
    themeVariant?.palette?.themePrimary,
    themeVariant?.semanticColors?.link,
    themeVariant?.palette?.themeDarkAlt,
    themeVariant?.semanticColors?.primaryButtonBackground,
    '#0f6cbd'
  );
}

function resolveAccentHoverColor(themeVariant: IReadonlyTheme | undefined, accentColor: string): string {
  return pickFirstColor(
    themeVariant?.palette?.themeDarkAlt,
    themeVariant?.palette?.themeDark,
    themeVariant?.semanticColors?.linkHovered,
    accentColor
  );
}

function resolveHeaderLinkHoverColor(themeVariant?: IReadonlyTheme): string {
  return pickFirstColor(
    themeVariant?.semanticColors?.bodySubtext,
    themeVariant?.palette?.neutralSecondary,
    themeVariant?.semanticColors?.bodyText,
    themeVariant?.palette?.neutralPrimary,
    DEFAULT_DARK_TEXT_COLOR
  );
}

function resolveHeaderChromeBackgroundColor(themeVariant?: IReadonlyTheme): string {
  const palette = themeVariant?.palette;
  const semanticColors = themeVariant?.semanticColors;
  const isDark = !!themeVariant?.isInverted;

  const suiteBarColor = readSuiteBarBackground();
  if (suiteBarColor) {
    return suiteBarColor;
  }

  return pickFirstColor(
    palette?.themePrimary,
    palette?.themeDarkAlt,
    palette?.themeDark,
    semanticColors?.bodyFrameBackground,
    isDark ? palette?.neutralDark : palette?.neutralPrimary,
    isDark ? '#0f6cbd' : DEFAULT_HEADER_CHROME_BACKGROUND
  );
}

let cachedSuiteBarBackground: string | undefined;
let suiteBarProbeAttempts = 0;
let suiteBarProbeFinalized = false;
const MAX_SUITE_BAR_PROBE_ATTEMPTS = 10;

function readSuiteBarBackground(): string | undefined {
  if (cachedSuiteBarBackground) {
    return cachedSuiteBarBackground;
  }

  if (suiteBarProbeFinalized) {
    return undefined;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return undefined;
  }

  suiteBarProbeAttempts += 1;

  const SUITE_BAR_SELECTORS: ReadonlyArray<string> = [

    'div.ms-HubNav',
    'div[class*="ms-HubNav"]',
    'div[class*="hubNavRow"]',
    'div[class*="HubNav"]',
    'div.ms-HorizontalNav',
    'div[role="navigation"][class*="hubNav"]',
    'div[role="navigation"][class*="HubNav"]',
    'div.sp-App-hubNav-2',

    '[data-automation-id="pageHeader"]',
    '[data-automation-id="suiteBar"]',
    '[data-automation-id="contentHeader"]',
    '[data-automation-id="topBar"]',
    '[data-automation-id="header"]',
    'div[class*="suiteBar"]',
    'div[class*="SuiteBar"]',
    'div[class*="spPageHeader"]',
    'div[class*="PageHeader"]',
    '#spPageHeader',
    '#spSuiteBar',
    '#SuiteNav',
    'div.SuiteNav',
    'header[role="banner"]',
    'div[data-automation-id="globalNav"]',
    'div[class*="globalNav"]'
  ];

  for (const selector of SUITE_BAR_SELECTORS) {
    const color = readElementBackground(selector);
    if (color) {
      cachedSuiteBarBackground = color;
      suiteBarProbeFinalized = true;
      return color;
    }
  }

  const headerHost = document.querySelector('[data-automation-id="header-host"]');
  if (headerHost) {
    let ancestor: Element | null = headerHost.parentElement;
    while (ancestor && ancestor !== document.body) {
      const color = readComputedStyleBackground(ancestor);
      if (color) {
        cachedSuiteBarBackground = color;
        suiteBarProbeFinalized = true;
        return color;
      }
      ancestor = ancestor.parentElement;
    }
  }

  const SP_CSS_VARS: ReadonlyArray<string> = [
    '--suiteBarBackground',
    '--headerBackground',
    '--topBarBackground',
    '--bodyFrameBackground',
    '--themePrimary'
  ];
  const rootStyle = window.getComputedStyle(document.documentElement);
  for (const cssVar of SP_CSS_VARS) {
    const value = rootStyle.getPropertyValue(cssVar).trim();
    if (value) {
      const rgb = parseColor(value);
      if (rgb) {
        const hex = `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
        cachedSuiteBarBackground = hex;
        suiteBarProbeFinalized = true;
        return hex;
      }
    }
  }

  const bodyColor = readComputedStyleBackground(document.body);
  if (bodyColor) {
    cachedSuiteBarBackground = bodyColor;
    suiteBarProbeFinalized = true;
    return bodyColor;
  }

  if (suiteBarProbeAttempts >= MAX_SUITE_BAR_PROBE_ATTEMPTS) {
    suiteBarProbeFinalized = true;
  }

  return undefined;
}

function readElementBackground(selector: string): string | undefined {
  let element: Element | null;
  try {
    element = document.querySelector(selector);
  } catch {
    return undefined;
  }

  if (!element) {
    return undefined;
  }

  let current: Element | null = element;
  for (let depth = 0; depth < 5 && current; depth++) {
    const color = readComputedStyleBackground(current);
    if (color) {
      return color;
    }
    current = current.parentElement;
  }

  return undefined;
}

function readComputedStyleBackground(element: Element): string | undefined {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;

  if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
    const rgb = parseColor(backgroundColor);
    if (rgb) {
      return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
    }
    return backgroundColor;
  }

  const backgroundImage = computedStyle.backgroundImage;
  if (backgroundImage && backgroundImage !== 'none') {
    const color = extractColorFromBackgroundImage(backgroundImage);
    if (color) {
      return color;
    }
  }

  return undefined;
}

function extractColorFromBackgroundImage(backgroundImage: string): string | undefined {

  const hexMatch = backgroundImage.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
  if (hexMatch) {
    return hexMatch[0];
  }

  const rgbMatch = backgroundImage.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return undefined;
}

export function clearSuiteBarBackgroundCache(): void {
  cachedSuiteBarBackground = undefined;
  suiteBarProbeAttempts = 0;
  suiteBarProbeFinalized = false;
}

export function tryReadSuiteBarBackground(): string | undefined {
  const previous = cachedSuiteBarBackground;
  cachedSuiteBarBackground = undefined;
  const result = readSuiteBarBackground();
  if (!result) {

    cachedSuiteBarBackground = previous;
  }
  return result;
}

function resolveHeaderChromeTextColor(themeVariant: IReadonlyTheme | undefined, backgroundColor: string): string {
  const palette = themeVariant?.palette;
  const semanticColors = themeVariant?.semanticColors;
  const explicitLightTextColor = pickFirstColor(
    semanticColors?.primaryButtonText,
    palette?.white,
    DEFAULT_LIGHT_TEXT_COLOR
  );
  const darkTextColor = pickFirstColor(semanticColors?.bodyText, DEFAULT_DARK_TEXT_COLOR);

  const selectedColor = getBestContrastingTextColor(backgroundColor, explicitLightTextColor, darkTextColor);
  const contrastRatio = getContrastRatio(backgroundColor, selectedColor);

  if (contrastRatio >= MIN_CONTRAST_RATIO_AA) {
    return selectedColor;
  }

  return generateAAContrastColor(backgroundColor);
}

function pickFirstColor(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeColorValue(candidate);

    if (normalizedCandidate) {
      return normalizedCandidate;
    }
  }

  return DEFAULT_HEADER_CHROME_BACKGROUND;
}

function normalizeColorValue(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();

  if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) {
    return trimmed.toLowerCase();
  }

  const hexMapping = CSS_NAMED_COLORS[trimmed.toLowerCase()];
  return hexMapping ?? undefined;
}

function getBestContrastingTextColor(backgroundColor: string, lightTextColor: string, darkTextColor: string): string {
  const lightRatio = getContrastRatio(backgroundColor, lightTextColor);
  const darkRatio = getContrastRatio(backgroundColor, darkTextColor);

  return lightRatio >= darkRatio ? lightTextColor : darkTextColor;
}

function getContrastRatio(backgroundColor: string, foregroundColor: string): number {
  const bgRgb = parseColor(backgroundColor);
  const fgRgb = parseColor(foregroundColor);

  if (!bgRgb || !fgRgb) {
    return 0;
  }

  const bgLuminance = getRelativeLuminance(bgRgb);
  const fgLuminance = getRelativeLuminance(fgRgb);
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminanceFromString(color: string): number {
  const rgb = parseColor(color);

  if (!rgb) {
    return 0;
  }

  return getRelativeLuminance(rgb);
}

function getRelativeLuminance(color: { red: number; green: number; blue: number }): number {
  const channels = [color.red, color.green, color.blue].map((value: number) => {
    const normalizedValue = value / 255;
    return normalizedValue <= 0.03928 ? normalizedValue / 12.92 : Math.pow((normalizedValue + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function generateAAContrastColor(backgroundColor: string): string {
  const bgRgb = parseColor(backgroundColor);

  if (!bgRgb) {
    return DEFAULT_LIGHT_TEXT_COLOR;
  }

  const bgLuminance = getRelativeLuminance(bgRgb);

  if (bgLuminance > 0.7) {
    return DEFAULT_DARK_TEXT_COLOR;
  }

  if (bgLuminance < 0.02) {
    return DEFAULT_LIGHT_TEXT_COLOR;
  }

  const darkColorRgb = parseColor(DEFAULT_DARK_TEXT_COLOR);
  const darkLuminance = darkColorRgb ? getRelativeLuminance(darkColorRgb) : 0.04;
  const lightLuminance = 1.0;

  const darkRatio = bgLuminance > darkLuminance
    ? (bgLuminance + 0.05) / (darkLuminance + 0.05)
    : (darkLuminance + 0.05) / (bgLuminance + 0.05);

  const lightRatio = (lightLuminance + 0.05) / (bgLuminance + 0.05);

  if (darkRatio >= MIN_CONTRAST_RATIO_AA) {
    return DEFAULT_DARK_TEXT_COLOR;
  }

  if (lightRatio >= MIN_CONTRAST_RATIO_AA) {
    return DEFAULT_LIGHT_TEXT_COLOR;
  }

  if (bgLuminance > 0.5) {
    const targetDark = (bgLuminance + 0.05) / MIN_CONTRAST_RATIO_AA - 0.05;
    const component = Math.round(Math.min(targetDark * 255, 255));
    const hexValue = toHex(component);
    return `#${hexValue}${hexValue}${hexValue}`;
  }

  const targetLight = (bgLuminance + 0.05) * MIN_CONTRAST_RATIO_AA - 0.05;
  const component = Math.round(Math.min(targetLight, 1.0) * 255);
  const hexValue = toHex(component);
  return `#${hexValue}${hexValue}${hexValue}`;
}

function parseColor(color: string): { red: number; green: number; blue: number } | undefined {
  const normalized = resolveColorHex(color);

  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1);
    const expanded = hex.length === 3
      ? hex.split('').map((c: string) => `${c}${c}`).join('')
      : hex;

    if (expanded.length === 6) {
      return {
        red: parseInt(expanded.slice(0, 2), 16),
        green: parseInt(expanded.slice(2, 4), 16),
        blue: parseInt(expanded.slice(4, 6), 16)
      };
    }
  }

  const rgbaMatch = normalized.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i
  );

  if (rgbaMatch) {
    return {
      red: parseInt(rgbaMatch[1], 10),
      green: parseInt(rgbaMatch[2], 10),
      blue: parseInt(rgbaMatch[3], 10)
    };
  }

  return undefined;
}

function resolveColorHex(color: string): string | undefined {
  const trimmed = color.trim();

  if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) {
    return trimmed.toLowerCase();
  }

  return CSS_NAMED_COLORS[trimmed.toLowerCase()];
}

export function getThemeStylesCss(
  themeVariant?: IReadonlyTheme,
  fontScale?: number,
  colorOverrides?: IHeaderColorOverrides,
  fontOverrides?: IHeaderFontOverrides
): string {
  const styles = getThemeStyles(themeVariant, fontScale, colorOverrides, fontOverrides);
  const entries: string[] = [];

  for (const key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      const value = styles[key as keyof IHeaderShellCssVariables];

      if (typeof value === 'string') {
        entries.push(`${key}: ${value};`);
      }
    }
  }

  return `:root { ${entries.join(' ')} }`;
}

function withAlpha(color: string, alpha: number): string {
  const rgbColor = parseColor(color);

  if (rgbColor) {
    return `rgba(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue}, ${alpha})`;
  }

  return color.trim();
}

function toFontSize(value: string | number | undefined, fallback: string): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value ?? fallback;
}

function toScaledFontSize(value: string | number | undefined, fallback: string, scale: number): string {
  const base = toFontSize(value, fallback);
  if (scale === 1) {
    return base;
  }
  const numericMatch = base.match(/^([\d.]+)(px|rem|em)?$/);
  if (!numericMatch) {
    return base;
  }
  const numericValue = parseFloat(numericMatch[1]);
  const unit = numericMatch[2] || 'px';
  return `${(numericValue * scale).toFixed(2)}${unit}`;
}

function toHex(n: number): string {
  const hex = n.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export function applyThemeStylesToElement(
  element: HTMLElement | undefined,
  themeVariant?: IReadonlyTheme,
  fontScale?: number,
  colorOverrides?: IHeaderColorOverrides,
  fontOverrides?: IHeaderFontOverrides
): void {
  if (!element) {
    return;
  }

  const styles = getThemeStyles(themeVariant, fontScale, colorOverrides, fontOverrides);

  for (const key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      const value = styles[key as keyof IHeaderShellCssVariables];
      if (typeof value === 'string') {
        element.style.setProperty(key, value);
      }
    }
  }
}
