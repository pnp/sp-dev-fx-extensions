import * as React from "react";
import IPageHeaderProps from "./IPageHeaderProps";
import { ActionButton }  from "office-ui-fabric-react/lib/Button";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import { Spinner, SpinnerSize} from "office-ui-fabric-react/lib/spinner";
import { Overlay } from "office-ui-fabric-react/lib/overlay";
import * as ReactDOM from 'react-dom';
import { Chat, DirectLine } from 'botframework-webchat';
import IPageHeaderState from "./IPageHeaderState";
require("botframework-webchat/botchat.css");
import { UserAgentApplication } from "msal";
import { Logger, LogLevel } from "sp-pnp-js";
import { Text } from "@microsoft/sp-core-library";
import styles from "./PageHeader.module.scss";

// Global settings
// TODO: Read theses values from the global tenant properties
// + Bot Direct Line secret
// + Bot ID
const msalconfig = {
    clientID: 'f8b71e39-840b-4265-8276-7b907b5ce01e',
    authorityUrl: 'https://login.microsoftonline.com/321e2764-3302-41bf-87fd-5f669647b076'
};

const scopes = ["User.Read", "Mail.Read"];

class PageHeader extends React.Component<IPageHeaderProps, IPageHeaderState> {

    private _botConnection: DirectLine;
    private clientApplication: UserAgentApplication;

    constructor(props: IPageHeaderProps) {
        super(props);

        // Initialize the user agent application for MSAL
        if (!this.clientApplication) {
            this.clientApplication = new UserAgentApplication(msalconfig.clientID, msalconfig.authorityUrl, null, {
                // This URL should be the same as the AAD app registered in registration portal
                redirectUri: this.props.context.pageContext.site.absoluteUrl,
            });
        }

        this._login = this._login.bind(this);
        this._getAccessToken = this._getAccessToken.bind(this);
        this._initBotWithAccessToken = this._initBotWithAccessToken.bind(this);

        this.state = { 
            showPanel: false,
            isBotInitializing: false,
        };

        // Bot connection used as back channel
        this._botConnection = new DirectLine({
            secret: "yJ0i3EV3AWA.cwA.Amc.VgrHiVJ5LNbg9eT5F4rtTxUdxpu8IdFg-GJkoCAA2dM",
        });        
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
            this._initBotWithAccessToken(token);
        } else {
            const token = await this.clientApplication.loginPopup(scopes);
            this._initBotWithAccessToken(token);
        }
    }

    /**
     * Retrieve an accessToken for the Microsoft Graph
     */
    private async _getAccessToken() {

        try {
            // Try to get a token silently, if the user is arleady signed in
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
                    Engage with a bot               
                </ActionButton>
                <Panel
                    isOpen={ this.state.showPanel }
                    isLightDismiss={ true }
                    onDismiss={ () => this.setState({ showPanel: false }) }
                >
                    { this.state.isBotInitializing ? 
                        <Overlay className={ styles.overlayList }>
                            <Spinner size={ SpinnerSize.large }/>
                        </Overlay> : null
                    }
                    <Chat 
                        botConnection={ this._botConnection }
                        bot={
                        {
                            id: "7833069a-0013-44a3-b9e0-ed0ef67c1830",
                            name: "sp-bot-qna",
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
                </Panel>
            </div>
        );
    }
}

export default PageHeader;
