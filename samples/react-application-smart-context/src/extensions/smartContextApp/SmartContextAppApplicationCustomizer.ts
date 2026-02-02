import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { SmartContextContainer } from './components/SmartContextContainer';
import { ISmartContextContainerProps } from './components/ISmartContextContainerProps';

import * as strings from 'SmartContextAppApplicationCustomizerStrings';

const LOG_SOURCE: string = 'SmartContextAppApplicationCustomizer';

/**
 * Properties for the Smart Context Application Customizer.
 * Add custom configuration properties here if needed.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISmartContextAppApplicationCustomizerProperties {
  // No custom properties required at this time
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SmartContextAppApplicationCustomizer
  extends BaseApplicationCustomizer<ISmartContextAppApplicationCustomizerProperties> {

  private _containerDiv: HTMLDivElement | null = null;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Create container element for React component
    this._containerDiv = document.createElement('div');
    this._containerDiv.id = 'smart-context-panel-container';
    document.body.appendChild(this._containerDiv);

    // Get the current page URL
    const currentPageUrl = window.location.href;

    // Render the Smart Context Container component
    const element: React.ReactElement<ISmartContextContainerProps> = React.createElement(
      SmartContextContainer,
      {
        graphClientFactory: this.context.msGraphClientFactory,
        currentPageUrl: currentPageUrl
      }
    );

    ReactDom.render(element, this._containerDiv);

    return Promise.resolve();
  }

  protected onDispose(): void {
    // Clean up React component when disposing
    if (this._containerDiv) {
      ReactDom.unmountComponentAtNode(this._containerDiv);
      this._containerDiv.remove();
      this._containerDiv = null;
    }
    super.onDispose();
  }
}
