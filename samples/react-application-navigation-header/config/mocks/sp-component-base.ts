export interface IReadonlyTheme {
  isInverted?: boolean;
  palette?: Record<string, string>;
  semanticColors?: Record<string, string>;
  fonts?: Record<string, { fontSize?: string }>;
}
export class ThemeProvider {
  public static readonly serviceKey = { id: 'ThemeProvider' };
}
export interface ThemeChangedEventArgs {
  theme: IReadonlyTheme;
}