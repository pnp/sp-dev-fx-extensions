import * as React from "react"
import * as ReactDOM from "react-dom"
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
import { MySitesRoot } from "../../components/MySitesRoot"
import { getSP } from "../../configuration/pnpConfig"

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMySitesHubApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MySitesHubApplicationCustomizer extends BaseApplicationCustomizer<IMySitesHubApplicationCustomizerProperties> {
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
        this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
          onDispose: this._onDispose,
        })
      if (!this.HeaderPlaceholder) {
        console.error("The expected placeholder (Top) was not found.")
        return
      }
      if (!this._rootElement) {
        this._rootElement = this.HeaderPlaceholder.domElement
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elem: React.ReactElement<any> = React.createElement(MySitesRoot, {
        context: this.context,
        theme: this._themeVariant,
      })
      ReactDOM.render(elem, this.HeaderPlaceholder.domElement)
    }
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
