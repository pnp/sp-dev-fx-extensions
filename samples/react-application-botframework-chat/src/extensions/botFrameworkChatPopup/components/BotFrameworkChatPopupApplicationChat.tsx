import styles from './BotFrameworkChatPopupApplicationChat.module.scss';
import * as React from 'react';
import ReactWebChat from 'botframework-webchat';
import { DirectLine } from 'botframework-directlinejs';
import { Popper, Manager, Reference } from 'react-popper';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IBotFrameworkChatPopupApplicationChatProps } from "./IBotFrameworkChatPopupApplicationChatProps";

export interface IBotFrameworkChatPopupApplicationChatState {
  directLine: any;
  styleSetOptions: any;
  isOpen: any;
}

export default class BotFrameworkChatPopupApplicationChat extends React.Component< IBotFrameworkChatPopupApplicationChatProps, IBotFrameworkChatPopupApplicationChatState> {
  constructor(props) {
    super(props);
    const styleOptions = {
      hideScrollToEndButton: false,
      rootHeight: '50%',
      rootWidth: '50%'
    };
    this.state = {
      directLine: new DirectLine({
        secret: this.props.directLineSecret
      }),
      styleSetOptions: styleOptions,
      isOpen: false
    };
  }
       
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
                <Icon iconName="Robot" className="ms-Icon" />
              </button>
            )}
          </Reference>
          {this.state.isOpen ? (
            <Popper placement="right">
              {({ ref, style, placement, arrowProps }) => (
                <div ref={ref} style={style} data-placement={placement}>
                  <ReactWebChat className = { styles.BotFrameworkChatPopupApplicationChat } directLine={ this.state.directLine } styleOptions={ this.state.styleSetOptions }/>
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
  }
}