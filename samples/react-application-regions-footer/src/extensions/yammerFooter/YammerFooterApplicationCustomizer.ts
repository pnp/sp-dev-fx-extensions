import * as React from 'react';
import * as ReactDom from 'react-dom';

import { override } from '@microsoft/decorators';
import { Log, EventArgs } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

import { escape } from '@microsoft/sp-lodash-subset'; 

import styles from './YammerFooter.module.scss';
import * as strings from 'YammerFooterApplicationCustomizerStrings';

import YammerFooterBar from './components/YammerFooterBar';
import { IYammerFooterBarProps } from './components/IYammerFooterBarProps';
import * as SPTermStore from './components/SPTermStoreService'; 

const LOG_SOURCE: string = 'YammerFooterApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IYammerFooterApplicationCustomizerProperties {
  SourceTermSetName: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class YammerFooterApplicationCustomizer
  extends BaseApplicationCustomizer<IYammerFooterApplicationCustomizerProperties> {

  private _bottomPlaceholder: PlaceholderContent | undefined;
  private _bottomMenuItems: SPTermStore.ISPTermObject[];

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Added to handle possible changes on the existence of placeholders
    // this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    // this.context.application._layoutChangedEvent.add(this, this._layoutChanged);
    
    // Retrieve the menu items from taxonomy
    Log.info(LOG_SOURCE, `Creating instance of SPTermStore.SPTermStoreService`);
    Log.info(LOG_SOURCE, `spHttpClient: ${this.context.spHttpClient}`);
    Log.info(LOG_SOURCE, `siteAbsoluteUrl: ${this.context.pageContext.web.absoluteUrl}`);
    let termStoreService: SPTermStore.SPTermStoreService = new SPTermStore.SPTermStoreService({
      spHttpClient: this.context.spHttpClient,
      siteAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
    });

    Log.info(LOG_SOURCE, `SourceTermSetName: ${this.properties.SourceTermSetName}`);
    this._bottomMenuItems = await termStoreService.getTermsFromTermSetAsync(this.properties.SourceTermSetName);
        
    // Call render method for generating the needed html elements
    this._renderPlaceHolders();

    return Promise.resolve<void>();
  }

  @autobind
  private _layoutChanged(eventArgs: EventArgs): void {
    this._renderPlaceHolders();
  }

  private _renderPlaceHolders(): void {
    
    Log.info(LOG_SOURCE, `Available placeholders:  ${this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', ')}`);

    // Handling the bottom placeholder
    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          { onDispose: this._onDispose });

      // The extension should not assume that the expected placeholder is available.
      if (!this._bottomPlaceholder) {
        console.error('The expected placeholder (Bottom) was not found.');
        return;
      }

      const withinPages: boolean = this.context.pageContext.listItem != null;

      if (this.properties && withinPages) {
        const element: React.ReactElement<IYammerFooterBarProps> = React.createElement(
          YammerFooterBar,
          {
            context: this.context,
            sourceTermSetName: this.properties.SourceTermSetName,
            menuItems: this._bottomMenuItems
          }
        );
    
        ReactDom.render(element, this._bottomPlaceholder.domElement);
      }
    }
  }

  private _onDispose(): void {
    Log.info(LOG_SOURCE, '[YammerFooterApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }
}
