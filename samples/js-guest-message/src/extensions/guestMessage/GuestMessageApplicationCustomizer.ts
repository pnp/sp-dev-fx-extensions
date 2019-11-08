import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import styles from './GuestMessage.module.scss';
import { sp } from "@pnp/sp";
import * as strings from 'GuestMessageApplicationCustomizerStrings';

const LOG_SOURCE: string = 'GuestMessageApplicationCustomizer';

export interface IGuestMessageApplicationCustomizerProperties {
  textColor : string;
  textmessage : string;
  backgroundColor: string;
}

export default class GuestMessageApplicationCustomizer
  extends BaseApplicationCustomizer<IGuestMessageApplicationCustomizerProperties> {
    private _topPlaceholder: PlaceholderContent | undefined;

    @override
    public onInit(): Promise<void> { 
        sp.setup({spfxContext: this.context});
        sp.web.currentUser.get().then(result  => {
          if(result.LoginName.match("#ext#")){
            console.log("External User");
          }
          else{
             console.log("Internal User");
           }
        });


        this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
      return Promise.resolve<void>();
    }
  
    private _renderPlaceHolders(): void {  
      if (!this._topPlaceholder) {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);        
      } 
    }   
  
}
