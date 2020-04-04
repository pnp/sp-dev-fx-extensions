import * as React from "react";
import styles from "./TranslationBar.module.scss";

import { ITranslationBarProps } from "./ITranslationBarProps";
import { ITranslationBarState } from "./ITranslationBarState";

import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { ILanguage } from "../../models/ILanguage";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { Layer } from "office-ui-fabric-react/lib/Layer";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { Overlay } from "office-ui-fabric-react/lib/Overlay";
import { IDetectedLanguage } from "../../models/IDetectedLanguage";

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { ColumnControl, ClientsideText, IClientsidePage } from "@pnp/sp/clientside-pages";
import { ITranslationResult } from "../../models/ITranslationResult";
import { thProperties } from "office-ui-fabric-react/lib/Utilities";

export class TranslationBar extends React.Component<ITranslationBarProps, ITranslationBarState> {

  constructor(props: ITranslationBarProps) {
    super(props);

    this.state = {
      availableLanguages: [],
      selectedLanguage: undefined,
      pageItem: undefined,
      isLoading: true,
      isTranslated: false,
      isTranslating: false,
      globalError: undefined
    };
  }

  public async componentDidMount() {
    this._initTranslationBar();
  }

  public async componentDidUpdate(nextProps: ITranslationBarProps) {
    if (nextProps.currentPageId !== this.props.currentPageId) {
      // Set original state
      this.setState({
        availableLanguages: [],
        selectedLanguage: undefined,
        pageItem: undefined,
        isLoading: true,
        isTranslated: false,
        isTranslating: false,
        globalError: undefined
      }, () => this._initTranslationBar());
    }
  }

  public render(): JSX.Element {

    const { availableLanguages, selectedLanguage, isLoading } = this.state;

    if (isLoading) { return <div className={styles.translationBar}><div className={styles.loadingButton}>Loading ...</div></div>; }
    if (!selectedLanguage) {return <div>Unable to detect language on page...</div>; }

    let currentMenuItems = [...availableLanguages];
    if (currentMenuItems.length <= 0) {
      currentMenuItems = [
        {
          key: "noTranslationsPlaceholder",
          name: "No available languages found",
          disabled: true
        }
      ];
    }

    return (
      <div className={styles.translationBar}>
        <ActionButton
          className={styles.actionButton}
          text={this.state.selectedLanguage.label}
          iconProps={{ iconName: "Globe" }}
          menuProps={{
            shouldFocusOnMount: true,
            items: currentMenuItems
          }}
        />
        {this.state.isTranslated && (
          <ActionButton
            className={styles.actionButton}
            text={"Reload original"}
            onClick={() => this._onReloadOriginal()}
          />
        )}
        {this.state.isTranslated && (
          <MessageBar messageBarType={MessageBarType.warning}>
            <span>
              Please be aware that the content on this page is translated by the Microsoft Translator Text API to provide a basic understanding of the content.
              It is a literal translation and certain words may not translate accurately....
            </span>
          </MessageBar>
        )}
        {this.state.globalError && (
          <MessageBar messageBarType={MessageBarType.error}>
            {this.state.globalError}
          </MessageBar>
        )}
        {this.state.isTranslating && (
          <Layer>
            <Overlay isDarkThemed={true} />
          </Layer>
        )}
      </div>
    );
  }

