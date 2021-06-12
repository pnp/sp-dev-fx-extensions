import { getTheme } from '@uifabric/styling';

const ThemeState = (<any>window).__themeState__;

// Get theme from global UI fabric state object if exists, if not fall back to using uifabric    
export function getThemeColor(slot: string) {
    if (ThemeState && ThemeState.theme && ThemeState.theme[slot]) {
        return ThemeState.theme[slot];
    }
    const theme = getTheme();
    return theme[slot];
}