import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  RowAccessor,
  IListViewCommandSetRefreshEventParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'emailUrlStrings';
import EmailUrlComponent from '../../components/emailurlcomponent';

export interface IEmailUrlCommandSetProperties {
  
}

const LOG_SOURCE: string = 'EmailUrlCommandSet';

export default class EmailUrlCommandSet
  extends BaseListViewCommandSet<IEmailUrlCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized EmailUrlCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onRefreshCommand(event: IListViewCommandSetRefreshEventParameters): void {
    event.visible = false; // assume false by default

    if (event.selectedRows.length === 1) {
      event.visible = true;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {

    switch (event.commandId) {
      case 'EmailLink':
        this._showItemUrlDialog(event.selectedRows[0]);
        break;
      default:
        throw new Error('Unknown command');
    }
    
  }

  private _showItemUrlDialog(row: RowAccessor) {

    const div = document.createElement('div');

    const dialog: React.ReactElement<{}> = React.createElement(EmailUrlComponent, {
      siteUrl: this.context.pageContext.web.absoluteUrl,
      listTitle: this.context.pageContext.list.title,
      itemId: row.getValueByName("ID"),
      fileName: row.getValueByName("FileName"),
      fileRelativePath: row.getValueByName("FileRef"),
      spHttpClient: this.context.spHttpClient
    });

    ReactDOM.render(dialog, div);

  }
}