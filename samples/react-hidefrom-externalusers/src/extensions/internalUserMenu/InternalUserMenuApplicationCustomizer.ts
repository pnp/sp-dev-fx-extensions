import { override } from '@microsoft/decorators';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import * as ReactDom from "react-dom";

import UserMenu from "./components/UserMenu";
import { IUserMenuProps } from "./components/IUserMenuProps";
import * as React from 'react';
import { MSGraphClient, HttpClientResponse } from '@microsoft/sp-http';

export interface IInternalUserMenuApplicationCustomizerProperties {
  testMessage: string;
}

export default class InternalUserMenuApplicationCustomizer
  extends BaseApplicationCustomizer<IInternalUserMenuApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {

    return this.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient): Promise<HttpClientResponse> => {

        return client.api(`me`).get();
      })
      .then((res: any) => {

        if(res.userPrincipalName && res.userPrincipalName.indexOf("#EXT#") !== -1) {

          // this is external user. Do not render the react component

          return Promise.resolve();
        }

        const placeholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
        const element: React.ReactElement<IUserMenuProps> = React.createElement(UserMenu);

        // render the react element in the top placeholder
        ReactDom.render(element, placeholder.domElement);

        return Promise.resolve();
      })
      .catch(error => {
        return Promise.resolve();
      });
  }
}
