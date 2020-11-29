import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface IBotFrameworkChatPopupApplicationChatProps {
  botEndpoint: string;
  allowedSites: string[];
  context: ApplicationCustomizerContext;
}
