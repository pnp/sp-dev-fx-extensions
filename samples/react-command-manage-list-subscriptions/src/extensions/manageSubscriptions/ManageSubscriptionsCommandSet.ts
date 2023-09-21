import * as React from 'react';
//import * as ReactDom from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { SubscriptionService } from './services/SubscriptionService';
import SubscriptionPanel from './components/SubscriptionPanel';
import * as ReactDOM from 'react-dom';

//import { Dialog } from '@microsoft/sp-dialog';


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IManageSubscriptionsCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

export interface SubscriptionModel{
  id:string;
  clientState:string;
  expirationDateTime:string;
  notificationUrl:string;
  resource:string;
}

const LOG_SOURCE: string = 'ManageSubscriptionsCommandSet';

export default class ManageSubscriptionsCommandSet extends BaseListViewCommandSet<IManageSubscriptionsCommandSetProperties> {

  private displayCommand: boolean = false;
  private restService : SubscriptionService = new SubscriptionService();
  private subscriptions : SubscriptionModel[];
  private panelContainer: HTMLDivElement;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ManageSubscriptionsCommandSet');

    // initial state of the command's visibility
    const commandManageSusbcriptions: Command = this.tryGetCommand('MANAGESUBSCRIPTION');
    commandManageSusbcriptions.visible = false;
    this.subscriptions = await this.restService.GetSubscriptions(this.context,this.context.pageContext.site.absoluteUrl, this.context.pageContext.list?.id.toString())
    if(this.subscriptions.length > 0){
      commandManageSusbcriptions.visible = true;
      this.panelContainer = document.body.appendChild(document.createElement("div"));
    }
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'MANAGESUBSCRIPTION':
        this._renderPanelContainer(true);
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const commandManageSusbcriptions: Command = this.tryGetCommand('MANAGESUBSCRIPTION');
    if (commandManageSusbcriptions) {
      //To show the command on the list, no selection is required
      commandManageSusbcriptions.visible = this.context.listView.selectedRows?.length === 0 && this.displayCommand;
    }
    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }

  private _closePanelContainer = () => {
    this._renderPanelContainer(false);
  }

  private _renderPanelContainer(isPanelDisplayed:boolean){
    const element: React.ReactElement<any> = React.createElement(
      SubscriptionPanel,
      {
        _context:this.context,
        subscriptions:this.subscriptions,
        selectedSite: this.context.pageContext.site.absoluteUrl,
        selectedListID : this.context.pageContext.list?.id.toString(),
        closePanel: this._closePanelContainer,
        showPanel: isPanelDisplayed
      }
    );
    ReactDOM.render(element, this.panelContainer);
  }
}