  private _initTranslationBar = async (): Promise<void> => {
    const pageItem = await this._getPageItem();

    const detectedLanguage = await this._detectLanguage(pageItem["Description"]);
    const availableLanguages = await this._getAvailableLanguages(detectedLanguage);
    let selectedLanguage: ILanguage = undefined;

    if (availableLanguages.some((l: IContextualMenuItem) => l.key === detectedLanguage.language)) {
      const selectedLanguageMenuItem = availableLanguages.filter((l: IContextualMenuItem) => l.key === detectedLanguage.language)[0];
      selectedLanguage = { label: selectedLanguageMenuItem.name, code: selectedLanguageMenuItem.key };
    }

    this.setState({
      availableLanguages,
      selectedLanguage,
      pageItem,
      isLoading: false,
      isTranslated: false,
      isTranslating: false,
      globalError: undefined
    });
  }
  private _getAvailableLanguages = async (detectedLanguage: IDetectedLanguage): Promise<IContextualMenuItem[]> => {
    try {
      return (await this.props.translationService.getAvailableLanguages(this.props.supportedLanguages))
      .map((language: ILanguage) => {
        return {
          key: language.code,
          name: language.label,
          onClick: () => this._onTranslate(language),
          iconProps: language.code === detectedLanguage.language
            ? { iconName: "CheckMark" }
            : undefined
        };
      });
    } catch (err) {
      this.setState({
        globalError: (err as Error).message
      });
    }
  }
  private _updateSelectedLanguage = (selectedLanguage: ILanguage): void => {
    const availableLanguages: IContextualMenuItem[] = [...this.state.availableLanguages].map((item: IContextualMenuItem) => {
      return {
        ...item,
        iconProps: item.key === selectedLanguage.code
          ? { iconName: "CheckMark" }
          : undefined
      };
    });
    this.setState({ availableLanguages, selectedLanguage });
  }
  private _detectLanguage = async (text: string): Promise<IDetectedLanguage> => {
    try {
      return await this.props.translationService.detectLanguage(text);
    } catch (err) {
      this.setState({
        globalError: (err as Error).message
      });
    }
  }
  private _onTranslate = (language: ILanguage): void => {

    this.setState({ isTranslating: true });

    const relativePageUrl: string = `${this.props.currentWebUrl}/SitePages/${this.state.pageItem["FileLeafRef"]}`;

    sp.web.loadClientsidePage(relativePageUrl).then( async (clientSidePage: IClientsidePage) => {

      // Translate title
      await this._translatePageTitle(clientSidePage.title, language.code);

      // Get all text controls
      var textControls: ColumnControl<any>[] = [];
      clientSidePage.findControl((c) => {
        if (c instanceof ClientsideText) {
          textControls.push(c);
        }
        return false;
      });

      for (const control of textControls) {
        await this._translateTextControl(control as ClientsideText, language.code);
      }

      this.setState({ isTranslating: false, isTranslated: true });
      this._updateSelectedLanguage(language);
    });
  }
  private _translatePageTitle = async (title: string, languageCode): Promise<void> => {
    const translationResult: ITranslationResult = await this.props.translationService.translate(title, languageCode, false);

    // get the title element
    const pageTitle: Element = document.querySelector("div[data-automation-id='pageHeader'] div[role='heading']");
    if (pageTitle) {
      pageTitle.textContent = translationResult.translations[0].text;
    }
  }
  private _translateTextControl = async (textControl: ClientsideText, languageCode: string): Promise<void> => {

    // Get the element
    const element = document.querySelector(`[data-sp-feature-instance-id='${textControl.id}']`);

    // Translate element if found
    if (element && element.firstChild) {
      await this._translateHtmlElement(element.firstChild as Element, languageCode);
    } else {
      console.error(`Text control with id: '${textControl.id}' not found!`);
    }

  }
  private _translateHtmlElement = async (element: Element, languageCode: string): Promise<void> => {

    // If inner HTML >= 5000 the API call will fail
    // translate each HMTL child node
    if (element.innerHTML.length > 4999) {
      const childElements = [].slice.call(element.children);
      if (childElements.length > 0) {
        for (const childElement of childElements) {
          await this._translateHtmlElement(childElement, languageCode);
        }
      } else {
        // Fallback: translate each sentence individually if the
        // the length of one html tag is longer then 4999 characters
        const breakSentenceResult = await this.props.translationService.breakSentence(element.textContent);

        let startIndex, endIndex = 0;

        const fullTextToTranslate = element.textContent;
        for (const sentenceLenght of breakSentenceResult.sentLen) {
          endIndex += sentenceLenght;
          const sentenceToTranslate = fullTextToTranslate.substring(startIndex, endIndex);
          const translationResult = await this.props.translationService.translate(sentenceToTranslate, languageCode, false);
          element.textContent = element.textContent.replace(
            sentenceToTranslate,
            translationResult.translations[0].text
          );
          startIndex = endIndex;
        }
      }
    } else {
      const translationResult = await this.props.translationService.translate(element.innerHTML, languageCode, true);
      element.innerHTML = translationResult.translations[0].text;
    }
  }
  private _onReloadOriginal = () => {
    window.location.reload();
  }
  private _getPageItem = async (): Promise<any> => {

    const page = await sp.web.lists
      .getById(this.props.currentListId)
      .items
      .getById(this.props.currentPageId)
      .select("Title", "FileLeafRef", "FileRef", "Description").get();

    return page;
  }
}
