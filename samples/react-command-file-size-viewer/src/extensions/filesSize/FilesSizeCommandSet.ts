import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  IListViewCommandSetRefreshEventParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'filesSizeStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFilesSizeCommandSetProperties {
  // This is an example; replace with your own property
  disabledCommandIds: string[];
}

const LOG_SOURCE: string = 'FilesSizeCommandSet';

import ReactBaseDialog from "./components/ReactBaseDialog/ReactBaseDialog";

export default class FilesSizeCommandSet
  extends BaseListViewCommandSet<IFilesSizeCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized FilesSizeCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onRefreshCommand(event: IListViewCommandSetRefreshEventParameters): void {
    event.visible = true; // assume true by default

    if (this.properties.disabledCommandIds) {
      if (this.properties.disabledCommandIds.indexOf(event.commandId) >= 0) {
        Log.info(LOG_SOURCE, 'Hiding command ' + event.commandId);
        event.visible = false;
      }
    }

    if (event.selectedRows.length <= 0) {
      Log.info(LOG_SOURCE, 'Hiding command ' + event.commandId);
      event.visible = false;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.commandId) {
      case 'FilesSize':
        if (event.selectedRows.length >= 0) {
          console.log(`Clicked ${strings.FilesSize}`);

          const values = event.selectedRows.map((item) => {
            const size: number = item.getValueByName("File_x0020_Size");
            const sizeKB: number = size / 1024 ;
            const name: string = item.getValueByName("FileName");
            const id: string = item.getValueByName("ID");
            return { name, id, value: sizeKB };
          });
          const data = {
            "name": "Total",
            "children": values
          };

          const dialog: ReactBaseDialog = new ReactBaseDialog();
          dialog.data = data;
          dialog.show();
        }
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
