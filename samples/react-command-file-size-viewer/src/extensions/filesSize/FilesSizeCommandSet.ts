import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters,
    Command
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

export interface IFileProps {
    FileName?: string;
    FileSize?: number;
    FileType?: string;
    IsFile?: boolean;
    ID?: string;
    UniqueID: string;
    ValidFileType?: boolean;
}

const LOG_SOURCE: string = 'FilesSizeCommandSet';

import ReactBaseDialog from "./components/ReactBaseDialog/ReactBaseDialog";

export default class FilesSizeCommandSet
    extends BaseListViewCommandSet<IFilesSizeCommandSetProperties> {
    private fileInfo: IFileProps[] = [];
    private finalFiles: any = [];

    @override
    public async onInit(): Promise<void> {
        Log.info(LOG_SOURCE, 'Initialized FilesSizeCommandSet');
        await super.onInit();
        // other init code may be present
    }

    @override
    public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
        const fileSizeCommand: Command = this.tryGetCommand('FilesSize');
        let showCommand: boolean = false;

        if (event.selectedRows.length > 0) {
            this.fileInfo = [];
            this.finalFiles = [];
            event.selectedRows.map((item: any) => {
                this.fileInfo.push({
                    FileName: item.getValueByName('FileLeafRef'),
                    FileSize: item.getValueByName('File_x0020_Size'),
                    FileType: item.getValueByName('File_x0020_Type'),
                    ID: item.getValueByName('ID'),
                    UniqueID: item.getValueByName('UniqueId'),
                    IsFile: item.getValueByName('FSObjType') == "0" ? true : false
                });
            });
            showCommand = true;
        }
        else {
            if (this.properties.disabledCommandIds) {
                if (this.properties.disabledCommandIds.indexOf(fileSizeCommand.id) >= 0) {
                    Log.info(LOG_SOURCE, 'Hiding command ' + fileSizeCommand.id);
                    showCommand = false;
                }
            }
            if (event.selectedRows.length <= 0) {
                Log.info(LOG_SOURCE, 'Hiding command ' + fileSizeCommand.id);
                showCommand = false;
            }
        }
        if (fileSizeCommand) fileSizeCommand.visible = showCommand;
    }

    @override
    public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
        switch (event.itemId) {
            case 'FilesSize':
                if (this.fileInfo.length >= 0) {
                    const values = this.fileInfo.map((item) => {
                        const size: number = item.FileSize;
                        const sizeKB: number = size / 1024;
                        const name: string = item.FileName;
                        const id: string = item.ID;
                        return { name, id, value: sizeKB };
                    });
                    const data = {
                        "name": "",
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
