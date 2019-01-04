import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog } from '@microsoft/sp-dialog';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from './JustALink.module.scss';

interface IJustALinkContentProps {
    fileName: string;
    absolutePath: string;
    domElement: any;
    onDismiss: () => void;
}

interface IJustALinkContentState {
}

export default class JustALinkComponent extends BaseDialog {
    public fileName: string;
    public absolutePath: string;
  
    public render(): void {        
      ReactDOM.render(<JustALinkContent
        fileName={ this.fileName }
        absolutePath={ this.absolutePath }
        domElement={ document.activeElement.parentElement }
        onDismiss={this.onDismiss.bind(this)}
      />, this.domElement);
    }

    private onDismiss()
    {
        ReactDOM.unmountComponentAtNode(this.domElement);
    }
}

class JustALinkContent extends 
  React.Component<IJustALinkContentProps, IJustALinkContentState> {

    constructor(props : IJustALinkContentProps) {
      super(props);

      this.state = {
      };
    }

    public render(): JSX.Element {
      return (
          <div>
            <Callout
                className="ms-CalloutExample-callout"
                ariaLabelledBy={'callout-label-1'}
                ariaDescribedBy={'callout-description-1'}
                role={'alertdialog'}                
                gapSpace={0}
                target={this.props.domElement}
                hidden={false}
                setInitialFocus={true}                
                onDismiss={this.onDismiss.bind(this)}>
                <div className={styles.justALinkContentContainer}>
                    <div className={styles.iconContainer} ><Icon iconName="CheckMark" className={styles.icon} /></div>
                    <div className={styles.fileName}>Link to: '{this.props.fileName}' copied</div>
                    <div className={styles.shareContainer}>
                        <TextField className={styles.filePathTextBox} value={this.props.absolutePath} />
                        <PrimaryButton text="Copy" onClick={this.btnCopyCLicked.bind(this)}
                        />
                    </div>                    
                </div>
            </Callout>
          </div>
      );
    }

    private onDismiss(ev: any)
    {
        this.props.onDismiss();
    }

    private btnCopyCLicked(): void {
        var el = document.createElement('textarea');
        el.value = this.props.absolutePath;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();

        document.execCommand('copy');
        document.body.removeChild(el);
    }
}