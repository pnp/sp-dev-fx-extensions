declare global {
    interface Window {
      __themeState__?: {
        theme: IReadonlyTheme;
      };
      __loadTheme?: () => IReadonlyTheme;
    }
  }
  
  export {};