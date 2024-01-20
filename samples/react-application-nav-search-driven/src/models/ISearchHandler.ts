export interface ISharePointSearchResults {
    PrimaryQueryResult: ISharePointPrimaryQueryResult;
  }
  
  export interface ISharePointPrimaryQueryResult {
    RelevantResults: ISharePointRelevantResultsTable;
  }
  
  export interface ISharePointRelevantResultsTable {
      Table: ISharePointSearchResultsTable;
      RowCount: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Properties: any[];
  }
  
  export interface ISharePointSearchResultsTable {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rows: Array<any>;
  }