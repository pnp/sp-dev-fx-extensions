import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import {
  BaseFieldCustomizer,
  type IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'DocumentReportingFieldCustomizerStrings';
import DocumentReporting, { IDocumentReportingProps } from './components/DocumentReporting';
import { spfi, SPFx } from '@pnp/sp';
import SPService from '../../services/SPService';
import AppInsightService from '../../services/AppInsightService';


/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentReportingFieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText: string;

}

const LOG_SOURCE: string = 'DocumentReportingFieldCustomizer';

export default class DocumentReportingFieldCustomizer
  extends BaseFieldCustomizer<IDocumentReportingFieldCustomizerProperties> {

  public onInit(): Promise<void> {

    const instrumentationKey = "xxxxxxx-xxxx-474f-9008-xxxxxxxxxx";

    //Init AppInsight Service
    AppInsightService.Init(instrumentationKey, '', '');

    //Init SharePoint Service
    const sp = spfi().using(SPFx(this.context));
    SPService.Init(sp);
    
    console.log("Document Reporting FieldCustomizer initialized.");
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated DocumentReportingFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "DocumentReportingFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    // Use this method to perform your custom cell rendering.
    //const text: string = `${this.properties.sampleText}: ${event.fieldValue}`;
   



    const isFile = event.listItem.getValueByName('FSObjType') === '0' ? true : false;

    // if (isFolder) {
    //   return;
    // }

    const userName = this.context.pageContext.user.displayName;
    const userEmail = this.context.pageContext.user.email;
    const listUrl = this.context.pageContext.list?.serverRelativeUrl
    const docId = event.listItem.getValueByName('ID');
    const docName = event.listItem.getValueByName('FileLeafRef');
    const docURL = isFile ? event.listItem.getValueByName('ServerRedirectedEmbedUrl') + '&action=default&mobileredirect=true&wdsle=0' : event.listItem.getValueByName('FileRef')

    //const docType = event.listItem.getValueByName('File_x0020_Type');        

    const documentReporting: React.ReactElement<{}> =
      React.createElement(DocumentReporting, {
        isFile, userName, userEmail, listUrl, docId, docName, docURL
      } as IDocumentReportingProps);

    ReactDOM.render(documentReporting, event.domElement);
  }

  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
