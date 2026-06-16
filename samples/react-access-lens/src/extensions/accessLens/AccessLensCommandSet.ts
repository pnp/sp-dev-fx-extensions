import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { spfi, SPFx } from '@pnp/sp';
import type { SPFI } from '@pnp/sp';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AccessLensPanel, type IAccessLensPanelProps } from './components/AccessLensPanel/AccessLensPanel';
import type { UserInfo } from './models/access-lens-context';

const LOG_SOURCE: string = 'AccessLensCommandSet';

export default class AccessLensCommandSet extends BaseListViewCommandSet<Record<string, never>> {

  private _sp!: SPFI;
  private _panelContainer: HTMLDivElement | undefined;
  private _currentLibraryId: string | undefined;
  private _isPanelOpen: boolean = false;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized AccessLensCommandSet');
    console.log(`[${LOG_SOURCE}] onInit called, list id:`, this.context.pageContext.list?.id?.toString());

    this._sp = spfi().using(SPFx(this.context));
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    // Set initial command visibility (state-change event may not fire on load)
    const inspectAccessCommand: Command = this.tryGetCommand('INSPECT_ACCESS');
    if (inspectAccessCommand) {
      inspectAccessCommand.visible = !!this.context.pageContext.list?.id;
      console.log(`[${LOG_SOURCE}] Initial command visible:`, inspectAccessCommand.visible);
    } else {
      console.warn(`[${LOG_SOURCE}] INSPECT_ACCESS command not found in onInit`);
    }

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'INSPECT_ACCESS': {
        Log.info(LOG_SOURCE, 'Inspect Access command executed');
        const listId = this.context.pageContext.list?.id?.toString();
        if (!listId) {
          Log.warn(LOG_SOURCE, 'No list context available');
          return;
        }

        // If panel is already open for the same library, do not reload
        if (this._isPanelOpen && this._currentLibraryId === listId) {
          return;
        }

        this._currentLibraryId = listId;
        this._openPanel(listId);
        break;
      }
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (_args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const inspectAccessCommand: Command = this.tryGetCommand('INSPECT_ACCESS');
    if (inspectAccessCommand) {
      // Visible when a list context exists (lightweight check, no API calls)
      inspectAccessCommand.visible = !!this.context.pageContext.list?.id;
    }

    this.raiseOnChange();
  }

  private _openPanel(listId: string): void {
    if (!this._panelContainer) {
      this._panelContainer = document.createElement('div');
      document.body.appendChild(this._panelContainer);
    }

    const currentUser: UserInfo = {
      displayName: this.context.pageContext.user?.displayName,
      loginName: this.context.pageContext.user?.loginName,
      email: this.context.pageContext.user?.email,
    };

    const isDebugMode =
      new URLSearchParams(window.location.search).get('debug') === 'true';

    const props: IAccessLensPanelProps = {
      sp: this._sp,
      listId,
      webServerRelativeUrl: this.context.pageContext.web.serverRelativeUrl,
      siteServerRelativeUrl: this.context.pageContext.site.serverRelativeUrl,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
      currentUser,
      isDebugMode,
      onDismiss: this._closePanel,
    };

    this._isPanelOpen = true;
    const element = React.createElement(AccessLensPanel, props);
    ReactDOM.render(element, this._panelContainer);
  }

  private _closePanel = (): void => {
    if (this._panelContainer) {
      ReactDOM.unmountComponentAtNode(this._panelContainer);
    }
    this._isPanelOpen = false;
    this._currentLibraryId = undefined;
  }
}
