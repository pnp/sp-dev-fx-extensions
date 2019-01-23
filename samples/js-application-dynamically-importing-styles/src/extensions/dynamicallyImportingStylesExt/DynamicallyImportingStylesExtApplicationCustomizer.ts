import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'DynamicallyImportingStylesExtApplicationCustomizerStrings';

const LOG_SOURCE: string = 'DynamicallyImportingStylesExtApplicationCustomizer';

export interface IDynamicallyImportingStylesExtApplicationCustomizerProperties {
  // Extension property that is used below to define which bundled style .js file should be loaded at runtime.
  includedStyles: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class DynamicallyImportingStylesExtApplicationCustomizer
  extends BaseApplicationCustomizer<IDynamicallyImportingStylesExtApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {

    /*
    The example below illustrates how multiple collections of styles (multiple files) can be loaded onto the SharePoint site individually which will help ensure better performance in the loading of SharePoint sites.

    The two .scss files below are used to provide a different visual effect on the hover state. One file produces a shadow effect, while the other produces a glow effect.
    
    Using the "includedStyles" property for this SharePoint Framework Application Customizer Extension, we can dynamically load either the Shadow styles OR the Glow styles.

    The 'import()' expression will separate out each imported .scss file into it's own .js file, allowing each individual style file to be loaded separately.
    */
   
    if (this.properties.includedStyles == 'ButtonShadows') {
      import('./styles/stylesModuleButtonShadows.module.scss');
    }

    if (this.properties.includedStyles == 'ButtonGlows') {
      import('./styles/stylesModuleButtonGlows.module.scss');
    }

    return Promise.resolve();
  }
}