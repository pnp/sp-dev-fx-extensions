import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface IBotFrameworkChatPopupApplicationChatProps {
  botEndpoint: string;
  botScopeUri: string;
  context: ApplicationCustomizerContext;
}
