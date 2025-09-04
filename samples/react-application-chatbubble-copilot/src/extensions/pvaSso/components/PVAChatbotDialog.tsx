import * as React from "react";
import { useId } from '@fluentui/react-hooks';
import * as ReactWebChat from 'botframework-webchat';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Dispatch } from 'redux';
import { useRef, useEffect } from "react";
import { IChatbotProps } from "../types/IChatBotProps";
import MSALWrapper from "../services/MSALWrapper"; // Ensure this is correctly implemented
import styles from "../styles/PvaSsoApplicationCustomizer.module.scss";

/**
 * PVAChatbotDialog component that renders the chatbot within a Fluent UI Dialog.
 * It handles authentication, token exchanges, and renders the Bot Framework Web Chat.
 */
export const PVAChatbotDialog: React.FC<IChatbotProps> = (props) => {
  // Fluent UI Dialog properties
  const dialogContentProps = {
    type: DialogType.normal,
    title: (
      <div className={styles.header}>
        {props.botName}
      </div>
    ),
    closeButtonAriaLabel: 'Close',
  };


  const labelId: string = useId('dialogLabel');
  const subTextId: string = useId('subTextLabel');

  const modalProps = React.useMemo(() => ({
    isBlocking: false
  }), [labelId, subTextId]);

  // Parse and validate botURL
  const botURL = props.botURL?.trim() || '';
  if (!botURL) {
    console.error("botURL is empty in PVAChatbotDialog. Check your props!");
  }
  const idx = botURL.indexOf('/powervirtualagents');
  if (idx === -1 && botURL !== '') {
    console.error("botURL doesn't contain '/powervirtualagents'. Check your config:", botURL);
  }

  // Safely create environmentEndPoint
  const environmentEndPoint = idx > -1 ? botURL.slice(0, idx) : '';
  const queryIndex = botURL.indexOf('api-version');
  let apiVersion = "";
  if (queryIndex !== -1) {
    const versionPart = botURL.slice(queryIndex);
    const split = versionPart.split('=');
    apiVersion = split[1] || "";
  }

  const regionalChannelSettingsURL = environmentEndPoint && apiVersion
    ? `${environmentEndPoint}/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`
    : '';

  // Refs for the Web Chat container and the loading spinner
  const webChatRef = useRef<HTMLDivElement>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement>(null);

  /**
   * Utility function that extracts the OAuthCard resource URI from the incoming activity.
   * @param activity Incoming activity from the bot.
   * @returns The OAuthCard resource URI or undefined.
   */
  function getOAuthCardResourceUri(activity: any): string | undefined {
    const attachment = activity?.attachments?.[0];
    if (attachment?.contentType === 'application/vnd.microsoft.card.oauth' && attachment.content.tokenExchangeResource) {
      return attachment.content.tokenExchangeResource.uri;
    }
  }

  /**
   * Sets up the chatbot by handling authentication, token exchange, and rendering Web Chat.
   */
  const handleLayerDidMount = async () => {
    // Ensure botURL and regionalChannelSettingsURL are valid
    if (!botURL || idx === -1 || !regionalChannelSettingsURL) {
      console.error("Invalid botURL or regionalChannelSettingsURL. Cannot set up chat.");
      return;
    }

    // Initialize MSAL Wrapper
    const MSALWrapperInstance = new MSALWrapper(props.clientID, props.authority);

    // Acquire access token silently or via interactive login
    let responseToken = await MSALWrapperInstance.handleLoggedInUser([props.customScope], props.userEmail);
    if (!responseToken) {
      responseToken = await MSALWrapperInstance.acquireAccessToken([props.customScope], props.userEmail);
    }
    const token = responseToken?.accessToken || null;

    if (!token) {
      console.error("Failed to acquire access token.");
      return;
    }

    // Fetch regional channel settings
    let regionalChannelURL: string | undefined;
    const regionalResponse = await fetch(regionalChannelSettingsURL);
    if (regionalResponse.ok) {
      const data = await regionalResponse.json();
      regionalChannelURL = data.channelUrlsById?.directline;
      if (!regionalChannelURL) {
        console.error("DirectLine URL not found in regional channel settings.");
        return;
      }
    } else {
      console.error(`HTTP error fetching ${regionalChannelSettingsURL}: Status ${regionalResponse.status}`);
      return;
    }

    // Fetch DirectLine token from botURL
    let directline: any;
    const response = await fetch(botURL);
    if (response.ok) {
      const conversationInfo = await response.json();
      directline = ReactWebChat.createDirectLine({
        token: conversationInfo.token,
        domain: `${regionalChannelURL}v3/directline`
      });
    } else {
      console.error(`HTTP error fetching botURL: Status ${response.status}`);
      return;
    }

    // Create Web Chat store to handle greeting and token exchange
    const store = ReactWebChat.createStore(
      {},
      ({ dispatch }: { dispatch: Dispatch }) => (next: any) => (action: any) => {
        // Handle greeting if enabled
        if (props.greet && action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
          dispatch({
            meta: { method: "keyboard" },
            payload: {
              activity: {
                channelData: { postBack: true },
                name: 'startConversation',
                type: "event"
              },
            },
            type: "DIRECT_LINE/POST_ACTIVITY",
          });
          return next(action);
        }

        // Handle OAuth token exchange
        if (action.type === "DIRECT_LINE/INCOMING_ACTIVITY") {
          const activity = action.payload.activity;
          if (activity.from?.role === 'bot' && getOAuthCardResourceUri(activity)) {
            directline.postActivity({
              type: 'invoke',
              name: 'signin/tokenExchange',
              value: {
                id: activity.attachments[0].content.tokenExchangeResource.id,
                connectionName: activity.attachments[0].content.connectionName,
                token
              },
              from: {
                id: props.userEmail,
                name: props.userFriendlyName ?? '',
                role: "user"
              }
            }).subscribe(
              (id: any) => {
                if (id === "retry") {
                  // Bot couldn't handle the invoke -> fallback to OAuthCard
                  return next(action);
                }
              },
              () => {
                // Error -> fallback to OAuthCard
                return next(action);
              }
            );
            // If successful, do not show OAuthCard
            return;
          }
        }

        return next(action);
      }
    );

    // Web Chat style options
    const styleOptions = { hideUploadButton: true };

    // Render Web Chat
    if (token && directline && webChatRef.current && loadingSpinnerRef.current) {
      webChatRef.current.style.minHeight = '50vh';
      loadingSpinnerRef.current.style.display = 'none';

      ReactWebChat.renderWebChat(
        {
          directLine: directline,
          store: store,
          styleOptions: styleOptions,
          userID: props.userEmail
        },
        webChatRef.current
      );
    }
  };

  /**
   * Effect hook to handle mounting the chatbot when the dialog is open.
   * Properly handles promises to comply with ESLint's no-floating-promises rule.
   */
  useEffect(() => {
    if (!props.isOpen) return;

    // Handle the asynchronous setup with proper error handling
    handleLayerDidMount().catch((error) => {
      console.error("Error in handleLayerDidMount:", error);
    });
  }, [props.isOpen]);

  return (
    <Dialog
      hidden={!props.isOpen}
      onDismiss={props.onDismiss}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
    >
      <div className={styles.chatbotContainer}>
        <div
          ref={webChatRef}
          className={styles.webChatContainer}
          role="main"
        />

        <div ref={loadingSpinnerRef} className={styles.spinnerContainer}>
          <Spinner label="Loading chatbot..." />
        </div>

      </div>
    </Dialog>
  );
};
