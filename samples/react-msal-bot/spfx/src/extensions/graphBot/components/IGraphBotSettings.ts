interface IGraphBotSettings {
    /**
     * The Azure Active Directory client identifier
     */
    ClientId: string;

    /**
     * The Office 365 tenant id
     */
    TenantId: string;

    /**
     * The bot application id
     */
    BotId: string;

    /**
     * The secret key for the bot "Direct Line" channel
     */
    DirectLineSecret: string;
}

export default IGraphBotSettings;