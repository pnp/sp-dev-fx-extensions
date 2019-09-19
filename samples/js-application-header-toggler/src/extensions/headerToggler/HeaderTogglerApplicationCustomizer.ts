import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, ApplicationCustomizerContext,
  PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'HeaderTogglerApplicationCustomizerStrings';
require('./HeaderTogglerStyles.css');

const LOG_SOURCE: string = 'HeaderTogglerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHeaderTogglerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class HeaderTogglerApplicationCustomizer
  extends BaseApplicationCustomizer<IHeaderTogglerApplicationCustomizerProperties> {

  private topPlaceHolder: PlaceholderContent | undefined;
  private appContext: ApplicationCustomizerContext = null;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    this.appContext = this.context;

    // Add the button to the Top placeholder
    this.context.placeholderProvider.changedEvent.add(this, this.renderPlaceholders);
    
    // Register click event handlers for the toggling buttons
    this.registerClickHandlers();

    return Promise.resolve();
  }

  private renderPlaceholders(){
    if (!this.topPlaceHolder) {
      this.topPlaceHolder = this.appContext.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this.onDispose });
    }
    
    // Add the required HTML.
    if (this.topPlaceHolder.domElement) {
      let html: string = `<div class="toggleButton o365cs-base">
        <a class='toggleButtonClose' href='javascript:void(0);'>
          <span class="ms-Icon--ChevronUpMed _2e1Nb05SSaoOLYsNgNyvkr" role="presentation" style="display: inline-block;font-size: 20px;color: #fff;font-weight: bold;line-height: 30px;"></span>
        </a>
        <a class='toggleButtonOpen' href='javascript:void(0);'>
          <span class="ms-Icon--ChevronDownMed _2e1Nb05SSaoOLYsNgNyvkr" role="presentation" style="display: inline-block;font-size: 20px;color: #fff;font-weight: bold;line-height: 30px;"></span>
        </a>
      </div>`;
      this.topPlaceHolder.domElement.innerHTML = html;
    }
  }

  private registerClickHandlers(){
    // Registering the handlers
    let btnClose = document.getElementsByClassName("toggleButtonClose")[0];
    let btnOpen = document.getElementsByClassName("toggleButtonOpen")[0];

    // Add a class to the body element based on the button clicked
    // Appropriate CSS classes are defined based on the body class to hide the Site Header
    // For hiding the Site header, we defined a CSS class based on its custom attribute
    // example : div[data-automationid='SiteHeader']{    display:none !important;  }
    btnClose.addEventListener('click', (e) => {
      document.body.classList.add("menuClosed");
    });

    btnOpen.addEventListener('click', (e) => {
      document.body.classList.remove("menuClosed");
    });
  }
}
