import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ReportingWebPartStrings';
import AppInsightService from '../../services/AppInsightService';
import Container from './components/container';
//import "primereact/resources/themes/lara-light-cyan/theme.css";



export interface IReportingWebPartProps {
  instrumentationKey: string;
  apiKey: string;
  apiSecret: string;
}

export default class ReportingWebPart extends BaseClientSideWebPart<IReportingWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {

    let element: React.ReactElement;

    //If any of the properties are not set, show placeholder component for a better user experience
    if (!this.properties.instrumentationKey || !this.properties.apiKey || !this.properties.apiSecret) {
      element = React.createElement(
        'div',
        {
          style: {
            color: "rgb(51, 51, 51)",
            fontSize: "16px",
            background: "#f8f8f8",
            display: "flex",
            height: "100px",
            alignItems: "center",
            justifyContent: "center",
            padding: "0px 6px",
          }
        },
        'Please configure the web part first to see the content.'

      );
    }
    else {

      element = React.createElement(
        Container,
        {
          isDarkTheme: this._isDarkTheme,
          environmentMessage: this._environmentMessage,
          hasTeamsContext: !!this.context.sdks.microsoftTeams,
          userDisplayName: this.context.pageContext.user.displayName
        }
      );
    }

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {

    return super.onInit().then(async _ => {

      if (this.properties.instrumentationKey && this.properties.apiKey && this.properties.apiSecret) {
        //Init AppInsight Service
        AppInsightService.Init(this.properties.instrumentationKey, this.properties.apiKey, this.properties.apiSecret);
      }

    });
    // return this._getEnvironmentMessage().then(message => {
    //   this._environmentMessage = message;
    // });
  }



  // private _getEnvironmentMessage(): Promise<string> {
  //   if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
  //     return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
  //       .then(context => {
  //         let environmentMessage: string = '';
  //         switch (context.app.host.name) {
  //           case 'Office': // running in Office
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
  //             break;
  //           case 'Outlook': // running in Outlook
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
  //             break;
  //           case 'Teams': // running in Teams
  //           case 'TeamsModern':
  //             environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
  //             break;
  //           default:
  //             environmentMessage = strings.UnknownEnvironment;
  //         }

  //         return environmentMessage;
  //       });
  //   }

  //   return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  // }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('instrumentationKey', {
                  label: strings.InstrumentationKeyFieldLabel
                }),
                PropertyPaneTextField('apiKey', {
                  label: strings.AppInsightsAPIKeyFieldLabel
                }),
                PropertyPaneTextField('apiSecret', {
                  label: strings.AppInsightsAPISecretFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
