import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { SPComponentLoader } from '@microsoft/sp-loader';

import * as strings from 'CustomBrandingApplicationCustomizerStrings';

const LOG_SOURCE: string = 'CustomBrandingApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomBrandingApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CustomBrandingApplicationCustomizer
  extends BaseApplicationCustomizer<ICustomBrandingApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Pre-upload CSS from assets folder to below location
    SPComponentLoader.loadCss("/SiteAssets/CSS/modern-style.css");    

    return Promise.resolve();
  }
}
