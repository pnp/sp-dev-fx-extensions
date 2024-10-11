// IAlerts.types.ts

import { MSGraphClientV3 } from "@microsoft/sp-http";

export interface IAlertsBannerApplicationCustomizerProperties {
  alertTypesJson: string; // Property to hold the alert types JSON
}

export interface IAlertsProps {
  siteIds?: string[];
  graphClient: MSGraphClientV3;
  alertTypesJson: string; // Property to receive the alert types JSON
}

export interface IAlertsState {
  alerts: IAlertItem[];
  alertTypes: { [key: string]: IAlertType };
}

export interface IAlertItem {
  Id: number;
  title: string;
  description: string;
  AlertType: string; // Now a string to match dynamic alert types
  link?: {
    Url: string;
    Description: string;
  };
}

export interface IAlertType {
  name: string;
  iconName: string;
  backgroundColor: string;
  textColor: string;
  additionalStyles?: string;
}

export interface IAlertsBannerApplicationCustomizerProperties {
  alertTypesJson: string; // Property to hold the alert types JSON
}
