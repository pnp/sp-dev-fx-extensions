declare interface IReportingWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  InstrumentationKeyFieldLabel: string;
  AppInsightsAPIKeyFieldLabel: string;
  AppInsightsAPISecretFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
}

declare module 'ReportingWebPartStrings' {
  const strings: IReportingWebPartStrings;
  export = strings;
}
