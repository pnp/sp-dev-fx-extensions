declare interface IShowHidePageTitleCommandSetStrings {
    ShowHideCommand: string;
    UnkCmd: string;
    DialogTitle: string;
    CloseAL: string;
    BtnSave: string;
    BtnCancel: string;
}

declare module 'ShowHidePageTitleCommandSetStrings' {
    const strings: IShowHidePageTitleCommandSetStrings;
    export = strings;
}
