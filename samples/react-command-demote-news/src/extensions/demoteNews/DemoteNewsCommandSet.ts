import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    Command,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { sp } from "@pnp/sp";
import { IItem } from "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/polyfill-ie11";
import * as strings from 'DemoteNewsCommandSetStrings';
import { getTheme } from '@uifabric/styling';

export interface IDemoteNewsCommandSetProperties {
}

const LOG_SOURCE: string = 'PnP Demote News';
const PromotedStateFieldName: string = "PromotedState";
const CheckoutUserIdFieldName: string = "CheckoutUserId";
const ThemeState = (<any>window).__themeState__;

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

        const fillColor = this.getThemeColor("themeDarkAlt").replace('#', '%23');
        const iconSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' viewBox='-10 0 2068 2048'%3E%3Cg transform='matrix(1 0 0 -1 0 2048),rotate(0,1034,1024)'%3E%3Cpath fill='${fillColor}' d='M1920 1600q6 1 16 1.5t22 0.5q24 0 50 -1t40 -1v-1152q-14 0 -39 -0.5t-49 -0.5h-30t-21 2l-763 136q-10 -57 -38.5 -106t-70.5 -84t-94.5 -55t-110.5 -20q-66 0 -124.5 25t-102 68.5t-68.5 102t-25 124.5q0 28 6 57l-396 71q-8 1 -17.5 1.5t-20.5 0.5q-22 0 -44.5 -1t-39.5 -1v512q14 0 38.5 -1t47.5 -1q11 0 20.5 0.5t15.5 1.5zM832 448q35 0 67 12t57 33.5t42 50.5t23 64l-378 67q-3 -18 -3 -35q0 -40 15 -75t41 -61t61 -41t75 -15z' /%3E%3C/g%3E%3C/svg%3E`;
        compareOneCommand.iconImageUrl = iconSvg;

        if (compareOneCommand) {
            compareOneCommand.visible = event.selectedRows.length === 1;
        }
    }

    // Get theme from global UI fabric state object if exists, if not fall back to using uifabric    
    private getThemeColor(slot: string) {
        if (ThemeState && ThemeState.theme && ThemeState.theme[slot]) {
            return ThemeState.theme[slot];
        }
        const theme = getTheme();
        return theme[slot];
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
