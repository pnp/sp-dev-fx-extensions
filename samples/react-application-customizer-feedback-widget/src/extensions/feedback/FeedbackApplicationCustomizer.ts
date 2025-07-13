import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base"

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

  public onInit(): Promise<void> {
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHolders
    )
    this._renderPlaceHolders()

    getSP(this.context)

    return Promise.resolve()
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elem: React.ReactElement<any> = React.createElement(
        FeedbackCustomizer,
        {
          context: this.context,
          properties: this.properties,
        }
      )
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
