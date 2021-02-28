import { getTheme } from '@uifabric/styling';
var ThemeState = window.__themeState__;
// Get theme from global UI fabric state object if exists, if not fall back to using uifabric    
export function getThemeColor(slot) {
    if (ThemeState && ThemeState.theme && ThemeState.theme[slot]) {
        return ThemeState.theme[slot];
    }
    var theme = getTheme();
    return theme[slot];
}
//# sourceMappingURL=themeHelper.js.map