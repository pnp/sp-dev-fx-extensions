import styles from './BotFrameworkChatPopupApplicationChat.module.scss';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import { Popper, Manager, Reference } from 'react-popper';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IBotFrameworkChatPopupApplicationChatProps } from "./IBotFrameworkChatPopupApplicationChatProps";
import * as md5 from 'blueimp-md5';
import { BotSignInToast } from './Notification/BotSignInToast';
import { TraditionalBotAuthenticationToast } from './Notification/TraditionalBotAuthenticationToast';

export const BotFrameworkChatPopupApplicationChat: React.FunctionComponent<IBotFrameworkChatPopupApplicationChatProps> = (props) => {
  const styleSetOptions = useMemo(
    () => {
     return {
        hideScrollToEndButton: false,
        rootHeight: '50%',
        rootWidth: '50%'
      };
    },[]);

  const [directLine, setDirectLine] = useState(createDirectLine({}));
  const [isOpen, setIsOpen] = useState(0);

  const generateToken = async (botEndpoint: string, userId?: string): Promise<string> => {
    const token = await window
      .fetch(`${botEndpoint}/directline/token`, {
        method: 'POST',
        body: JSON.stringify({ user: userId ? userId : '' }),
        headers: { 'Content-Type': 'application/json' },
      })
      .then(
        async (response: any): Promise<string> => {
          if (response.ok) {
            const tokenResponse = await response.clone().json();
            return tokenResponse.token;
          }
          return '';
        }
      );
      return token;
  };

  useEffect(() => {
    const userId = props.context.pageContext.user.loginName;
    generateToken(props.botEndpoint, md5(userId)).then((token: string) => {
      if (token) {
        setDirectLine(createDirectLine({ token }));
      }
    });
  }, []);


  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' && action.payload.activity.from.role === 'bot') {
          const activity =
          (action.payload.activity.attachments || []).find(
            ({ contentType }) => contentType === 'application/vnd.microsoft.card.oauth'
          ) || {};
          const { content } = activity;
    
          if (content) {
            const { tokenExchangeResource } = content;
            const { uri } = tokenExchangeResource;
    
            if (uri) {
              dispatch({
                type: 'WEB_CHAT/SET_NOTIFICATION',
                payload: {
                  data: { content },
                  id: 'signin',
                  level: 'info',
                  message: 'Please sign in to the app.'
                }
              });
    
              return false;
            }
          }
        }
    
        return next(action);
      }),
    []
  );

  const toastMiddleware = () => next => ({ notification, ...otherArgs }) => {
    const { id } = notification;
    if (id === 'signin') {
      return <BotSignInToast notification={notification} context={props.context} scopeUri={props.botScopeUri}/>;
    }
    else if (id === 'traditionalbotauthentication') {
      return <TraditionalBotAuthenticationToast notification={notification} />;
    }
    return next({ notification, ...otherArgs });
  };

  const handleClick = () => {
    setIsOpen((old) => {
      // To stop refreshing ReactWebChat, change visibility after initialization
      return old == 0 ? 1 : (old == 1 ? -1 : 1);
    });
  };

  return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <button
              className = { styles.botButton }
              type="button"
              ref={ref}
              onClick={handleClick}
            >
              <Icon iconName="Robot" />
            </button>
          )}
        </Reference>
        {isOpen != 0 ? (
          <Popper placement="right">
            {({ ref, style, placement, arrowProps }) => (
              <div ref={ref} style={style} data-placement={placement}>
                <div style={{ visibility: isOpen == 1 ? "visible" : "hidden" }}>
                <ReactWebChat
                  className = { styles.BotFrameworkChatPopupApplicationChat }
                  directLine={directLine}
                  styleOptions={styleSetOptions}
                  toastMiddleware={toastMiddleware}
                  store={store}
                />
                </div>
                <div ref={arrowProps.ref} style={arrowProps.style} />
              </div>
            )}
          </Popper>
        ) : null}
      </Manager>
  );
};
