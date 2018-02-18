import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import GroupsNavigation, { IGroupsNavigationProps, IGroup } from './components/GroupsNavigation';

import * as strings from 'OfficeGroupsNavApplicationCustomizerStrings';

const LOG_SOURCE: string = 'OfficeGroupsNavApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IOfficeGroupsNavApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class OfficeGroupsNavApplicationCustomizer
  extends BaseApplicationCustomizer<IOfficeGroupsNavApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _groups: IGroup[] = null;

  @override
  public onInit(): Promise<void> {

    return new Promise<void>((resolve) => {
      // Using Graph here, but any 1st or 3rd party REST API that requires Azure AD auth can be used here.
      const aadClient: AadHttpClient = new AadHttpClient(
        this.context.serviceScope,
        "https://graph.microsoft.com"
      );

      // first, getting all the groups...
      aadClient.get(`https://graph.microsoft.com/v1.0/me/memberOf/$/microsoft.graph.group?$filter=groupTypes/any(a:a eq 'unified')`, AadHttpClient.configurations.v1)
        .then(response => {
          return response.json();
        })
        .then(json => {
          const groupsRequestsUrls: string[] = [];
          const groups: any[] = json.value;
          for (let i = 0, len = groups.length; i < len; i++) {
            groupsRequestsUrls.push(`https://graph.microsoft.com/v1.0/groups/${groups[i].id}/sites/root?$select=webUrl,displayName`);
          }

          //
          // then getting displayName and webUrl for all groups
          // it should be done in batch, but batch doesn't work
          //
          Promise.all(groupsRequestsUrls.map(url => aadClient.fetch(url, AadHttpClient.configurations.v1, { method: 'GET' })))
            .then((responses) => {

              return Promise.all(responses.map(r => r.json()));
            })
            .then(groupsProps => {

              this._groups = groupsProps.map(gr => { return <IGroup>{ name: gr.displayName, url: gr.webUrl }; });

              // Added to handle possible changes on the existence of placeholders.
              this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

              // Call render method for generating the HTML elements.
              this._renderPlaceHolders();
            });

          // batch doesn't work
          /*const batchRequests: any[] = [];
          const groups: any[] = json.value;
          for (let i = 0, len = groups.length; i < len; i++) {
            batchRequests.push({
              id: `${i + 1}`,
              method: 'GET',
              url: `https://graph.microsoft.com/v1.0/groups/${groups[i].id}` ///sites/root?$select=webUrl,displayName
            });
          }

          const batchBody: string = JSON.stringify({ requests: batchRequests });

          const headers = new Headers;
          headers.append('Accept', 'application/json');
          headers.append('Content-Type', 'application/json');

          aadClient.fetch('https://graph.microsoft.com/v1.0/$batch', AadHttpClient.configurations.v1, {
            body: batchBody,
            headers: headers,
            method: 'POST'
          })
            .then(batchResponse => {
              return batchResponse.json();
            })
            .then(groupsProps => {
              this._groups = groupsProps.map(gr => { return <IGroup>{ name: gr.displayName, url: gr.webUrl }; });

              // Added to handle possible changes on the existence of placeholders.
              this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

              // Call render method for generating the HTML elements.
              this._renderPlaceHolders();
            });*/
        });
    });
  }

  private _renderPlaceHolders(): void {

    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this._onDispose });

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        return;
      }

      if (this._topPlaceholder.domElement) {
        const component: React.ReactElement<IGroupsNavigationProps> = React.createElement(GroupsNavigation, {
          groups: this._groups
        });
        ReactDOM.render(component, this._topPlaceholder.domElement);
      }
    }


  }

  private _onDispose(): void {
  }
}
