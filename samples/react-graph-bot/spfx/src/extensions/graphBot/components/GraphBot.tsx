import * as React from "react";
import IGraphBotProps from "./IGraphBotProps";
import { ActionButton }  from "office-ui-fabric-react/lib/Button";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import { Spinner, SpinnerSize} from "office-ui-fabric-react/lib/spinner";
import { Overlay } from "office-ui-fabric-react/lib/overlay";
import * as ReactDOM from 'react-dom';
import { Chat, DirectLine } from 'botframework-webchat';
import IGraphBotState from "./IGraphBotState";
require("botframework-webchat/botchat.css");
import { UserAgentApplication } from "msal";
import pnp, { Logger, LogLevel } from "sp-pnp-js";
import { Text } from "@microsoft/sp-core-library";
import styles from "./GraphBot.module.scss";
import { SPHttpClient } from "@microsoft/sp-http";
import IGraphBotSettings from "./IGraphBotSettings";
import * as strings from "GraphBotApplicationCustomizerStrings";

const scopes = ["User.ReadBasic.All","User.Read","Mail.Read"];

class GraphBot extends React.Component<IGraphBotProps, IGraphBotState> {

    private _botConnection: DirectLine;
    private clientApplication: UserAgentApplication;

    // Tenant property bag keys 
    private readonly ENTITYKEY_CLIENTID = "PnPGraphBot_ClientId";
    private readonly ENTITYKEY_BOTID =  "PnPGraphBot_BotId";
    private readonly ENTITYKEY_DIRECTLINESECRET = "PnPGraphBot_BotDirectLineSecret";
    private readonly ENTITYKEY_TENANTID = "PnPGraphBot_TenantId";

    constructor(props: IGraphBotProps) {
        super(props);

        this._login = this._login.bind(this);
        this._getAccessToken = this._getAccessToken.bind(this);
        this._initBotWithAccessToken = this._initBotWithAccessToken.bind(this);

        this.state = { 
            showPanel: false,
            isBotInitializing: false,
            botId: null,
        };     
    }

    /**
     * Initialize the chat bot by sending the access token of the current user
     * @param token The access token of the current user
     */
    private _initBotWithAccessToken(token: string): void {

        // Using the backchannel to pass the auth token retrieved from OAuth2 Implicit flow
        this._botConnection.postActivity({ 
            type: "event", 
            value: token, 
            from: { 
                // IMPORTANT (1 of 2): USE THE SAME USER ID FOR BOT STATE TO BE ABLE TO GET USER SPECIFIC DATA IN THE BOT STATE
                id: this.props.context.pageContext.user.email 
            }, 
            name: "userAuthenticated" // Custom name to identify this event in the bot
        })
        .subscribe(id => {

            // Show the panel only if the event has been well received
            this.setState({
                isBotInitializing :false
            });
        });
    }

    /**
     * Function that will login the user
     */
    private async _login()  {

        this.setState({
            isBotInitializing :true,
            showPanel: true,
        });

        // Login the user
        if (this.clientApplication.getUser()) {
            const token = await this._getAccessToken();

            // The acces token is sent every time to the bot because we don't want to store it directly in the bot state per user and handle expiration/refresh behavior
            // This responsibility is delegated to the Web Part itself since it handles the OAuth2 flow.
            this._initBotWithAccessToken(token);
        } else {
            // Be careful here, the loginPopup actuall returns an id_token, not an access_token
            // You can validate the JWT token by your own if you want (not mandatory)
            await this.clientApplication.loginPopup(scopes);
            const token = await this._getAccessToken();
            this._initBotWithAccessToken(token);
        }
    }

    /**
     * Retrieve a valid accessToken
     */
    private async _getAccessToken() {

        try {
            // Try to get a token silently, if the user is already signed in
            const token = await this.clientApplication.acquireTokenSilent(scopes);
            return token;

        } catch (error) {

            try {
                const token =  await this.clientApplication.acquireTokenPopup(scopes);
                return token;
            } catch (error) {
                Logger.write(Text.format("[PageHeader_getAccessToken]: Error: {0}", error));
            }
        }
    }

    public render() {

        // Be careful, the user Id is mandatory to be able to use the bot state service (i.e privateConversationData)
        return (
            <div>
                <ActionButton onClick= { this._login } iconProps={ { iconName: "Robot" } }>     
                    { strings.GraphBotButtonLabel }              
                </ActionButton>
                <Panel
                    isOpen={ this.state.showPanel }
                    isLightDismiss={ true }
                    onDismiss={ () => this.setState({ showPanel: false }) }
                >
                    { this.state.isBotInitializing ? 
                        <Overlay className={ styles.overlayList } >
                            <Spinner size={ SpinnerSize.large } />
                        </Overlay> 
                        : 
                        <Chat 
                            botConnection={ this._botConnection }
                            bot={
                                {
                                    id: this.state.botId,
                                }
                            }
                            user={
                                {
                                    // IMPORTANT (2 of 2): USE THE SAME USER ID FOR BOT STATE TO BE ABLE TO GET USER SPECIFIC DATA IN THE BOT STATE
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
                            sendTyping= { true }/>
                    }                    
                </Panel>
            </div>
        );
    }
    
    public async componentDidMount() {
        
        // Read the bot settings from the tenant property bag
        const settings = await this._getGraphBotSettings(this.props);

        // Init the bot connection + MSAL
        this._initGraphBot(settings);

        this.setState({
            botId: settings.BotId,
        });
    }

    /**
     * Read the bot settings in the tenant property bag
     * @param props the component properties
     */
    private async _getGraphBotSettings(props: IGraphBotProps): Promise<IGraphBotSettings> {
        
        try {
            const clientId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_CLIENTID);
            const botId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_BOTID);
            const directLineSecret = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_DIRECTLINESECRET);
            const tenantId = await props.tenantDataProvider.getTenantPropertyValue(this.ENTITYKEY_TENANTID);
            
            return {
                BotId: botId,
                ClientId: clientId,
                DirectLineSecret: directLineSecret,
                TenantId: tenantId,
            } as IGraphBotSettings;

        } catch (error) {
            Logger.write(Text.format("[PageHeader_getGraphBotSettings]: Error: {0}", error));
        }
    }

    private _initGraphBot(settings: IGraphBotSettings) {

        // Initialize the user agent application for MSAL
        if (!this.clientApplication) {

            const authorityUrl = Text.format("https://login.microsoftonline.com/{0}", settings.TenantId);

            this.clientApplication = new UserAgentApplication(settings.ClientId, authorityUrl, null, {
                // This URL should be the same as the AAD app registered in registration portal
                // This is this parameter allowing to get the login popup to close
                redirectUri: this.props.context.pageContext.site.absoluteUrl,
            });
        }

        // Initialize the bot connection direct line
        this._botConnection = new DirectLine({
            secret: settings.DirectLineSecret,
        });  
    }
}

export default GraphBot;
