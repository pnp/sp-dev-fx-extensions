import * as React from 'react';
import { useRef } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import * as ReactWebChat from 'botframework-webchat';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { IChatbotDialogProps } from './IChatbotDialogProps';
import styles from './ChatbotDialog.module.scss';
import * as strings from 'PowerVirtualAgentsHostApplicationCustomizerStrings';


export const ChatbotDialog: React.FunctionComponent<IChatbotDialogProps> = (props: IChatbotDialogProps) => {
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const labelId: string = useId('dialogLabel');
  const subTextId: string = useId('subTextLabel');
  const modalProps = React.useMemo(
      () => ({
          isBlocking: false,
      }),
      [labelId, subTextId],
  );
  const theURL: string = `https://powerva.microsoft.com/api/botmanagement/v1/directline/directlinetoken?botId=${props.botId}&tenantId=${props.tenantId}`;


  console.log("Greet", props.greet);
  const store = ReactWebChat.createStore(
      {},
      ({ dispatch }) => next => action => {
          // Should we greet the user?
          if (props.greet === true) {
              // Greet them
              if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
                  dispatch({
                      meta: {
                          method: "keyboard",
                      },
                      payload: {
                          activity: {
                                  channelData: {
                                      postBack: true,
                                  },
                                  //Web Chat will show the 'Greeting' System Topic message which has a trigger-phrase 'hello'
                                  name: 'startConversation',
                                  type: "event"
                              },
                      },
                      type: "DIRECT_LINE/POST_ACTIVITY",
                  });
              }
          }
          return next(action);

      }
  );

  // Function to extract user initials from display name
  const getUserInitials = (text: string): string => {
      if (text) {
          let initials = text.match(/\b\w/g) || [];
          text = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
      }
      return text;
  };

  // Use references instead of using hard-coded ids
  const webChatRef: React.MutableRefObject<HTMLDivElement> = useRef();
  const spinnerRef: React.MutableRefObject<HTMLDivElement> = useRef();

  // Set the dialog content properties
  const dialogContentProps = {
      type: DialogType.normal,
      title: props.botFriendlyName,
      closeButtonAriaLabel: strings.CloseButtonAriaLabel
  };

  // If the bot image and initials were passed, display user profile images and avatar images
  const avatarOptions = props.botAvatarImage && props.botAvatarInitials ? {
      botAvatarImage: props.botAvatarImage,
      botAvatarInitials: props.botAvatarInitials,
      userAvatarImage: `/_layouts/15/userphoto.aspx?size=S&username=${props.userEmail}`,
      userAvatarInitials: getUserInitials(props.userDisplayName)
  } : undefined;

  // Get the web chat direct line
  fetch(theURL)
      .then(response => response.json())
      .then(conversationInfo => {
          spinnerRef.current.style.display = 'none';
          webChatRef.current.style.minHeight = '50vh';
          ReactWebChat.renderWebChat(
              {
                  directLine: ReactWebChat.createDirectLine({
                      token: conversationInfo.token,
                  }),
                  styleOptions: avatarOptions,
                  store: store,
              },
              webChatRef.current
          );
      })
      .catch(err => console.error("An error occurred: " + err));

  return (
      <>
          <DefaultButton secondaryText={strings.ButtonAlternateText} onClick={toggleHideDialog} text={props.buttonLabel} />
          <Dialog styles={{
              main: { selectors: { ['@media (min-width: 480px)']: { width: 450, minWidth: 450, maxWidth: '1000px' } } }
          }} hidden={hideDialog} onDismiss={toggleHideDialog} dialogContentProps={dialogContentProps} modalProps={modalProps}>
              <div className={styles.chatcontainer}>
                  <div ref={webChatRef} role="main" className={styles.webchat}></div>
                  <div ref={spinnerRef}><Spinner label={strings.LoadingLabel} className={styles.spinner} /></div>
              </div>
          </Dialog>
      </>
  );
};
