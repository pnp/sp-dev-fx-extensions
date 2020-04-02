import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'AttachmentCountFieldCustomizerStrings';
import AttachmentCount, { IAttachmentCountProps } from './components/AttachmentCount';
import { sp } from "@pnp/sp/presets/all";

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAttachmentCountFieldCustomizerProperties {
  // This is an example; replace with your own property
  showTotal: boolean;
  showAttachmentList: boolean;
  showNoAttachmentMsg: boolean;
}

const LOG_SOURCE: string = 'AttachmentCountFieldCustomizer';

export default class AttachmentCountFieldCustomizer
  extends BaseFieldCustomizer<IAttachmentCountFieldCustomizerProperties> {

  @override
  public async onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated AttachmentCountFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "AttachmentCountFieldCustomizer" and "${strings.Title}"`);
    await super.onInit();
    sp.setup(this.context);
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    const fieldValue: string = event.fieldValue;
    let itemid: number = 0, listid: string = "";
    if (fieldValue == "1") {
      itemid = event.listItem.getValueByName("ID");
      listid = this.context.pageContext.legacyPageContext.listId;
    }
    // Use this method to perform your custom cell rendering.
    //const text: string = `${this.properties.sampleText}: ${event.fieldValue}`;

    const attachmentCount: React.ReactElement<{}> =
      React.createElement(AttachmentCount,
        {
          listid, 
          itemid,
          showTotal: this.properties.showTotal, 
          showAttachmentList: this.properties.showAttachmentList,
          showNoAttachmentMsg: this.properties.showNoAttachmentMsg
        } as IAttachmentCountProps);

    ReactDOM.render(attachmentCount, event.domElement);
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
