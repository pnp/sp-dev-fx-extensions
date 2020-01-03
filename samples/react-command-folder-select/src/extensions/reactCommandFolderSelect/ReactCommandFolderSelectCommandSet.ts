import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import FolderSelect from './components/FolderSelect';
import * as strings from 'ReactCommandFolderSelectCommandSetStrings';
import { sp, Folders } from "@pnp/sp";
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import _ from 'underscore';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IReactCommandFolderSelectCommandSetProperties {
  // This is an example; replace with your own properties
}

const LOG_SOURCE: string = 'ReactCommandFolderSelectCommandSet';

export default class ReactCommandFolderSelectCommandSet extends BaseListViewCommandSet<IReactCommandFolderSelectCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ReactCommandFolderSelectCommandSet');

    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
      return Promise.resolve();
    });

  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = true;
    }
  }

  public _compare = (a, b): any => {
    const itema = a.Name.toUpperCase();
    const itemb = b.Name.toUpperCase();


    if(itema > itemb){
      return 1;
    } else if (itema < itemb) {
      return -1;
    }
    return 0;
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        const folderOptions: Array<any> = [];
        let libraryName = this.context.pageContext.list.title;
        sp.web.folders.getByName(libraryName).folders.get().then(folders => {
          folders.sort((a, b) => {
            if(a.Name.toUpperCase() < b.Name.toUpperCase()) return -1;
            if(a.Name.toUpperCase() > b.Name.toUpperCase()) return 1;
            return 0;
          });
          let filteredFolders = _.reject(folders, function(folder) { return folder.Name === 'Forms';});
          filteredFolders.map(folder => {
            folderOptions.push({key: folder.ServerRelativeUrl, text: folder.Name, title: folder.Name});
          });
        });
        const callout: FolderSelect = new FolderSelect();
        callout.folderOptions = folderOptions;
        callout.show();
        break;
      default:
        throw new Error('Unknown command');
    }


  }


}
