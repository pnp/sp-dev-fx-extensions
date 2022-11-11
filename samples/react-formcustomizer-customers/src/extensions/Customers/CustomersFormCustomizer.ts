import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FormDisplayMode, Log } from '@microsoft/sp-core-library';
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility';

import { FormContainer } from './components/FormContainer';
import { IFormContainerProps } from './components/FormContainer/IFormContainerProps';
import { ConsoleListener, Logger } from '@pnp/logging';
import SharePointService from './services/SharePointService';
import { LogHelper } from './helpers/LogHelper';
import { reject } from 'lodash';
import { IFormData } from './model/IFormData';
import { ICustomer } from './model/ICustomer';
import { initializeIcons } from '@fluentui/font-icons-mdl2';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomersFormCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

const LOG_SOURCE: string = 'FcPlaygroundFormCustomizer';

export default class CustomersFormCustomizer
  extends BaseFormCustomizer<ICustomersFormCustomizerProperties> {

  // Added for the item to show in the form; use with edit and view form
  private _listItem = {} as ICustomer;


  public async onInit(): Promise<void> {
    // Add your custom initialization to this method. The framework will wait
    // for the returned promise to resolve before rendering the form.   
    
    // subscribe a listener
    Logger.subscribe(ConsoleListener(LOG_SOURCE, { warning: '#e36c0b', error: '#a80000' }));
    //Init SharePoint Service
    SharePointService.Init(this.context);

    LogHelper.info("CustomersFormCustomizer", LOG_SOURCE, JSON.stringify(this.properties, undefined, 4));

    if (this.displayMode !== FormDisplayMode.New) {
      // load item to display on the form
      const response: ICustomer = await SharePointService.getCustomer(this.context.itemId, this.context.list.title);

      this._listItem = response;

    }

    //initialize Fluent UI Icons
    initializeIcons();
    
    return Promise.resolve();
  }

  public render(): void {
    // Use this method to perform your custom rendering.
    const FCPlayground: React.ReactElement<{}> =
      React.createElement(FormContainer, {
        context: this.context,
        listGuid: this.context.list.guid,
        itemID: this.context.itemId,
        listItem: this._listItem,
        EditFormUrl: this._getEditFormLink(),
        AddFormUrl: this._getAddFormLink(),
        displayMode: this.displayMode,
        onSave: this._onSave,
        onClose: this._onClose
      } as IFormContainerProps);

    ReactDOM.render(FCPlayground, this.domElement);
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    ReactDOM.unmountComponentAtNode(this.domElement);
    super.onDispose();
  }

  private _onSave = (): void => {

    // You MUST call this.formSaved() after you save the form.
    this.formSaved();
  }

  private _onClose = (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed();
  }

  private _getEditFormLink = (): string => {

    const tenantUri = window.location.protocol + "//" + window.location.host;
    const EditFormUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/SPListForm.aspx?PageType=6&List=${this.context.list.guid.toString()}&ID=${this.context.itemId}&Source=${tenantUri + this.context.list.serverRelativeUrl}/AllItems.aspx?as=json&ContentTypeId=${this.context.contentType.id}&RootFolder=${this.context.list.serverRelativeUrl}`

    return EditFormUrl;

  }

  private _getAddFormLink = (): string => {

    const tenantUri = window.location.protocol + "//" + window.location.host;
    const AddFormUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/SPListForm.aspx?PageType=8&List=${this.context.list.guid.toString()}&Source=${tenantUri + this.context.list.serverRelativeUrl}/AllItems.aspx&RootFolder=${this.context.list.serverRelativeUrl}&Web=${this.context.pageContext.web.id}`

    return AddFormUrl;

  }

}
