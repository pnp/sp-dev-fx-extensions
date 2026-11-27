import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import NotificationAdmin from './components/NotificationAdmin';
import { INotificationAdminProps } from './components/INotificationAdminProps';

export default class NotificationAdminWebPart extends BaseClientSideWebPart<Record<string, never>> {
  private root: Root | undefined;

  public render(): void {
    if (!this.root) this.root = createRoot(this.domElement);
    this.root.render(React.createElement<INotificationAdminProps>(NotificationAdmin, {
      client: this.context.spHttpClient,
      rootUrl: this.context.pageContext.site.absoluteUrl
    }));
  }

  protected onDispose(): void {
    this.root?.unmount();
    this.root = undefined;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
