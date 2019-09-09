import * as React from 'react';
import styles from './BotFrameworkChatPopupApplicationChat.module.scss';
import { IBotFrameworkChatPopupApplicationChatProps } from './IBotFrameworkChatPopupApplicationChatProps';
import { escape } from '@microsoft/sp-lodash-subset';
import ReactWebChat from 'botframework-webchat';
import styleSetOptions from 'botframework-webchat';
import { DirectLine } from 'botframework-directlinejs';
import { ActionButton }  from "office-ui-fabric-react/lib/Button";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { Layer, LayerHost } from 'office-ui-fabric-react/lib/Layer';
import { getId, css } from 'office-ui-fabric-react/lib/Utilities';
import { IToggleStyles } from 'office-ui-fabric-react/lib/Toggle';
import { IStyleSet } from 'office-ui-fabric-react/lib/Styling';
import { AnimationClassNames, mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { CSSTransitionGroup } from 'react-transition-group';
import { DefaultButton, PrimaryButton, Stack, IStackTokens } from 'office-ui-fabric-react';


const toggleStyles: Partial<IStyleSet<IToggleStyles>> = {
    root: { margin: '10px 0' }
};
const rootClass = mergeStyles({
    selectors: { p: { marginTop: 30 } }
});

export interface IBotFrameworkChatPopupApplicationChatState {
  directLine: any;
  showPanel: any;
  isBotInitializing: any;
  showLayer: boolean;
  showLayerNoId: boolean;
  showHost: boolean;
  //styleSetOptions: any;
}

const stackTokens: IStackTokens = { childrenGap: 40 };

export default class BotFrameworkChatPopupApplicationChat extends React.Component<IBotFrameworkChatPopupApplicationChatProps, IBotFrameworkChatPopupApplicationChatState> {
  constructor(props: IBotFrameworkChatPopupApplicationChatProps) {
    super(props);
    this._openBot = this._openBot.bind(this);
    const { disabled, checked } = props;
    /*
    const styleOptions = {
      backgroundColor: this.props.backgroundColor,
      botAvatarImage: this.props.botAvatarImage,
      userAvatarImage: this.props.userAvatarImage,
      hideUploadButton: this.props.hideUploadButton,
      sendBoxBackground: this.props.sendBoxBackground,
      sendBoxTextColor: this.props.sendBoxTextColor,
      bubbleBackground: this.props.bubbleBackground,
      bubbleTextColor: this.props.bubbleTextColor,
      bubbleFromUserTextColor: this.props.bubbleFromUserTextColor,
      bubbleFromUserBackground: this.props.bubbleFromUserBackground,
      userAvatarInitials: this.props.userAvatarInitials,
      botAvatarInitials: this.props.botAvatarInitials
      };
      */
    this.state = {
      directLine: new DirectLine({
        secret: 'MC9aD0sY-1E.UtRGoM3hCsAvCWLxAgaeE7Fl8d-0-luWcFr69h4DWyk'
      }),
      showPanel: false,
      isBotInitializing: false,
      showLayer: false,
      showLayerNoId: false,
      showHost: true

      //styleSetOptions: styleOptions
    };
    
  }
  private _layerHostId: string = getId('layerhost');

  private show () {
    //this.setState({ showLayer: checked });

    this.setState(prevState => ({
      showPanel: !prevState.showPanel
    }));
  }
  private _alertClicked(): void {
    alert('Clicked');
  }

    public render(): React.ReactElement<IBotFrameworkChatPopupApplicationChatProps> {

      return (
        <Stack horizontal tokens={stackTokens}>
          <DefaultButton text="Standard" onClick={this._alertClicked} allowDisabledFocus disabled={this.props.disabled} checked={this.props.checked} />
          <PrimaryButton text="Primary" onClick={this._alertClicked} allowDisabledFocus disabled={this.props.disabled} checked={this.props.checked} />
        </Stack>
      );

      /*
        //<ReactWebChat directLine={this.state.directLine} styleOptions={this.state.styleSetOptions} /> 
        const { showLayer, showLayerNoId, showHost } = this.state;
        const content = <div className={styles.BotFrameworkChatPopupApplicationChat} style={{ height: 700 }}>
                <ReactWebChat directLine={this.state.directLine}/>
            </div>;

        return (
          <div>
            <button className="display" onClick={this.show}>
              List
            </button>
            <CSSTransitionGroup transitionName="example" transitionEnterTimeout={700} transitionLeaveTimeout={700}>
              <ReactWebChat directLine={this.state.directLine} />
          </CSSTransitionGroup>
        </div>
        );
        */
    }

    private _log(text: string): () => void {
        return (): void => {
          console.log(text);
        };
      }
    
      private _onChangeCheckbox = (ev: React.FormEvent<HTMLElement | HTMLInputElement>, checked: boolean): void => {
        this.setState({ showLayer: checked });
      };
    
      private _onChangeCheckboxNoId = (ev: React.FormEvent<HTMLElement | HTMLInputElement>, checked: boolean): void => {
        this.setState({ showLayerNoId: checked });
      };
    
      private _onChangeToggle = (ev: React.MouseEvent<HTMLElement>, checked: boolean): void => {
        this.setState({ showHost: checked });
      };

     private async _openBot()  {

        this.setState({
            isBotInitializing :true,
            showPanel: true,
        });

        // Show the panel only if the event has been well received by the bot (RxJs format)
        this.setState({
            isBotInitializing :false
        });
    }
}
