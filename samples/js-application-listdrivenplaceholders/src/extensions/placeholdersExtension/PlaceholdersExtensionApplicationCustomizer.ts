import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import * as pnp from 'sp-pnp-js';
import { BaseApplicationCustomizer, PlaceholderName, PlaceholderContent } from '@microsoft/sp-application-base';
import { PlaceholderItems, IPlaceholderItem } from './PlaceholderItems';
import * as strings from 'PlaceholdersExtensionApplicationCustomizerStrings';

const LOG_SOURCE: string = 'PlaceholdersExtensionApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPlaceholdersExtensionApplicationCustomizerProperties { }

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PlaceholdersExtensionApplicationCustomizer
  extends BaseApplicationCustomizer<IPlaceholdersExtensionApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    //Configure PnP JS Core
    pnp.setup({
      spfxContext: this.context
    });

    try {
      //Grab the placeholders that the page currently offers
      let pagePlaceHolders: ReadonlyArray<PlaceholderName> = this.context.placeholderProvider.placeholderNames;

      //Get our list of placeholders
      PlaceholderItems.GetItems(this.context.pageContext.web.id.toString()).then((data: IPlaceholderItem[]) => {

        //Loop through returned placeholders
        data.forEach((element: IPlaceholderItem) => {

          //Look for a matching placeholder in the list of official placeholders
          let index: Number = pagePlaceHolders.indexOf(PlaceholderName[element.Title]);
          if (index !== -1) {

            //Grab the placeholder
            let currentPlaceholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName[element.Title]);

            //Insert our content
            currentPlaceholder.domElement.innerHTML = element.SPFxContent;
          }
        });
      }
      );
    }
    finally {
    }



    return Promise.resolve<void>();
  }
}
