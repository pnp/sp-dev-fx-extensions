import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  Placeholder
} from '@microsoft/sp-application-base';

import * as strings from 'announcementsStrings';
import Announcements, { IAnnouncementsProps } from './components/Announcements';
import ConsoleLogHandler, { LogLevel } from './ConsoleLogHandler';

const LOG_SOURCE: string = 'AnnouncementsApplicationCustomizer';

export interface IAnnouncementsApplicationCustomizerProperties {
  siteUrl: string;
  listName: string;
}

export default class AnnouncementsApplicationCustomizer
  extends BaseApplicationCustomizer<IAnnouncementsApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log._initialize(new ConsoleLogHandler((window as any).LOG_LEVEL || LogLevel.Error));
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    if (!this.properties.siteUrl ||
      !this.properties.listName) {
      const e: Error = new Error('Missing required configuration parameters');
      Log.error(LOG_SOURCE, e);
      return Promise.reject(e);
    }

    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    const header: Placeholder = this.context.placeholders.tryAttach('PageHeader', {
      onDispose: this._onDispose
    });
    if (!header) {
      Log.error(LOG_SOURCE, new Error('Could not find placeholder PageHeader'));
      return;
    }

    const elem: React.ReactElement<IAnnouncementsProps> = React.createElement(Announcements, {
      siteUrl: this.properties.siteUrl,
      listName: this.properties.listName,
      spHttpClient: this.context.spHttpClient
    });
    ReactDOM.render(elem, header.domElement);
  }

  private _onDispose(): void {
  }
}
