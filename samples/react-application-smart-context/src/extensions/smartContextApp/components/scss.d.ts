declare module '*.module.scss' {
  interface IExportStyles {
    [key: string]: string;
  }
  const styles: IExportStyles;
  export default styles;
}
