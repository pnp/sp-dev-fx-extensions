export interface IChatbotProps {
     /**
     * The bot id GUID for the bot that you want to connect to
     */
      botId: string;
      tenantId: string;
      botFriendlyName?: string;
      buttonLabel?: string;
      userEmail: string;
      userDisplayName: string;
      botAvatarImage?: string;
      botAvatarInitials?: string;
      greet?: boolean;
}