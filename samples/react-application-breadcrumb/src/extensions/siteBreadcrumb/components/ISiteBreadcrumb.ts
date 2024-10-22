import { IBreadcrumbItem } from "@fluentui/react";
import {ApplicationCustomizerContext} from "@microsoft/sp-application-base";

export interface ISiteBreadcrumbProps {
  context: ApplicationCustomizerContext;
}

export interface ISiteBreadcrumbState {
  breadcrumbItems: IBreadcrumbItem[];
}

export interface IWebInfo {
  Id: string;
  Title: string;
  ServerRelativeUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}
