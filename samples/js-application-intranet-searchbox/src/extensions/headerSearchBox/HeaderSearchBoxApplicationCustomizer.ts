import { override } from '@microsoft/decorators';
import {
  BaseApplicationCustomizer, ApplicationCustomizerContext,
  PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import {
  SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration
} from '@microsoft/sp-http';
import { IWebProperties, IWebPropertiesSiteSearch } from './IWebProperties';
import styles from './components/AppCustomiser.module.scss';
import * as strings from 'HeaderSearchBoxApplicationCustomizerStrings';

export interface IHeaderSearchBoxApplicationCustomizerProperties {
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class HeaderSearchBoxApplicationCustomizer
  extends BaseApplicationCustomizer<IHeaderSearchBoxApplicationCustomizerProperties> {

  private topPlaceHolder: PlaceholderContent | undefined;
  private appContext: ApplicationCustomizerContext = null;
  private searchResultPage: string = undefined;

  @override
  public onInit(): Promise<void> {
    // store context so we can use it in other methods
    this.appContext = this.context;

    // do the whole search box injection thing ... 
    this.GetSearchRedirectPage()
      .then(() => {
        if (this.searchResultPage && this.searchResultPage.length > 0) {
          // register placeholder execution
          this.context.placeholderProvider.changedEvent.add(this, this.renderPlaceholders);

          // only add search box events if we have somewhere for it to go!
          this.HandleSearchEvents();
        }
      });
    return Promise.resolve();
  }

  private renderPlaceholders() {
    if (!this.topPlaceHolder) {
      this.topPlaceHolder = this.appContext.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this.onDispose });
    }

    if (this.topPlaceHolder.domElement) {
      this.topPlaceHolder.domElement.innerHTML = `
        <div id=${styles.placeholderHeader}>
          <div class=${styles.Header}>
          </div>
          <div class="${styles.SearchContainer}">
            <div id="${styles.SearchBox}">
              <form aria-label="${strings.FormLabel}" role="search">
                <button class="${styles.buttonMagnifier}" title="${strings.ButtonTitleMagnify}" aria-label="${strings.ButtonTitleMagnify}" aria-hidden="true" type="button" tabindex="-1">
                  <i class="${styles.icon} ms-Icon ms-Icon--Search" aria-hidden="true"></i>
                </button>
                <input class="${styles.input}" role="combobox" 
                  aria-label="${strings.InputLabel}" 
                  aria-autocomplete="list" aria-haspopup="true" aria-expanded="false" accesskey="S" spellcheck="false" autocomplete="off" 
                  autocorrect="false" type="search" placeholder="${strings.InputPlaceholder}" data-nav="true" data-tab="true" value="" />
                <button class="${styles.buttonClear} false" type="button" title="${strings.ButtonTitleClear}" aria-label="${strings.ButtonTitleClear}" data-tab="false" style="display: none;">
                  <i class="${styles.icon} ms-Icon ms-Icon--ChromeClose" aria-hidden="true"></i>
                </button>
                <button class="${styles.buttonSearch}" title="${strings.ButtonTitleSearch}" aria-label="${strings.ButtonTitleSearch}" data-tab="false" style="display: none;">
                  <i class="${styles.icon} ms-Icon ms-Icon--ChromeBackMirrored" aria-hidden="true"></i>
                </button>
              </form>
              <div class="${styles.SearchPanel}" style="display: none;">
              </div>
            </div>
            <div class="${styles.SearchPanel}" />
          </div>
        </div>
        `;
    }

  }

  private HandleSearchEvents() {

    let searchBoxContainer = document.querySelector(`#${styles.SearchBox}`) as HTMLDivElement;
    let searchPanel = searchBoxContainer.querySelector(`.${styles.SearchPanel}`) as HTMLDivElement;
    let searchBoxInput = document.querySelector(`#${styles.SearchBox} input.${styles.input}`) as HTMLInputElement;

    searchBoxInput.addEventListener("focus", (evt) => {
      searchBoxContainer.classList.add(`${styles.active}`);

      if(searchBoxInput.value.length > 0) {
        this.showSearchInputButtonDisplay(true);
      }

      const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
      };

      const outsideClickListener = event => {
        // if they click outside of the main search container
        if (!searchBoxContainer.contains(event.target)) {
          // reset the search box size / buttons
          this.showSearchInputButtonDisplay(false);
          searchBoxContainer.classList.remove(`${styles.active}`);

          // remove our listener
          removeClickListener();
        }
      };
      
      document.addEventListener('click', outsideClickListener);

    });

    // event to handle changes to the search input box
    const searchInputChange = () => {
      searchPanel.innerHTML = `<div>${strings.PanelTextPrefix} <b>${searchBoxInput.value}</b></div>`;
      if (searchBoxInput.value.length > 0) {
        // show the "clear" and "submit" buttons if the box has text
        this.showSearchInputButtonDisplay(true);
      }
      else {
        this.showSearchInputButtonDisplay(false);
      }
    };


    // handle changes in the value
    searchBoxInput.addEventListener("change", searchInputChange);
    searchBoxInput.addEventListener("keyup", searchInputChange);
    searchBoxInput.addEventListener("paste", searchInputChange);

    // handle keyboard based submission 
    searchBoxInput.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.keyCode == 13) {
        // stop the default "form submit" function
        evt.cancelBubble = true;
        evt.preventDefault();

        this.handleSearchRedirect(searchBoxInput.value);
      }
    });

    // clear the search query
    document.querySelector(`#${styles.SearchBox} button.${styles.buttonClear}`).addEventListener("click", (evt) => {
      searchBoxInput.focus();
      this.showSearchInputButtonDisplay(false);
      searchBoxInput.value = "";
    });

    searchPanel.addEventListener("click", (evt) => {
      this.handleSearchRedirect(searchBoxInput.value);
    });

    // search button
    document.querySelector(`#${styles.SearchBox} button.${styles.buttonSearch}`).addEventListener("click", (evt) => {
      // stop any default behaviour
      evt.cancelBubble = true;
      evt.preventDefault();
      
      // then do the whole redirect thing
      this.handleSearchRedirect(searchBoxInput.value);
    });

    // focus on the input when the magnifier is clicked
    document.querySelector(`#${styles.SearchBox} button.${styles.buttonMagnifier}`).addEventListener("click", (evt) => {
      searchBoxInput.focus();
    });
  }

  private showSearchInputButtonDisplay(display: boolean) {

    let displayStyle = display ? "inline-block" : "none";

    (document.querySelector(`#${styles.SearchBox} .${styles.SearchPanel}`) as HTMLDivElement).style.display = displayStyle;
    (document.querySelector(`#${styles.SearchBox} .${styles.buttonClear}`) as HTMLButtonElement).style.display = displayStyle;
    (document.querySelector(`#${styles.SearchBox} .${styles.buttonSearch}`) as HTMLButtonElement).style.display = displayStyle;
  }

  private handleSearchRedirect(searchQuery: string) {
    if (searchQuery && searchQuery.trim().length > 0) {
      console.log(`${strings.LogRedirectingTo} ${this.searchResultPage}`);
      window.location.href = `${this.searchResultPage}?k=${searchQuery}`;
    }
  }

  private GetSearchRedirectPage(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.appContext.spHttpClient.get(`${this.appContext.pageContext.web.absoluteUrl}/_api/web/allProperties`, SPHttpClient.configurations.v1)
        .then((response) => {
          if (response.ok) {
            response.json().then((webProperties: IWebProperties) => {
              if (webProperties && webProperties.SRCH_x005f_SB_x005f_SET_x005f_SITE) {
                this.searchResultPage = (JSON.parse(webProperties.SRCH_x005f_SB_x005f_SET_x005f_SITE) as IWebPropertiesSiteSearch).ResultsPageAddress;
              }
              resolve();
            });
          } else {
            reject(`${strings.LogWebPropertiesNotFound}`);
          }
        });
    });
  }
}