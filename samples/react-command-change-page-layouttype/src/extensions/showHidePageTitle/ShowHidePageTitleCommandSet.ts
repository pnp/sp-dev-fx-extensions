import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    Command,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { sp } from "@pnp/sp/presets/all";
import * as strings from 'ShowHidePageTitleCommandSetStrings';
import { ICommandInfo, IPageInfo } from './IModel';
import AppBaseDialog from './components/AppBaseDialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IShowHidePageTitleCommandSetProperties {
    
}

const LOG_SOURCE: string = 'ShowHidePageTitleCommandSet';

export default class ShowHidePageTitleCommandSet extends BaseListViewCommandSet<IShowHidePageTitleCommandSetProperties> {
    private appDialog: AppBaseDialog = null;

    private _closeDialog() {
        this.appDialog.close();
    }

    @override
    public onInit(): Promise<void> {
        Log.info(LOG_SOURCE, 'Initialized ShowHidePageTitleCommandSet');
        sp.setup({
            spfxContext: this.context,
            sp: {
                baseUrl: this.context.pageContext.web.absoluteUrl
            }
        });
        return Promise.resolve();
    }

    @override
    public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
        const compareOneCommand: Command = this.tryGetCommand(strings.ShowHideCommand);
        if (compareOneCommand) {
            compareOneCommand.visible = false;
            // This command should be hidden unless exactly one row is selected.
            compareOneCommand.visible = event.selectedRows.length >= 1;
        }
    }

    @override
    public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
        switch (event.itemId) {
            case strings.ShowHideCommand:
                let pagesInfo: IPageInfo[] = [];
                if (event.selectedRows.length > 0) {
                    event.selectedRows.map(row => {
                        pagesInfo.push({
                            Name: row.getValueByName("FileLeafRef"),
                            Path: row.getValueByName("FileRef"),
                            ID: row.getValueByName("ID"),
                        });
                    });
                    let data: ICommandInfo = {
                        List: {
                            Title: this.context.pageContext.list.title,
                            Url: this.context.pageContext.list.serverRelativeUrl,
                            Id: this.context.pageContext.list.id.toString()
                        },
                        Pages: pagesInfo
                    };
                    this.appDialog = new AppBaseDialog({});
                    this.appDialog.data = data;
                    this.appDialog.show();
                    this.appDialog.closeDialog = this._closeDialog.bind(this);
                }
                break;
            default:
                throw new Error(strings.UnkCmd);
        }
    }
}
