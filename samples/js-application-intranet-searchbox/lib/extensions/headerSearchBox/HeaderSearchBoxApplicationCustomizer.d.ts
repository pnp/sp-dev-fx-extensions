import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
export interface IHeaderSearchBoxApplicationCustomizerProperties {
}
/** A Custom Action which can be run during execution of a Client Side Application */
export default class HeaderSearchBoxApplicationCustomizer extends BaseApplicationCustomizer<IHeaderSearchBoxApplicationCustomizerProperties> {
    private topPlaceHolder;
    private appContext;
    private searchResultPage;
    onInit(): Promise<void>;
    private renderPlaceholders;
    private HandleSearchEvents;
    private showSearchInputButtonDisplay;
    private handleSearchRedirect;
    private GetSearchRedirectPage;
}
