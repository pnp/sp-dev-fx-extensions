import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import styles from './ArchiveDialog.module.scss';

export interface IArchiveDialogContentProps {
  itemCount: number;
  onArchive: () =>void;
  
}

export default class ArchiveDialog extends BaseDialog {
  public itemCount: number;
  public onArchive: () => void;
  
  constructor(props: IArchiveDialogContentProps) {
    super();
    this.itemCount = props.itemCount;
    this.onArchive = props.onArchive;
  }

  public render(): void {
    const itemText = this.itemCount === 1 ? 'item' : 'items';
    
    this.domElement.innerHTML = `
      <div class="${styles.archiveDialogContainer}">
        <div class="${styles.archiveDialogHeader}">
          <h2 class="${styles.archiveDialogTitle}">Archive Documents</h2>
        </div>
        <div class="${styles.archiveDialogContent}">
          <p class="${styles.archiveDialogText}">What would you like to do with the selected ${this.itemCount} ${itemText}?</p>
        </div>
        <div class="${styles.archiveDialogActions}">
          <button class="${styles.archiveDialogButtonPrimary}" id="archiveBtn">
            Archive Documents
          </button>
          <button class="${styles.archiveDialogButtonDefault}" id="cancelBtn">
            Cancel
          </button>
        </div>
      </div>
    `;

    this._setButtonEventHandlers();
  }

  private _setButtonEventHandlers(): void {
    const archiveBtn = this.domElement.querySelector('#archiveBtn') as HTMLButtonElement;
    
    const cancelBtn = this.domElement.querySelector('#cancelBtn') as HTMLButtonElement;

    if (archiveBtn) {
      archiveBtn.onclick = async () => {
        this.onArchive();
        this.close().catch(() => { /* ignore close errors */ });
      };
    }
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        this.close().catch(() => { /* ignore close errors */ });
      };
    }
  }

  protected getConfig(): IDialogConfiguration {
    return {
      isBlocking: true
    };
  }
}
