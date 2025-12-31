import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base"
import {
  ThemeProvider,
  IReadonlyTheme,
  ThemeChangedEventArgs,
} from "@microsoft/sp-component-base"

import * as React from "react"
import * as ReactDOM from "react-dom"

import FeedbackCustomizer from "./components/FeedbackCustomizer"
import { getSP } from "../../Configuration/PnPConfig"

export interface IFeedbackApplicationCustomizerProperties {
  title: string
}

export default class FeedbackApplicationCustomizer extends BaseApplicationCustomizer<IFeedbackApplicationCustomizerProperties> {
  private HeaderPlaceholder: PlaceholderContent | undefined
  private _rootElement: HTMLElement | null = null
  private _themeProvider: ThemeProvider | undefined

  private _themeVariant: IReadonlyTheme | undefined

  public onInit(): Promise<void> {
    this._themeProvider = this.context.serviceScope.consume(
      ThemeProvider.serviceKey
    )
    this._themeVariant = this._themeProvider.tryGetTheme()
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChanged)

    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHolders
    )
    this._renderPlaceHolders()

    getSP(this.context)

    return Promise.resolve()
  }

  private _handleThemeChanged(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme
    this._renderPlaceHolders()
  }

  private _renderPlaceHolders(): void {
    console.log(
      "Available placeholders: ",
      this.context.placeholderProvider.placeholderNames
        .map((name) => PlaceholderName[name])
        .join(", ")
    )
    if (!this.HeaderPlaceholder) {
      this.HeaderPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          {
            onDispose: this._onDispose,
          }
        )
      if (!this.HeaderPlaceholder) {
        console.error("The expected placeholder (Top) was not found.")
        return
      }
      if (!this._rootElement) {
        this._rootElement = this.HeaderPlaceholder.domElement
      }
    }

    // Always re-render the React component with the latest theme
    const elem: React.ReactElement<any> = React.createElement(
      FeedbackCustomizer,
      {
        context: this.context,
        properties: this.properties,
        theme: this._themeVariant,
      }
    )
    ReactDOM.render(elem, this.HeaderPlaceholder.domElement)
  }

  private _onDispose(): void {
    console.log(
      "[FeedbackApplicationCustomizer._onDispose] Disposed custom top placeholders."
    )
    if (this._rootElement) {
      ReactDOM.unmountComponentAtNode(this._rootElement)
    }
  }
}
