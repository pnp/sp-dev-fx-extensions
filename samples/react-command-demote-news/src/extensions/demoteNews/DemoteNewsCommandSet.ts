import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    Command,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { sp, IItem } from "@pnp/sp/presets/all";
import "@pnp/polyfill-ie11";

import * as strings from 'DemoteNewsCommandSetStrings';

export interface IDemoteNewsCommandSetProperties {
}

const LOG_SOURCE: string = 'PnP Demote News';
const PromotedStateFieldName: string = "PromotedState";
const CheckoutUserIdFieldName: string = "CheckoutUserId";
enum PromotedState {
    NotPromoted = 0,
    Unpublished = 1,
    Promoted = 2,
}

export default class DemoteNewsCommandSet extends BaseListViewCommandSet<IDemoteNewsCommandSetProperties> {

    @override
    public onInit(): Promise<void> {
        Log.info(LOG_SOURCE, 'Initialized Demote News Command Set');
        sp.setup({
            spfxContext: this.context
        });

        return Promise.resolve();
    }

    @override
    public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
        const compareOneCommand: Command = this.tryGetCommand('DEMOTE_PAGE');
        if (compareOneCommand) {
            compareOneCommand.visible = event.selectedRows.length === 1;
        }
    }

    @override
    public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
        switch (event.itemId) {
            case 'DEMOTE_PAGE':
                try {
                    let itemId = event.selectedRows.map(i => i.getValueByName("ID"))[0].toString();
                    const item: IItem = await sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).select(CheckoutUserIdFieldName, PromotedStateFieldName).get();
                    if (item[PromotedStateFieldName] !== PromotedState.Promoted) {
                        Dialog.alert(strings.NotPromoted);
                        break;
                    }
                    
                    const checkoutUser = item[CheckoutUserIdFieldName];
                    if (checkoutUser && checkoutUser !== this.context.pageContext.legacyPageContext.userId) {
                        Dialog.alert(strings.CheckedOutTo + ` ${checkoutUser}.` + strings.TakeOwnership);
                        break;
                    }

                    await sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).validateUpdateListItem(
                        [
                            {
                                FieldName: PromotedStateFieldName,
                                FieldValue: PromotedState.NotPromoted.toString(),
                            }
                        ]);
                    Dialog.alert(strings.DemoteOk);
                } catch (error) {
                    Log.error(LOG_SOURCE, error);
                    Dialog.alert(strings.Error);
                }
                break;
            default:
                break;
        }
    }
}
