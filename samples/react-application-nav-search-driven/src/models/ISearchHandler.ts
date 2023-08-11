export interface ISharePointSearchResults {
    PrimaryQueryResult: ISharePointPrimaryQueryResult;
  }
  
  export interface ISharePointPrimaryQueryResult {
    RelevantResults: ISharePointRelevantResultsTable;
  }
  
  export interface ISharePointRelevantResultsTable {
      Table: ISharePointSearchResultsTable;
      RowCount: number;
      Properties: any[];
  }
  
  export interface ISharePointSearchResultsTable {
      Rows: Array<any>;
  }