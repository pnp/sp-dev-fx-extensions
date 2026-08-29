import { BaseDialog } from '@microsoft/sp-dialog';

export interface IIFrameDialogProps {
  url: string;
  title?: string;
  /**
   * When provided, an "Edit URL" button is shown in the header. It is invoked
   * (after the dialog has closed itself) so the caller can prompt for a new
   * URL without a second dialog fighting this one for the modal slot.
   */
  onEditRequested?: () => void;
}

const STYLE_ELEMENT_ID: string = 'iframeDialogStyles';

export default class IFrameDialog extends BaseDialog {
  private _url: string;
  private _title: string;
  private _onEditRequested?: () => void;

  constructor(props: IIFrameDialogProps) {
    super({ isBlocking: false });
    this._url = props.url;
    this._title = props.title || 'Dashboard';
    this._onEditRequested = props.onEditRequested;
  }

  public render(): void {
    this._ensureStyles();

    this.domElement.innerHTML = `
      <div class="iframeDialog-container">
        <div class="iframeDialog-header">
          <span class="iframeDialog-title"></span>
          <div class="iframeDialog-headerActions">
            ${this._onEditRequested ? '<button type="button" class="iframeDialog-edit">Edit URL</button>' : ''}
            <button type="button" class="iframeDialog-close" aria-label="Close dialog">&times;</button>
          </div>
        </div>
        <div class="iframeDialog-body">
          <iframe class="iframeDialog-frame" title="" frameborder="0"></iframe>
        </div>
      </div>
    `;

    const titleEl: HTMLElement | null = this.domElement.querySelector('.iframeDialog-title');
    if (titleEl) {
      titleEl.textContent = this._title;
    }

    const iframeEl: HTMLIFrameElement | null = this.domElement.querySelector('.iframeDialog-frame');
    if (iframeEl) {
      iframeEl.title = this._title;
      iframeEl.src = this._url;
    }

    const closeButton: HTMLElement | null = this.domElement.querySelector('.iframeDialog-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close().catch(() => {
          /* handle error */
        });
      });
    }

    const editButton: HTMLElement | null = this.domElement.querySelector('.iframeDialog-edit');
    if (editButton && this._onEditRequested) {
      const onEditRequested: () => void = this._onEditRequested;
      editButton.addEventListener('click', () => {
        this.close().then(onEditRequested).catch(() => {
          /* handle error */
        });
      });
    }
  }

  protected onAfterClose(): void {
    super.onAfterClose();
    this.domElement.innerHTML = '';
  }

  private _ensureStyles(): void {
    if (document.getElementById(STYLE_ELEMENT_ID)) {
      return;
    }

    const style: HTMLStyleElement = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = `
      .iframeDialog-container {
        display: flex;
        flex-direction: column;
        width: 90vw;
        height: 85vh;
        max-width: 1200px;
        max-height: 800px;
      }
      .iframeDialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #edebe9;
      }
      .iframeDialog-title {
        font-size: 18px;
        font-weight: 600;
      }
      .iframeDialog-headerActions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .iframeDialog-edit {
        background: transparent;
        border: 1px solid #8a8886;
        border-radius: 2px;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        padding: 6px 10px;
        color: #323130;
      }
      .iframeDialog-edit:hover {
        background: #f3f2f1;
      }
      .iframeDialog-close {
        background: transparent;
        border: none;
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
        color: #605e5c;
      }
      .iframeDialog-close:hover {
        color: #201f1e;
      }
      .iframeDialog-body {
        flex: 1;
        min-height: 0;
      }
      .iframeDialog-frame {
        width: 100%;
        height: 100%;
        border: none;
      }
    `;
    document.head.appendChild(style);
  }
}
