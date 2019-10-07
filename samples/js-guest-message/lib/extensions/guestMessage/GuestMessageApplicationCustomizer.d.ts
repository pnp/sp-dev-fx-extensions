import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
export interface IGuestMessageApplicationCustomizerProperties {
    textColor: string;
    textmessage: string;
    backgroundColor: string;
}
export default class GuestMessageApplicationCustomizer extends BaseApplicationCustomizer<IGuestMessageApplicationCustomizerProperties> {
    private _topPlaceholder;
    onInit(): Promise<void>;
    private _renderPlaceHolders;
}
//# sourceMappingURL=GuestMessageApplicationCustomizer.d.ts.map