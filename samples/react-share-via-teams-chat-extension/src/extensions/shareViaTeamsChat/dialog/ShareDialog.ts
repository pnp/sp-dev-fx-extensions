import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  FluentProvider,
  IdPrefixProvider,
  Toaster,
  useToastController,
  webLightTheme
} from '@fluentui/react-components';
import { SharePanel } from '../components/SharePanel';
import type { IShareDialogProps, IShareItem } from '../models/interfaces';

const ID_PREFIX = 'react-share-via-teams-chat-';

type ToastIntent = 'success' | 'error' | 'info' | 'warning';

interface IToastHostProps {
  toasterId: string;
  onReady: (dispatchToast: (content: React.ReactNode, options?: { intent?: ToastIntent }) => void) => void;
}

const ToastHost: React.FC<IToastHostProps> = ({ toasterId, onReady }) => {
  const { dispatchToast } = useToastController(toasterId);

  React.useEffect(() => {
    onReady(dispatchToast);
  }, [dispatchToast, onReady]);

  return React.createElement(Toaster, { toasterId, position: 'top-end' });
};

export class ShareDialog extends BaseDialog {
  private readonly _items: IShareItem[];
  private readonly _toastContainer: HTMLDivElement;
  private readonly _toastHostId: string;
  private readonly _toastRoot: Root;
  private readonly _dialogRoot: Root;
  private _dispatchToast?: (content: React.ReactNode, options?: { intent?: ToastIntent }) => void;
  private readonly _pendingToasts: Array<{ content: React.ReactNode; options?: { intent?: ToastIntent } }> = [];

  public constructor(props: IShareDialogProps) {
    super({ isBlocking: false });
    this._items = props.items;
    this._toastContainer = document.createElement('div');
    this._toastHostId = `${ID_PREFIX}toaster`;
    document.body.appendChild(this._toastContainer);
    this._toastRoot = createRoot(this._toastContainer);
    this._dialogRoot = createRoot(this.domElement);
  }

  private flushPendingToasts(): void {
    while (this._pendingToasts.length > 0 && this._dispatchToast) {
      const pendingToast = this._pendingToasts.shift();
      if (pendingToast) {
        this._dispatchToast(pendingToast.content, pendingToast.options);
      }
    }
  }

  public render(): void {
    const handleDismiss = (): void => {
      this.close().catch(() => {
        // Dialog is being torn down; nothing useful to do with close errors.
      });
    };

    const handleShowToast = (content: React.ReactNode, intent?: ToastIntent): void => {
      const options = intent ? { intent } : undefined;
      if (this._dispatchToast) {
        this._dispatchToast(content, options);
        return;
      }

      this._pendingToasts.push({ content, options });
    };

    this._toastRoot.render(
      React.createElement(
        IdPrefixProvider,
        { value: ID_PREFIX },
        React.createElement(
          FluentProvider,
          { theme: webLightTheme },
          React.createElement(ToastHost, {
            toasterId: this._toastHostId,
            onReady: (dispatchToast) => {
              this._dispatchToast = dispatchToast;
              this.flushPendingToasts();
            }
          })
        )
      )
    );

    this._dialogRoot.render(
      React.createElement(
        IdPrefixProvider,
        { value: ID_PREFIX },
        React.createElement(
          FluentProvider,
          { theme: webLightTheme },
          React.createElement(SharePanel, {
            items: this._items,
            onDismiss: handleDismiss,
            onShowToast: handleShowToast
          })
        )
      )
    );
  }

  protected onAfterClose(): void {
    super.onAfterClose();
    this._dialogRoot.unmount();
    this._toastRoot.unmount();
    this._toastContainer.remove();
  }

  public getConfig(): IDialogConfiguration {
    return { isBlocking: false };
  }
}
