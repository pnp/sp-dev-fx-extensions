export interface IConversationResponse {
  id: string;
  createdDateTime: string;
  displayName: string;
  status: string;
  turnCount: number;
}

export interface IChatRequest {
  message: {
    text: string;
  };
  locationHint: {
    timeZone: string;
  };
  contextualResources: {
    files: Array<{
      uri: string;
    }>;
    webContext: {
      isWebEnabled: boolean;
    };
  };
}

export interface IAttribution {
  attributionType: string;
  providerDisplayName: string;
  attributionSource: string;
  seeMoreWebUrl: string;
  imageWebUrl: string;
  imageFavIcon: string;
  imageWidth: number;
  imageHeight: number;
}

export interface ISensitivityLabel {
  sensitivityLabelId: string | undefined;
  displayName: string | undefined;
  tooltip: string | undefined;
  priority: number | undefined;
  color: string | undefined;
}

export interface ICopilotMessage {
  '@odata.type': string;
  id: string;
  text: string;
  createdDateTime: string;
  adaptiveCards: unknown[];
  attributions: IAttribution[];
  sensitivityLabel: ISensitivityLabel;
}

export interface IChatResponse {
  '@odata.context': string;
  id: string;
  createdDateTime: string;
  displayName: string;
  state: string;
  turnCount: number;
  messages: ICopilotMessage[];
}

export interface ISmartContextResult {
  text: string;
  attributions: IAttribution[];
}

// Smart Context Schema Interfaces
export interface IMyRole {
  role: 'Author' | 'Directly Involved' | 'Action Required' | 'Aware';
  reason: string;
}

export interface IPendingAction {
  action: string;
  urgency: 'high' | 'medium' | 'low';
  dueDate: string;
  owner: string;
}

export interface IKeyDecision {
  decision: string;
  madeBy: string;
  date: string;
  context: string;
}

export interface ITimelineEvent {
  date: string;
  event: string;
  source: 'Email' | 'Teams' | 'Meeting' | 'Document' | 'Page';
}

export interface IPerson {
  name: string;
  url: string;
  detail?: string;
}

export interface ISmartContextData {
  myRole: IMyRole;
  pendingActions: IPendingAction[];
  keyDecisions: IKeyDecision[];
  timeline: ITimelineEvent[];
  tldr: string[];
  people: IPerson[];
  attributions: IAttribution[];
}

export interface ICopilotService {
  createConversation(): Promise<IConversationResponse>;
  sendChatMessage(conversationId: string, pageUrl: string): Promise<IChatResponse>;
  getSmartContext(pageUrl: string): Promise<ISmartContextResult>;
}
