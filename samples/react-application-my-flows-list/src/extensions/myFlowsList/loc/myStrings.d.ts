declare interface IMyFlowsListApplicationCustomizerStrings {
  ShowFlowsButtonLabel: string;
  FlowsPanelTitle: string;
  FlowsListName: string;
  FlowsListStatus: string;
  FlowsListType: string;
  FlowTypeLabel: string;
  FlowStatusLabel: string;
  FlowStartTimeLabel: string;
  FlowEndTimeLabel: string;
  FlowErrorMessageLabel: string;
  FlowDisabledLabel: string;
  FlowDetailsLabel: string;
}

declare module 'MyFlowsListApplicationCustomizerStrings' {
  const strings: IMyFlowsListApplicationCustomizerStrings;
  export = strings;
}
