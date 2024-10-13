import * as React from "react";
import * as ReactDom from "react-dom";
import { Log } from "@microsoft/sp-core-library";
import * as strings from 'siteBreadcrumbStrings';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import SiteBreadcrumb from "./components/SiteBreadcrumb";
import { ISiteBreadcrumbProps } from "./components/ISiteBreadcrumb";

const LOG_SOURCE: string = "SiteBreadcrumbApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISiteBreadcrumbApplicationCustomizerProperties {}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SiteBreadcrumbApplicationCustomizer extends BaseApplicationCustomizer<ISiteBreadcrumbApplicationCustomizerProperties> {
  private topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.context.placeholderProvider.changedEvent.add(
      this,
      this.renderPlaceHolders
    );

    this.context.application.navigatedEvent.add(this, this.renderPlaceHolders);

    return Promise.resolve();
  }

  public onDispose(): Promise<void> {
    if (this.topPlaceholder)
      ReactDom.unmountComponentAtNode(this.topPlaceholder?.domElement);

    this.context.placeholderProvider.changedEvent.remove(
      this,
      this.renderPlaceHolders
    );

    this.context.application.navigatedEvent.remove(
      this,
      this.renderPlaceHolders
    );

    return Promise.resolve();
  }

  private renderPlaceHolders(): void {
    if (!this.topPlaceholder) {
      this.topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this.onDispose }
      );
    }

    if (this.topPlaceholder) {
      const element: React.ReactElement<ISiteBreadcrumbProps> =
        React.createElement(SiteBreadcrumb, {
          context: this.context,
        });

      const container = this.topPlaceholder.domElement;

      // Clear any existing content in the container [navigate event]
      ReactDom.unmountComponentAtNode(container);

      // Render the React component in the DOM
      ReactDom.render(element, container);
    }
  }
}
