import { MSGraphClientV3 } from '@microsoft/sp-http';
import { 
  IConversationResponse, 
  IChatRequest, 
  IChatResponse, 
  ICopilotService,
  ISmartContextResult
} from './ICopilotService';
import { SMART_CONTEXT_SYSTEM_PROMPT } from '../constants/systemPrompt';
import { 
  ConversationCreationError, 
  ChatMessageError, 
  NoResponseError 
} from './errors';
import { removeInlineCitations } from './serviceUtils';

export class CopilotService implements ICopilotService {
  private graphClient: MSGraphClientV3;

  constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
  }

  /**
   * Creates a new Copilot conversation
   * POST https://graph.microsoft.com/beta/copilot/conversations
   */
  public async createConversation(): Promise<IConversationResponse> {
    try {
      const response = await this.graphClient
        .api('/copilot/conversations')
        .version('beta')
        .post({});

      return response as IConversationResponse;
    } catch (error) {
      throw new ConversationCreationError(error);
    }
  }

  /**
   * Sends a chat message to an existing conversation
   * POST https://graph.microsoft.com/beta/copilot/conversations/{conversationId}/chat
   */
  public async sendChatMessage(conversationId: string, pageUrl: string): Promise<IChatResponse> {
    try {
      const requestBody: IChatRequest = {
        message: {
          text: SMART_CONTEXT_SYSTEM_PROMPT
        },
        locationHint: {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        contextualResources: {
          files: [
            {
              uri: pageUrl
            }
          ],
          webContext: {
            isWebEnabled: false
          }
        }
      };

      const response = await this.graphClient
        .api(`/copilot/conversations/${conversationId}/chat`)
        .version('beta')
        .post(requestBody);

      // DEBUG: Log full API response
      console.log('[CopilotService] Chat API Response:', JSON.stringify(response, null, 2));

      return response as IChatResponse;
    } catch (error) {
      throw new ChatMessageError(conversationId, error);
    }
  }

  /**
   * Creates a conversation and sends the Smart Context request
   * Returns the assistant's response (second message in the messages array)
   */
  public async getSmartContext(pageUrl: string): Promise<ISmartContextResult> {
    // Step 1: Create conversation
    const conversation = await this.createConversation();
    
    // Step 2: Send chat message with context
    const chatResponse = await this.sendChatMessage(conversation.id, pageUrl);
    
    // Step 3: Extract the assistant's response (second message, index 1)
    // First message (index 0) is the user's prompt, second message (index 1) is the assistant's response
    if (chatResponse.messages && chatResponse.messages.length > 1) {
      const assistantMessage = chatResponse.messages[1];
      // Clean inline citations like [1](url) that Copilot sometimes adds
      const cleanedText = removeInlineCitations(assistantMessage.text);
      return {
        text: cleanedText,
        attributions: assistantMessage.attributions || []
      };
    }
    
    throw new NoResponseError();
  }
}
