import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer, Placeholder } from '@microsoft/sp-application-base';
import { PlaceholderItems, IPlaceholderItem } from './PlaceholderItems';
import * as pnp from 'sp-pnp-js';
 
/** A Custom Action which can be run during execution of a Client Side Application */
export default class PlaceholdersExtensionApplicationCustomizer
  extends BaseApplicationCustomizer<any> {
    
  @override
  public onInit(): Promise<void> {
    
    //Configure PnP JS Core
    pnp.setup({
      spfxContext: this.context
    });

    return Promise.resolve<void>();
  }
 
  @override
  public onRender(): void {
    try {
      //Grab the placeholders that the page currently offers
      let pagePlaceHolders:ReadonlyArray<string> = this.context.placeholders.placeholderNames;
 
      //Get our list of placeholders
      PlaceholderItems.GetItems(this.context.pageContext.web.id.toString()).then((data:IPlaceholderItem[]) => {
        
        //Loop through returned placeholders
        data.forEach((element:IPlaceholderItem) => {
 
          //Look for a matching placeholder in the list of official placeholders
          let index:Number = pagePlaceHolders.indexOf(element.Title);
          if (index !== -1) {
 
            //Grab the placeholder
            let currentPlaceholder: Placeholder = this.context.placeholders.tryAttach(
              element.Title, { onDispose: this._onDispose}
            );
 
            //Insert our content
            currentPlaceholder.domElement.innerHTML = element.SPFxContent;
          }
        });
      }
      );
    }
    finally {    
    }
     
  }
 
  private _onDispose(): void { }
}
