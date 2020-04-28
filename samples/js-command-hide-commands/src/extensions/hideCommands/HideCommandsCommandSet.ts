import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'HideCommandsCommandSetStrings';
import "@pnp/polyfill-ie11";
import { SPPermission } from '@microsoft/sp-page-context';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHideCommandsCommandSetProperties {
  configListTitle: string;
}

const LOG_SOURCE: string = 'HideCommandsCommandSet';

export default class HideCommandsCommandSet extends BaseListViewCommandSet<IHideCommandsCommandSetProperties> {
  private itemsToHide:Array<any>;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized HideCommandsCommandSet');
    if (!this.properties.configListTitle) {
      console.log("In HideListCommandsApplicationCustomizer configListTitle not set");
    }
    const listTitle = this.context.pageContext.list.title;
    sp.setup({
      spfxContext: this.context,
    });
    return sp.web.lists.getByTitle(this.properties.configListTitle).items.filter("IsEnabled eq 1").top(2000).usingCaching(). get()
      .then((items) => {
        this.itemsToHide=items;
      });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = false;// never show this
    }
    setTimeout(()=>{
      debugger;
      for (let item of this.itemsToHide) {
        if (this.context.pageContext.list.title ===item["ListTitle"]) {
          let matches: NodeListOf<any>=null;
          try{
            matches=document.querySelectorAll(item["CssSelector"]);
          } catch(e){
            console.error(`The css selector ${item["CssSelector"]} or rule ${item["Title"]} is invalid. Rule ignored.`);
            console.error(e);
          }
          switch (matches.length) {
            case 1:
              if (item["ExcludePermission"]) {
                let permissionToExclude = SPPermission[item["ExcludePermission"]];
                if (!permissionToExclude) {
                  console.error(`In HideListCommandsApplicationCustomizer  The permission '${item["ExcludePermission"]}' specifie on the rule ${item["Title"]} is not valid`);
                }
                if (!this.context.pageContext.list.permissions.hasPermission(permissionToExclude)) {
                  this.applyStyle(matches);
                }
              } else {
                this.applyStyle(matches);
              }
              break;
            case 0:
           //   console.error(`In HideListCommandsApplicationCustomizer No matches found for css selector '${item['CssSelector']}' on rule ${item['Title']}.Rule Bypassed}`);
              break;
            default:
              if (item["AllowMultipleMatches"]= 1){
                this.applyStyle(matches);
              }else{
                console.error(`In HideListCommandsApplicationCustomizer ${matches.length} matches found for css selecor on rule ${item['Title']}. Only one allowed. Rule Bypassed}`);
              }

              
          }
  
        }
  
      }
    },1);
  }
  private applyStyle(matches: NodeListOf<any>) {
    for (const match of  matches as any){
      match["style"] = "display:none";
      console.log(`Hiding Command ${match["name"]}`);
    }

  }
  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
   //nothing to do
  }
}
