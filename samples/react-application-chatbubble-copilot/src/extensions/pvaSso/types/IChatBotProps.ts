export interface IChatbotProps {
  /** The URL endpoint for the bot */
  botURL: string;
  
  /** Display name for the bot */
  botName?: string;
  
  /** Email of the current user */
  userEmail: string;
  
  /** Display name of the current user */
  userFriendlyName?: string;
  
  /** Initials to display in bot's avatar */
  botAvatarInitials?: string;
  
  /** Whether to send initial greeting message */
  greet?: boolean;
  
  /** Custom OAuth scope */
  customScope: string;
  
  /** Azure AD client ID */
  clientID: string;
  
  /** Azure AD authority URL */
  authority: string;
  
  /** SharePoint context */
  context: any;

  /** Controls whether the chatbot dialog is open */
  isOpen: boolean;
 
  /** Callback invoked when the dialog is dismissed */
  onDismiss: () => void;
}