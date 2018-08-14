import * as React from "react";
import IGraphBotProps from "./IGraphBotProps";
import { ActionButton }  from "office-ui-fabric-react/lib/Button";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { Spinner, SpinnerSize} from "office-ui-fabric-react/lib/spinner";
import { Overlay } from "office-ui-fabric-react/lib/overlay";
import { Chat, DirectLine, ConnectionStatus } from 'botframework-webchat';
import IGraphBotState from "./IGraphBotState";
require("botframework-webchat/botchat.css");
import { Text } from "@microsoft/sp-core-library";
import styles from "./GraphBot.module.scss";
import IGraphBotSettings from "./IGraphBotSettings";
import * as strings from "GraphBotApplicationCustomizerStrings";
import { PnPClientStorage } from "@pnp/common";
import { Util } from "@pnp/common";
import { Logger } from "@pnp/logging";
import { UserAgentApplication } from "msal";

// Add your scopes according the graph queries you want to perfrom
// Use the Microsoft Graph explorer/documentation to see required permissions by queries 
// (https://developer.microsoft.com/en-us/graph/graph-explorer)
const scopes = ["Directory.Read.All","User.Read"];

class GraphBot extends React.Component<IGraphBotProps, IGraphBotState> {

    private _botConnection: DirectLine;
    private _clientApplication: UserAgentApplication;
    private _botId: string;
    private _directLineSecret: string;

    private _storage: PnPClientStorage;

    // Local storage keys
    private readonly ENTITYKEY_CLIENTID = "PnP_MSAL_GraphBot_ClientId";
    private readonly ENTITYKEY_BOTID =  "PnP_MSAL_GraphBot_BotId";
    private readonly ENTITYKEY_DIRECTLINESECRET = "PnP_MSAL_GraphBot_BotDirectLineSecret";
    private readonly ENTITYKEY_TENANTID = "PnP_MSAL_GraphBot_TenantId";
    private readonly CONVERSATION_ID_KEY = "PnP_MSAL_GraphBot_ConversationId";


    constructor(props: IGraphBotProps) {
        super(props);

        this._login = this._login.bind(this);
        this._getAccessToken = this._getAccessToken.bind(this);
        this._sendAccessTokenToBot = this._sendAccessTokenToBot.bind(this);

        this.state = { 
            showPanel: false,
            isBotInitializing: false
        };     

        // Enable sp-pnp-js session storage wrapper
        this._storage = new PnPClientStorage();
        this._storage.local.enabled = true;
    }

    public render() {

        // Be careful, the user Id is mandatory to be able to use the bot state service (i.e privateConversationData)
        return (
            <div className={ styles.banner }>
                <ActionButton onClick= { this._login } checked={ true } iconProps={ { iconName: "Robot", className: styles.banner__chatButtonIcon } } className={ styles.banner__chatButton}>     
                    { strings.GraphBotButtonLabel }              
                </ActionButton>
                <Panel
                    isOpen={ this.state.showPanel }
                    type={ PanelType.medium}
                    isLightDismiss={ true }
                    onDismiss={ () => this.setState({ showPanel: false }) }
                >
                    { this.state.isBotInitializing ? 
                        <Overlay className={ styles.overlayList } >
                            <Spinner size={ SpinnerSize.large } label={ strings.GraphBotInitializationMessage }/>
                        </Overlay> 
                        : 
                        <Chat 
                            botConnection={ this._botConnection }
                            adaptiveCardsHostConfig= { {} }
                            bot={
                                {
                                    id: this._botId,
                                }
                            }
                            showUploadButton= { false }
                            user={
                                {
                                    // IMPORTANT (2 of 2): USE THE SAME USER ID FOR BOT STATE TO BE ABLE TO GET USER SPECIFIC DATA
                                    id: this.props.context.pageContext.user.email,
                                    name: this.props.context.pageContext.user.displayName,
                                }
                            }
                            locale={ this.props.context.pageContext.cultureInfo.currentCultureName }
                            formatOptions={
                                {
                                    showHeader: false,
                                }  
                            }
                        />
                    }                    
                </Panel>
            </div>
        );
    }
    
    public async componentDidMount() {
        
        // Delete expired local storage items (conversation id, etc.)
        this._storage.local.deleteExpired();

        // Read the bot settings from the tenant property bag or local storage if available
        const settings = await this._getGraphBotSettings(this.props);

        // Initiliaze the MSAL User Agent Application
        this._initMsalUserAgentApplication(settings.ClientId, settings.TenantId);

        // Note: no need to store these informations in state because they are never updated after that
        this._botId = settings.BotId;
        this._directLineSecret = settings.DirectLineSecret;
    }

