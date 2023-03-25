import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'WeatherWidgetApplicationCustomizerStrings';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import { IWeatherWidgetProps, WeatherWidget } from '../components/WeatherWidget';

const LOG_SOURCE: string = 'WeatherWidgetApplicationCustomizer';

export interface IWeatherWidgetApplicationCustomizerProperties {
  location: string;
}

export default class WeatherWidgetApplicationCustomizer
  extends BaseApplicationCustomizer<IWeatherWidgetApplicationCustomizerProperties> {
  private HeaderPlaceholder: PlaceholderContent | undefined;
  private _rootElement: HTMLElement | null = null;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    this._renderPlaceHolders();
    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {
    console.log('Available placeholders: ',
      this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));
    if (!this.HeaderPlaceholder) {
      this.HeaderPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this._onDispose });
      if (!this.HeaderPlaceholder) {
        console.error('The expected placeholder (Top) was not found.');
        return;
      }
      if (!this._rootElement) {
        this._rootElement = this.HeaderPlaceholder.domElement;
      }
      const elem: React.ReactElement<IWeatherWidgetProps> = React.createElement(WeatherWidget, {
        context: this.context,
        location: this.properties.location
      });
      ReactDOM.render(elem, this.HeaderPlaceholder.domElement);
    }
  }

  private _onDispose(): void {
    console.log('[WeatherWidgetApplicationCustomizer._onDispose] Disposed custom top placeholders.');
    if (this._rootElement) {
      ReactDOM.unmountComponentAtNode(this._rootElement);
    }
  }
}
