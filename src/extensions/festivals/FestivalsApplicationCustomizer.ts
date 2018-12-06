import * as React from "react";
import * as ReactDOM from "react-dom";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'FestivalsApplicationCustomizerStrings';
import Lights from "./components/Lights";
import Diwali from "./components/Diwali";
import SantaWalking from "./components/SantaWalking";

const LOG_SOURCE: string = 'FestivalsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFestivalsApplicationCustomizerProperties {
  festivalName: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class FestivalsApplicationCustomizer
  extends BaseApplicationCustomizer<IFestivalsApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let placeholder: PlaceholderContent;
    placeholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

    let festivalName: string = this.properties.festivalName;
    let element = null;

    switch (festivalName) {
      case "Christmas1":
        element = React.createElement(
          Lights
        );
        break;
      case "Diwali":
        element = React.createElement(
          Diwali
        );
        break;
      case "Christmas2":
        element = React.createElement(
          SantaWalking
        );
        break;
      default:
        throw new Error('Unknown command');
    }


    // render the react element in the top placeholder.
    ReactDOM.render(element, placeholder.domElement);

    return Promise.resolve();
  }
}
