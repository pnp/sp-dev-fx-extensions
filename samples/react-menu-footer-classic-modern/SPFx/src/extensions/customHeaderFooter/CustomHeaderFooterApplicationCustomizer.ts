// SPFx imports
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { escape } from '@microsoft/sp-lodash-subset';

import HeaderFooterDataService from './common/services/HeaderFooterDataService';
import IHeaderFooterData from './common/model/IHeaderFooterData';
import ComponentManager from './common/components/ComponentManager';

const LOG_SOURCE: string = 'CustomHeaderFooterApplicationCustomizer';

export interface ICustomHeaderFooterApplicationCustomizerProperties {
  Top: string;
  Bottom: string;
}

export default class CustomHeaderFooterApplicationCustomizer
  extends BaseApplicationCustomizer<ICustomHeaderFooterApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    return new Promise(() => {
      Log.info(LOG_SOURCE, `Initialized CustomHeaderFooterApplicationCustomizer`);

      //Utilize placeholderProvider changed event to trigger bootstrapping header and footer.
      this.context.placeholderProvider.changedEvent.add(this, this.bootstrap);

      return;
    });
  }

  private bootstrap(): void {
    
    // For now this is hard-coded
    // -- UPLOAD JSON WITH MENU CONTENTS AND PUT THE URL HERE --
    const url = 'https://<tenant>.sharepoint.com/sites/scripts/Style%20Library/HeaderFooterData.json.txt';

    // Read JSON containing the header and footer data
      HeaderFooterDataService.get(url)
        .then ((data: IHeaderFooterData) => {

          // Get the elements from SPFx
          const header: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(
            PlaceholderName.Top,
            { onDispose : this._onDispose }
          );
          const footer: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(
            PlaceholderName.Bottom,
            { onDispose : this._onDispose }
          );

          if (header || footer) {
            // If we have at least one placeholder, render into it
            ComponentManager.render(header ? header.domElement : null,
              footer ? footer.domElement : null, data);
          }

        })
        .catch ((error: string) => {
          console.log(`Error in CustomHeaderFooterApplicationCustomizer: ${error}`);
        });
  
    return;
  }

  private _onDispose(): void { }
}
