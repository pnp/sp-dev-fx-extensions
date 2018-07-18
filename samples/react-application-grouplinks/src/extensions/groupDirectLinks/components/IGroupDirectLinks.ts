import ApplicationCustomizerContext from "@microsoft/sp-application-base/lib/extensibility/ApplicationCustomizerContext";

export interface IGroupDirectLinksProps {
  context: ApplicationCustomizerContext;
}

export interface IGroupDirectLinksState {
    groupDirectLinksInfo: IGroupDirectLinksInfo;
}

export interface IGroupDirectLinksInfo {
  id: string;
  allowToAddGuests?: boolean;
  calendarUrl?: string;
  documentsUrl?: string;
  inboxUrl?: string;
  isPublic?: boolean;
  notebookUrl?: string;
  peopleUrl?: string;
  yammerUrl?: string;
  teamsUrl?: string;
}