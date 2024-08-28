import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';

import * as strings from 'announcementsStrings';
import Announcements, { IAnnouncementsProps } from './components/Announcements';

export const QUALIFIED_NAME = 'Extension.ApplicationCustomizer.Announcements';

export interface IAnnouncementsApplicationCustomizerProperties {
    siteUrl: string;
    listName: string;
}

export default class AnnouncementsApplicationCustomizer
    extends BaseApplicationCustomizer<IAnnouncementsApplicationCustomizerProperties> {

    @override
    protected async onInit(): Promise<void> {
        await super.onInit();

        Log.info(QUALIFIED_NAME, `Initializing ${strings.Title}`);

        if (!this.properties.siteUrl || !this.properties.listName) {
            const e: Error = new Error('Missing required configuration parameters');
            Log.error(QUALIFIED_NAME, e);
            return Promise.reject(e);
        }

        const header = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

        if (!header) {
            const error = new Error('Could not find placeholder Top');
            Log.error(QUALIFIED_NAME, error);
            return Promise.reject(error);
        }

        let site = this.context.pageContext.site;
        let tenantUrl = site.absoluteUrl;
        if (site.serverRelativeUrl != '/')
            tenantUrl = tenantUrl.replace(site.serverRelativeUrl, "");

        const elem: React.ReactElement<IAnnouncementsProps> = React.createElement(Announcements, { 
            context: this.context,
            siteUrl: `${tenantUrl}${this.properties.siteUrl}`, 
            listName: this.properties.listName,
            culture: this.context.pageContext.cultureInfo.currentUICultureName
         });

        ReactDOM.render(elem, header.domElement);

        return Promise.resolve();
    }
}
