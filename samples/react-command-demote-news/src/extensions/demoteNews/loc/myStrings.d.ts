declare interface IDemoteNewsCommandSetStrings {
    Demote: string;
    NotPromoted: string;
    CheckedOutTo: string;
    TakeOwnership:  string;
    DemoteOk: string;
    Error: string;
}

declare module 'DemoteNewsCommandSetStrings' {
    const strings: IDemoteNewsCommandSetStrings;
    export = strings;
}
