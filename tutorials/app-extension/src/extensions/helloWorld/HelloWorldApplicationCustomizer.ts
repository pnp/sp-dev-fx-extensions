import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  Placeholder
} from '@microsoft/sp-application-base';

import * as strings from 'helloWorldStrings';
import styles from './AppCustomizer.module.scss';
import { escape } from '@microsoft/sp-lodash-subset'; 

const LOG_SOURCE: string = 'HelloWorldApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHelloWorldApplicationCustomizerProperties {
  Header: string;
  Footer: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class HelloWorldApplicationCustomizer
  extends BaseApplicationCustomizer<IHelloWorldApplicationCustomizerProperties> {

  // These have been added
  private _headerPlaceholder: Placeholder;
  private _footerPlaceholder: Placeholder;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {

    console.log('CustomHeader.onRender()');
    console.log('Available placeholders: ',
      this.context.placeholders.placeholderNames.join(', '));

    // Handling header place holder
    if (!this._headerPlaceholder) {
      this._headerPlaceholder = this.context.placeholders.tryAttach(
        'PageHeader',
        {
          onDispose: this._onDispose
        });

      // The extension should not assume that the expected placeholder is available.
      if (!this._headerPlaceholder) {
        console.error('The expected placeholder was not found.');
        return;
      }

      if (this.properties) {
        let headerString: string = this.properties.Header;
        if (!headerString) {
          headerString = '(Header property was not defined.)';
        }

        if (this._headerPlaceholder.domElement) {
          this._headerPlaceholder.domElement.innerHTML = `
                <div class="${styles.app}">
                  <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.header}">
                    <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(headerString)}
                  </div>
                </div>`;
        }
      }
    }

    // Trying footer placeholder
    if (!this._footerPlaceholder) {
      this._footerPlaceholder = this.context.placeholders.tryAttach(
        'PageFooter',
        {
          onDispose: this._onDispose
        });

      // The extension should not assume that the expected placeholder is available.
      if (!this._footerPlaceholder) {
        console.error('The expected placeholder was not found.');
        return;
      }

      if (this.properties) {
        let footerString: string = this.properties.Footer;
        if (!footerString) {
          footerString = '(Footer property was not defined.)';
        }

        if (this._footerPlaceholder.domElement) {
          this._footerPlaceholder.domElement.innerHTML = `
                <div class="${styles.app}">
                  <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.footer}">
                    <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(footerString)}
                  </div>
                </div>`;
        }
      }
    }
  }

   private _onDispose(): void {
    console.log('[CustomHeader._onDispose] Disposed custom header.');
  }
}
