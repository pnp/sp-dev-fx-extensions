import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHeaderSearchBoxApplicationCustomizerProperties {
    testMessage: string;
}
/** A Custom Action which can be run during execution of a Client Side Application */
export default class HeaderSearchBoxApplicationCustomizer extends BaseApplicationCustomizer<IHeaderSearchBoxApplicationCustomizerProperties> {
    private topPlaceHolder;
    private searchContainer;
    private searchBoxControl;
    private appContext;
    private searchResultPage;
    onInit(): Promise<void>;
    private renderPlaceholders();
    private HandleSearchEvents();
    private showSearchInputButtonDisplay(display);
    private handleSearchRedirect(searchQuery);
    private GetSearchRedirectPage();
    private waitForElementToDisplay(selector);
}
