import * as React from 'react';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import { MSGraphClient } from '@microsoft/sp-http';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { TextField, PrimaryButton, Icon } from 'office-ui-fabric-react';
import styles from './ThumbnailDialogContent.module.scss';

export interface IThumbnailDialogContentProps {
  data: any;
  context: ListViewCommandSetContext;
  close: () => void;
}

export interface IThumbnailDialogContentState {
  imageSize: string;
  imageUrl: string;
  showLinkCopied: boolean;
}

export class ThumbnailDialogContent extends React.Component<IThumbnailDialogContentProps, IThumbnailDialogContentState> {
  constructor(props: IThumbnailDialogContentProps) {
    super(props);

    this.state = {
      imageSize: '',
      imageUrl: '',
      showLinkCopied: false
    };

    this._getThumbnailUrl = this._getThumbnailUrl.bind(this);
    this._copyThumbnailUrl = this._copyThumbnailUrl.bind(this);
  }

  /**
   * Get the Thumbnail Image URL for the selected size using Graph API
   */
  private _getThumbnailUrl() {
    this.props.context.msGraphClientFactory
      .getClient()
      .then((_msGraphClient: MSGraphClient): void => {
        _msGraphClient.api(`/sites/${this.props.data.siteId}/lists/${this.props.data.listId}/items/${this.props.data.itemId}/driveItem/thumbnails/0/${this.state.imageSize}`)
          .get((_error, response: any) => {
            console.log(response);
            this.setState({ imageUrl: response.url });
          });
      });
  }

  /**
   * Copy the Thumbnail Image URL for selected size
   */
  private _copyThumbnailUrl(): void {
    var el = document.createElement('textarea');
    el.value = this.state.imageUrl;
    document.body.appendChild(el);
    el.select();

    document.execCommand('copy');
    document.body.removeChild(el);
    this.setState({ showLinkCopied: true });
  }

  public render(): React.ReactElement<IThumbnailDialogContentProps> {
    return (
      <div className={styles.ThumbnailDialogContent}>
        <DialogContent
          title='Thumbnail URL'
          className={styles.dialogHeading}
          showCloseButton={true}
          onDismiss={this.props.close}
        >
          {this.state.showLinkCopied &&
            <div>
              <div className={styles.iconContainer} ><Icon iconName="CheckMark" className={styles.icon} /></div>
              <div className={styles.linkCopied} >Link Copied</div>
            </div>
          }
          <br />
          <Dropdown
            placeHolder="Select Size"
            className={styles.dropdown}
            selectedKey={this.state.imageSize}
            options={[
              { key: 'small', text: 'Small' },
              { key: 'medium', text: 'Medium' },
              { key: 'large', text: 'Large' }
            ]}
            onChange={(_event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
              this.setState({ imageSize: option.key.toString(), showLinkCopied: false }, () => {
                this._getThumbnailUrl();
              });
            }}
          />
          <br />
          <div className={styles.linkRow}>
            <div className={styles.linkTextfield}>
              <TextField title="Thumbnail URL"
                value={this.state.imageUrl}
                readOnly={true}
              />
            </div>
            <div className={styles.linkCopyButton}>
              <PrimaryButton text="Copy"
                onClick={this._copyThumbnailUrl}
              />
            </div>
          </div>
        </DialogContent>
      </div >
    );
  }
}