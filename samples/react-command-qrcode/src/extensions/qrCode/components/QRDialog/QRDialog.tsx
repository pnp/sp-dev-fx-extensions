import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from './QRDialog.module.scss';
import { IQRDialogContentProps, IQRDialogContentState } from './QRDialog.types';
import { QRCanvas } from 'qrcanvas-react';
import * as strings from 'QrCodeCommandSetStrings';

/**
 * Renders an SVG QR code for the URL specified
 */
class QRDialogContent extends
  React.Component<IQRDialogContentProps, IQRDialogContentState> {

  /**
   * The QR canvas element which will produce the SVG
   */
  private _canvas: QRCanvas = undefined;

  /**
   * The hidden download link
   */
  private _qrDownload: HTMLAnchorElement = undefined;

  private _timer: number = undefined;

  public componentDidMount(): void {
    // Start a timer to make sure the items are rendered before copying them
    this._timer = setTimeout(() => {
      // If the elements are ready...
      if (this._canvas && this._qrDownload) {
        // Get the dataURI
        const dataUri: string = this._getImageUri();

        // If there is a data URI
        if (dataUri) {
          // Copy the image
          this._copyImage(dataUri);

          // Stop the timer!
          clearTimeout(this._timer);
        }
      }
    }, 100);
  }

  /**
   * Renders the content of the dialog
   */
  public render(): JSX.Element {
    const { absolutePath } = this.props;
    return (
      <div className={styles.qrDialog}>
        <Callout
          isBeakVisible={false}
          role={'presentation'}
          gapSpace={0}
          target={this.props.domElement}
          hidden={false}
          setInitialFocus={true}
          onDismiss={this._onDismiss.bind(this)}>
          <div className={styles.qrDialogContentContainer}>
            <div>
              <div className={styles.qrButtonsRight}>
                <IconButton
                  ariaLabel={strings.CloseLabel}
                  title={strings.CloseLabel}
                  iconProps={{ iconName: 'Cancel' }}
                  className={styles.qrButton}
                  onClick={this._onDismiss.bind(this)}
                />
              </div>
            </div>
            <div className={styles.iconContainer} ><Icon iconName="CheckMark" className={styles.icon} /></div>
            <div className={styles.fileName}>{strings.FileNameLabel.replace('{0}', this.props.fileName)}</div>
            <div className={styles.shareContainer}>
              <QRCanvas
                ref={(elm) => { this._canvas = elm; }}
                options={{
                  correctLevel: "H",
                  cellSize: 8,
                  data: absolutePath,
                }} />
            </div>
            <a
              style={{ display: 'none' }}
              ref={(elm) => { this._qrDownload = elm; }}
              href=""
              download="qrcode.png">{strings.DownloadLabel}</a>

            <div className={styles.dismissMainTargets}>
              <div className={styles.dismissTargets}>
                <ul className={styles.dismissTargetsItems}>
                  <li className={styles.dismissTargetsItem}>
                    <button className={styles.dismissTargetsTarget}
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => this.btnCopyClicked(event)}
                    >
                      <div className={styles.dismissTargetsItemImage}>
                        <Icon iconName="Copy" className={styles.dismissTargetsIcon} />
                      </div>
                      <div className={styles.dismissTargetsItemText}>{strings.CopyBtnLabel}</div>
                    </button>
                  </li>
                  <li className={styles.dismissTargetsItem}>
                    <button className={styles.dismissTargetsTarget}
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => this.btnDownloadClicked(event)}
                    >
                      <div className={styles.dismissTargetsItemImage}>
                        <Icon iconName="Download" className={styles.dismissTargetsIcon} />
                      </div>
                      <div className={styles.dismissTargetsItemText}>{strings.DownloadLabel}</div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Callout>
      </div>
    );
  }

  /**
   * Called when dialog is dismissed
   */
  private _onDismiss = (_ev: any) => {
    this.props.onDismiss();
  }

  /**
   * Called when download button is clicked
   * Generates a downloadable PNG file and launches the download process
   */
  private btnDownloadClicked = (_event: React.MouseEvent<HTMLButtonElement>): void => {
    // Generate a data URI for a PNG equivalent of the SVG
    const dataUri = this._getImageUri();

    // Change the download link to point to the new data URI
    this._qrDownload.href = dataUri;

    // Trigger a download
    this._qrDownload.click();
  }

  private btnCopyClicked = (_event: React.MouseEvent<HTMLButtonElement>): void => {
    // Generate a data URI for a PNG equivalent of the SVG
    const dataUri: string = this._getImageUri();
    this._copyImage(dataUri);
  }

  /**
   * Copies an image to the clipboard
   * @param url The URL of the image to copy
   */
  private _copyImage(url: string) {
    console.log("Copying!");

    // Create a temporary editable element
    var el: HTMLDivElement = document.createElement('div');
    el.contentEditable = 'true';
    document.body.appendChild(el);

    // Insert QR code image in the element
    var img: HTMLImageElement = document.createElement('img');
    img.src = url;
    el.appendChild(img);

    // Select the content of the editable element
    this._selectText(el);

    // Copy to clipboard
    document.execCommand('copy');

    // De-selected
    window.getSelection().removeAllRanges();

    // Remove the temporary elements
    el.parentElement.removeChild(el);
  }

  /**
   * Selects the content of an HTML element for copying
   * @param element The element containing the item to select
   */
  private _selectText(element: Node) {
    const selection: Selection = window.getSelection();
    const range: Range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Generates a dataURI for the SVG contained within the canvas
   */
  private _getImageUri(): string {
    // Get the canvas where the QR code was produced
    const canvas: HTMLCanvasElement = this._canvas["canvas"];

    // Generate a data URI for a PNG equivalent of the SVG
    const dataUri = canvas.toDataURL("image/png");
    return dataUri;
  }
}

/**
 * QR Dialog
 */
export class QRDialog extends BaseDialog {
  public fileName: string;
  public absolutePath: string;

  /**
   * Configures a non-blocking dialog
   */
  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

  /**
   * Renders the QR dialog
   */
  public render(): void {
    this.domElement.className = "nooverlay";
    ReactDOM.render(<QRDialogContent
      fileName={this.fileName}
      absolutePath={this.absolutePath}
      domElement={document.activeElement.parentElement}
      onDismiss={this.onDismiss.bind(this)}
    />, this.domElement);
  }

  /**
   * Closes the dialog when dismissed
   */
  private onDismiss() {
    this.close();
    ReactDOM.unmountComponentAtNode(this.domElement);
  }
}
