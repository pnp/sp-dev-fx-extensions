import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import JustALinkComponent from './components/JustALinkComponent';

export interface IJustALinkCommandSetProperties {
}

const LOG_SOURCE: string = 'JustALinkCommandSet';

export default class JustALinkCommandSet extends BaseListViewCommandSet<IJustALinkCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized JustALinkCommandSet');
    
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      compareOneCommand.visible = event.selectedRows.length === 1;      
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        let siteUrl = this.context.pageContext.site.absoluteUrl;
        let endIndex = siteUrl.lastIndexOf('/sites/');
        let rootSiteUrl = siteUrl.substring(0, endIndex);

        let relativeUrl = event.selectedRows[0].getValueByName('FileRef');
        let fileName = event.selectedRows[0].getValueByName('FileLeafRef');
        let absoluteUrl = `${rootSiteUrl}${relativeUrl}`;

        const callout: JustALinkComponent = new JustALinkComponent();
        callout.fileName = fileName;
        callout.absolutePath = absoluteUrl;        
        callout.show();
        break;      
      default:
        throw new Error('Unknown command');
    }
  }
}
