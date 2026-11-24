import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'HelloAppCustomizerApplicationCustomizerStrings';
import styles from './HelloAppCustomizerApplicationCustomizer.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

const LOG_SOURCE: string = 'HelloAppCustomizerApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHelloAppCustomizerApplicationCustomizerProperties {
  header: string;
  footer: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class HelloAppCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IHelloAppCustomizerApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    return Promise.resolve();
  }

  private _onDispose(): void {
    console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }

  private _renderPlaceHolders(): void {
    console.log('Available application customizer placeholders: ',
      this.context.placeholderProvider.placeholderNames
        .map((name) => PlaceholderName[name])
        .join(', ')
    );

    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      if (!this._topPlaceholder) {
        console.error('The expected placeholder (Top) was not found.');
        return;
      }

      if (this.properties) {
        let headerMessage: string = this.properties.header;
        if (!headerMessage) {
          headerMessage = '(header property was not defined.)';
        }

        if (this._topPlaceholder.domElement) {
          this._topPlaceholder.domElement.innerHTML = `
            <div class="${styles.app}">
              <div class="${styles.top}">
                <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(headerMessage)}
              </div>
            </div>`;
        }
      }
    }

    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        { onDispose: this._onDispose }
      );

      if (!this._bottomPlaceholder) {
        console.error('The expected placeholder (Bottom) was not found.');
        return;
      }

      if (this.properties) {
        let footerMessage: string = this.properties.footer;
        if (!footerMessage) {
          footerMessage = '(footer property was not defined.)';
        }

        if (this._bottomPlaceholder.domElement) {
          this._bottomPlaceholder.domElement.innerHTML = `
            <div class="${styles.app}">
              <div class="${styles.bottom}">
                <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(footerMessage)}
              </div>
            </div>`;
        }
      }
    }
  }
}
