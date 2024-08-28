declare interface IImageEditorCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ImageEditorCommandSetStrings' {
  const strings: IImageEditorCommandSetStrings;
  export = strings;
}