    /**
     * Initialize the chat bot by sending the access token of the current user
     * @param token The access token of the current user
     */
    private _sendAccessTokenToBot(token: string): void {

        // Using the backchannel to pass the auth token retrieved from OAuth2 implicit grant flow
        this._botConnection.postActivity({ 
            type: "event", 
            value: {
                accessToken: token,
                userDisplayName: this.props.context.pageContext.user.displayName // For the welcome message
            },
            from: { 
                // IMPORTANT (1 of 2): USE THE SAME USER ID FOR BOT STATE TO BE ABLE TO GET USER SPECIFIC DATA
                id: this.props.context.pageContext.user.email 
            }, 
            name: "userAuthenticated" // Custom name to identify this event in the bot
        })
        .subscribe(
            id => {
                // Show the panel only if the event has been well received by the bot (RxJs format)
                this.setState({
                    isBotInitializing :false
                });
            },
            error => {
                Logger.write(Text.format("[GraphBot_sendAccessTokenToBot]: Error: {0}", error));
            }
        );    
    }

    /**
     * Login the current user
     */
    private async _login()  {

        this.setState({
            isBotInitializing :true,
            showPanel: true,
        });

        // Get the conversation id if there is one. Otherwise, a new one will be created
        const conversationId = this._storage.local.get(this.CONVERSATION_ID_KEY);

        // Initialize the bot connection direct line
        this._botConnection = new DirectLine({
            secret: this._directLineSecret,
            webSocket: false, // Needed to be able to retrieve history
            conversationId: conversationId ? conversationId : null,
        });

        this._botConnection.connectionStatus$
        .subscribe((connectionStatus) => {
            switch (connectionStatus) {
                // Successfully connected to the converstaion.
                case ConnectionStatus.Online :
                    if (!conversationId) {
                        // Store the current conversation id in the browser session storage
                        // with 15 minutes expiration
                        this._storage.local.put(
                            this.CONVERSATION_ID_KEY, this._botConnection["conversationId"], 
                            Util.dateAdd(new Date(), "minute", 15)
                        );
                    }

                    break;
            }
        });

        // Login the user
        if (this._clientApplication.getUser()) {
            const token = await this._getAccessToken();

            // The acces token is sent every time to the bot because we don't want to store it directly in the bot state per user and handle expiration/refresh behavior
            // This responsibility is delegated to the Web Part itself since it handles the OAuth2 flow.
            // If the token expired, a new one will be generated by reprompting the user
            this._sendAccessTokenToBot(token);

        } else {

            // Be careful here, the loginPopup actuall returns an id_token, not an access_token
            // You can validate the JWT token by your own if you want (not mandatory)
            const idToken = await this._clientApplication.loginPopup(scopes);
            const accessToken = await this._getAccessToken();
            this._sendAccessTokenToBot(accessToken);
        }
    }

    /**
     * Retrieve a valid accessToken for the current user
     */
    private async _getAccessToken() {

        try {
            // Try to get a token silently, if the user is already signed in
            const token = await this._clientApplication.acquireTokenSilent(scopes);
            return token;

        } catch (error) {

            try {
                const token =  await this._clientApplication.acquireTokenPopup(scopes);
                return token;
            } catch (error) {
                Logger.write(Text.format("[GraphBot_getAccessToken]: Error: {0}", error));
            }
        }
    }

    /**
     * Read the bot settings in the tenant property bag or local storage
     * @param props the component properties
     */
    private async _getGraphBotSettings(props: IGraphBotProps): Promise<IGraphBotSettings> {
    
        // Read these values from the local storage first
        let clientId = this._storage.local.get(this.ENTITYKEY_CLIENTID);
        let botId = this._storage.local.get(this.ENTITYKEY_BOTID);
        let directLineSecret = this._storage.local.get(this.ENTITYKEY_DIRECTLINESECRET);
        let tenantId = this._storage.local.get(this.ENTITYKEY_TENANTID);

        const expiration = Util.dateAdd(new Date(), "day", 1);

        try {

            if (!clientId) {
                clientId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_CLIENTID);
                this._storage.local.put(this.ENTITYKEY_CLIENTID, clientId, expiration);
            }

            if (!botId) {
                botId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_BOTID);
                this._storage.local.put(this.ENTITYKEY_BOTID, botId, expiration);
            }

            if (!directLineSecret) {
                directLineSecret = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_DIRECTLINESECRET);
                this._storage.local.put(this.ENTITYKEY_DIRECTLINESECRET, directLineSecret, expiration);
            }

            if (!tenantId) {
                tenantId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_TENANTID);
                this._storage.local.put(this.ENTITYKEY_TENANTID, tenantId, expiration);
            }
            
            return {
                BotId: botId,
                ClientId: clientId,
                DirectLineSecret: directLineSecret,
                TenantId: tenantId,
            } as IGraphBotSettings;

        } catch (error) {
            Logger.write(Text.format("[GraphBot_getGraphBotSettings]: Error: {0}", error));
        }
    }

    /**
     * Initialize the MSAL user agent
     * @param clientId The client id
     * @param tenantId The tenant id
     */
    private _initMsalUserAgentApplication(clientId: string, tenantId: string) {

        if (!this._clientApplication) {

            const authorityUrl = Text.format("https://login.microsoftonline.com/{0}", tenantId);

            this._clientApplication = new UserAgentApplication(clientId, authorityUrl, null, {
                // This URL should be the same as the AAD app registered in registration portal
                // This is this parameter getting login popup window to close
                redirectUri: this.props.context.pageContext.site.absoluteUrl,
            });
        }
    }
}

export default GraphBot;
