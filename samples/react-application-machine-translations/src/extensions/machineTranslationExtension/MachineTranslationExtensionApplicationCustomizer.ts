import * as React from "react";
import * as ReactDOM from "react-dom";

import { sp } from "@pnp/sp/presets/all";

import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from '@microsoft/sp-application-base';

import { TranslationBar } from "../components/TranslationBar";
import { ITranslationBarProps } from "../components/ITranslationBarProps";
import { ITranslationService } from "../../services/ITranslationService";
import { TranslationService } from "../../services/TranslationService";

export interface IMachineTranslationExtensionApplicationCustomizerProperties {
  // Check supported languages: https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support
  supportedLanguages: string[];
  translatorApiKey: string;
  regionSpecifier: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MachineTranslationExtensionApplicationCustomizer
  extends BaseApplicationCustomizer<IMachineTranslationExtensionApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {

    sp.setup(this.context);

    // Added to handle possible changes on the existence of placeholders.
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    // Add navigation event to re-render
    this.context.application.navigatedEvent.add(this, () => {
      this.startReactRender();
    });

    // Call render method for generating the HTML elements.
    this._renderPlaceHolders();

    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {
    // Do nothing when no list item is undefined
    if (!this.context.pageContext.listItem) { return; }

    if (!this._topPlaceholder) {
      this._topPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this._onDispose });

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error('The expected placeholder (Top) was not found.');
        return;
      }

      // Init the translation service
      const translationService: ITranslationService = this.properties.regionSpecifier
        ? new TranslationService(this.context.httpClient, this.properties.translatorApiKey, `-${this.properties.regionSpecifier}`)
        : new TranslationService(this.context.httpClient, this.properties.translatorApiKey);

      const props: ITranslationBarProps = {
        supportedLanguages: this.properties.supportedLanguages,
        currentPageId: this.context.pageContext.listItem.id,
        currentListId: this.context.pageContext.list.id.toString(),
        currentWebUrl: this.context.pageContext.web.serverRelativeUrl,
        translationService
      };
      const elem: React.ReactElement<ITranslationBarProps> = React.createElement(TranslationBar, props);
      ReactDOM.render(elem, this._topPlaceholder.domElement);
    }
  }

  private startReactRender() {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      // Init the translation service
      const translationService: ITranslationService = this.properties.regionSpecifier
        ? new TranslationService(this.context.httpClient, this.properties.translatorApiKey, `-${this.properties.regionSpecifier}`)
        : new TranslationService(this.context.httpClient, this.properties.translatorApiKey);

      const props: ITranslationBarProps = {
        supportedLanguages: this.properties.supportedLanguages,
        currentPageId: this.context.pageContext.listItem.id,
        currentListId: this.context.pageContext.list.id.toString(),
        currentWebUrl: this.context.pageContext.web.serverRelativeUrl,
        translationService
      };
      const element: React.ReactElement<ITranslationBarProps> = React.createElement(TranslationBar, props);
      ReactDOM.render(element, this._topPlaceholder.domElement);
    } else {
      console.log('DOM element of the header is undefined. Start to re-render.');
      this._renderPlaceHolders();
    }
  }

  private _onDispose(): void {
    console.log('[ReactHeaderFooterApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }
}
