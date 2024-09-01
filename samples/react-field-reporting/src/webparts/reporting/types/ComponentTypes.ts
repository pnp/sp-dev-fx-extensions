export type Column = {
    name: string;
    type: string;
};

export type Row = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

export type TableData = {
    tables: {
        name: string;
        columns: Column[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows: any[][];
    }[];
};

export type CustomDimensions = {
    Title: string;
    DocId: string;
    DocName: string;
    DocURL: string;
    UserName: string;
    UserEmail: string;
    ListURL: string;
    LastAccessed: string;
};

export type LogEvent = CustomDimensions & {
    ClientType: string;
    ClientBrowser: string;
    ClientOS: string;
    ClientCity: string;
    ClientCountry: string;
    ItemCount: number;
};