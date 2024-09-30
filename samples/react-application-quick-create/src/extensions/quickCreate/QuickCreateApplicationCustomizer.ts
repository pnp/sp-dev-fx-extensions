import * as React from "react";
import * as ReactDOM from "react-dom";
import { Log } from "@microsoft/sp-core-library";
import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
import QuickCreateButton from "./components/QuickCreateButton";

import * as strings from "QuickCreateApplicationCustomizerStrings";

const LOG_SOURCE: string = "QuickCreateApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IQuickCreateApplicationCustomizerProperties {
  // This is an example; replace with your own property
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class QuickCreateApplicationCustomizer extends BaseApplicationCustomizer<IQuickCreateApplicationCustomizerProperties> {
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.renderReactComponent();

    return Promise.resolve();
  }

  private renderReactComponent(): void {
    const observer = new MutationObserver(() => {
      const commandBar = document.querySelector("#spCommandBar .ms-CommandBar");
      if (commandBar) {
        observer.disconnect();
        const buttonElement = document.createElement("div");
        commandBar.insertBefore(buttonElement, commandBar.children[1]);

        const quickCreateButton: React.ReactElement<{}> = React.createElement(
          QuickCreateButton,
          {
            context: this.context,
          }
        );

        ReactDOM.render(quickCreateButton, buttonElement);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  public onDispose(): void {
    const commandBar = document.querySelector(".ms-CommandBar div");
    if (commandBar) {
      ReactDOM.unmountComponentAtNode(commandBar);
    }
  }
}
