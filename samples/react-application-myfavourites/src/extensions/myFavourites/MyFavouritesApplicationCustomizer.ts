import * as React from "react";
import * as ReactDOM from "react-dom";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'MyFavouritesApplicationCustomizerStrings';
import { IMyFavouritesTopBarProps } from "./components/MyFavouritesTopBar/IMyFavouritesTopBarProps";
import MyFavouritesTopBar from "./components/MyFavouritesTopBar/MyFavouritesTopBar";

const LOG_SOURCE: string = 'MyFavouritesApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMyFavouritesApplicationCustomizerProperties {}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MyFavouritesApplicationCustomizer
  extends BaseApplicationCustomizer<IMyFavouritesApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    let placeholder: PlaceholderContent;
    placeholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

    // init the react top bar component.
    const element: React.ReactElement<IMyFavouritesTopBarProps> = React.createElement(
      MyFavouritesTopBar,
      {
        context: this.context
      }
    );

    // render the react element in the top placeholder.
    ReactDOM.render(element, placeholder.domElement);

    return Promise.resolve();
  }
}
