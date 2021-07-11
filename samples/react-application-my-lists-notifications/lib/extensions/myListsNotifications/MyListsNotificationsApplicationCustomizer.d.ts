import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
export interface IMyListsNotificationsApplicationCustomizerProperties {
    right: number;
}
/** A Custom Action which can be run during execution of a Client Side Application */
export default class MyListsNotificationsApplicationCustomizer extends BaseApplicationCustomizer<IMyListsNotificationsApplicationCustomizerProperties> {
    private _headerPlaceholder;
    onInit(): Promise<void>;
    private _renderPlaceHolders;
    private _onDispose;
}
//# sourceMappingURL=MyListsNotificationsApplicationCustomizer.d.ts.map