import styles from './BotFrameworkChatPopupApplicationChat.module.scss';
import * as React from 'react';
import ReactWebChat from 'botframework-webchat';
import { DirectLine } from 'botframework-directlinejs';
import { Popper, Manager, Reference } from 'react-popper';

export interface IBotFrameworkChatPopupApplicationChatState {
  directLine: any;
  styleSetOptions: any;
  isOpen: any;
}

export default class BotFrameworkChatPopupApplicationChat extends React.Component<{}, IBotFrameworkChatPopupApplicationChatState> {
  private styleSetOptions = {
    hideScrollToEndButton: false,
    rootHeight: '50%',
    rootWidth: '50%'
  }
  public state = {
    directLine: new DirectLine({
      secret: 'MC9aD0sY-1E.UtRGoM3hCsAvCWLxAgaeE7Fl8d-0-luWcFr69h4DWyk'
    }),
    styleSetOptions: this.styleSetOptions,
    isOpen: false
  };

/*
?loadSPFX=true&debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fmanifests.js&customActions=%7B"f50b07b5-76a5-4e80-9cab-b4ee9a591bf6"%3A%7B"location"%3A"ClientSideExtension.ApplicationCustomizer"%7D%7D
https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js#L378


-- WORKING:
<div className={ styles.banner }>
        <DefaultButton className={ styles.botButton } secondaryText="Opens the Sample Panel" onClick={this._showPanel} text="Open Chat" />
        <Panel
                    isOpen={ this.state.isCalloutVisible }
                    type={ PanelType.medium}
                    isLightDismiss={ true }
                    onDismiss={ () => this.setState({ isCalloutVisible: false }) }
        >
        
          <div > 
            <ReactWebChat focusSendBoxContext={ true } directLine={this.state.directLine} resize="detect" styleOptions={this.state.styleSetOptions}/>
          </div>
        </Panel>
      </div>
      -------------
*/
       
 
  public render() {
    return (
        <Manager>
          <Reference>
            {({ ref }) => (
              <button
                className = { styles.botButton }
                type="button"
                ref={ref}
                onClick={this.handleClick}
              >
                🤖
              </button>
            )}
          </Reference>
          {this.state.isOpen ? (
            <Popper placement="right">
              {({ ref, style, placement, arrowProps }) => (
                <div ref={ref} style={style} data-placement={placement}>
                  <ReactWebChat className = {styles.BotFrameworkChatPopupApplicationChat } directLine={this.state.directLine} styleOptions={this.state.styleSetOptions}/>
                  <div ref={arrowProps.ref} style={arrowProps.style} />
                </div>
              )}
            </Popper>
          ) : null}
        </Manager>
    );
  }

  private handleClick = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
}