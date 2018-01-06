import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'SentimentAnalyticsFieldCustomizerStrings';
import SentimentAnalytics, { ISentimentAnalyticsProps } from './components/SentimentAnalytics';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISentimentAnalyticsFieldCustomizerProperties {
  // This is an example; replace with your own property
  textAnalyticsApiKey?: string;
  fieldToAnalyse?: string;
}

const LOG_SOURCE: string = 'SentimentAnalyticsFieldCustomizer';

export default class SentimentAnalyticsFieldCustomizer
  extends BaseFieldCustomizer<ISentimentAnalyticsFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated SentimentAnalyticsFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "SentimentAnalyticsFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    const id = event.listItem.getValueByName('ID');
    const text: string = event.listItem.getValueByName(this.properties.fieldToAnalyse);

    const sentimentAnalytics: React.ReactElement<{}> =
      React.createElement(SentimentAnalytics, { 
        id: id, 
        text: text, 
        httpClient: this.context.httpClient,
        textAnalyticsApiKey: this.properties.textAnalyticsApiKey
      } as ISentimentAnalyticsProps);

    ReactDOM.render(sentimentAnalytics, event.domElement);
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
