import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    Command,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import * as strings from 'CopyMoveItemsCommandSetStrings';
import AppBaseDialog, { IAppDialogProps } from './components/AppBaseDialog';
import { ICommandInfo } from './Models/ICommandInfo';
import { sp } from "@pnp/sp";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICopyMoveItemsCommandSetProperties {
    // This is an example; replace with your own properties
    sampleTextOne: string;
    sampleTextTwo: string;
}

const LOG_SOURCE: string = 'CopyMoveItemsCommandSet';

export default class CopyMoveItemsCommandSet extends BaseListViewCommandSet<ICopyMoveItemsCommandSetProperties> {
    private appDialog: AppBaseDialog = null;

    @override
    public onInit(): Promise<void> {
        Log.info(LOG_SOURCE, 'Initialized CopyMoveItemsCommandSet');
        sp.setup(this.context);
        return Promise.resolve();
    }

    @override
    public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
        const commandOne: Command = this.tryGetCommand('COMMAND_COPYMOVE');
        commandOne.visible = true;
    }

    private _closeDialog() {
        this.appDialog.close();
    }

    @override
    public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
        console.log(event.selectedRows, this.context);
        switch (event.itemId) {
            case 'COMMAND_COPYMOVE':
                let itemIds: string[] = [];
                if(event.selectedRows.length > 0) {
                    event.selectedRows.map(row => {
                        itemIds.push(row.getValueByName("ID"));
                    });
                }
                let data: ICommandInfo = {
                    List: {
                        Title: this.context.pageContext.list.title,
                        Url: this.context.pageContext.list.serverRelativeUrl,
                        Id: this.context.pageContext.list.id.toString()
                    },
                    Site: {
                        Id: this.context.pageContext.site.id.toString(),
                        AbsUrl: this.context.pageContext.site.absoluteUrl,
                        SerUrl: this.context.pageContext.site.serverRelativeUrl
                    },
                    Web: {
                        Id: this.context.pageContext.web.id.toString(),
                        AbsUrl: this.context.pageContext.web.absoluteUrl,
                        SerUrl: this.context.pageContext.web.serverRelativeUrl
                    },
                    User: {
                        DisplayName: this.context.pageContext.user.displayName,
                        Email: this.context.pageContext.user.email,
                        LoginName: this.context.pageContext.user.loginName
                    },
                    Fields: event.selectedRows.length > 0 ? event.selectedRows[0].fields : undefined,
                    ItemIds: itemIds
                };
                this.appDialog = new AppBaseDialog({});
                this.appDialog.data = data;
                this.appDialog.show();
                this.appDialog.closeDialog = this._closeDialog.bind(this);
                break;
            default:
                throw new Error('Unknown command');
        }
    }
}
