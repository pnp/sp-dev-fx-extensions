import * as React from "react";
import { IHubsiteSiteSwitcherState, IHubsiteSiteSwitcherProps, ISiteInfo } from "./IHubsiteSiteSwitcher";
import { ISPHttpClientOptions, SPHttpClientResponse, SPHttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Guid } from "@microsoft/sp-core-library";

import styles from './HubsiteSiteSwitcher.module.scss';

export default class HubsiteSiteSwitcher extends React.Component<IHubsiteSiteSwitcherProps, IHubsiteSiteSwitcherState> {
    constructor(props: IHubsiteSiteSwitcherProps) {
        super(props);

        this.state = {
            sitesInHubsite: []
        };
    }

    private async _isHubSite(): Promise<boolean> {
        const siteCollectionUrl = this.props.context.pageContext.web.absoluteUrl;
        const restQuery = `${siteCollectionUrl}/_api/site/HubSiteId`;
        const httpClientOptions: ISPHttpClientOptions = {};
        const response: SPHttpClientResponse = await this.props.context.spHttpClient.fetch(restQuery, SPHttpClient.configurations.v1, httpClientOptions);
        const responseJson: any = await response.json();

        const hubSiteId: string = responseJson.value;
        const hubSiteGuid: Guid = Guid.parse(hubSiteId);

        return hubSiteGuid.equals(this.props.context.pageContext.site.id);
    }

    private async _getHubApiToken(): Promise<string> {
        const siteCollectionUrl = this.props.context.pageContext.web.absoluteUrl;
        const restQuery = `${siteCollectionUrl}/_api/sphomeservice/context?$expand=Token`;
        const httpClientOptions: ISPHttpClientOptions = {};
        const response: SPHttpClientResponse = await this.props.context.spHttpClient.fetch(restQuery, SPHttpClient.configurations.v1, httpClientOptions);
        const responseJson: any = await response.json();

        return responseJson.Token.access_token;
        // Improvement: Grab the Hub api URL from: responseJson.Urls
    }

    private async _getSitesInHubsite(): Promise<ISiteInfo[]> {
        const isHubSite = await this._isHubSite();

        if (!isHubSite) return;

        const token = await this._getHubApiToken();

        const restQuery = `https://westeurope3-sphomep.svc.ms/api/v1/sites/hub/feed?departmentId=${this.props.context.pageContext.site.id.toString()}&acronyms=true&start=0&count=9`;
        const httpClientOptions: IHttpClientOptions = {
            headers: {
                'authorization': `Bearer ${token}`,
                'sphome-apicontext': `{"PortalUrl":"${this.props.context.pageContext.site.absoluteUrl}"}`
            }
        };
        const response: HttpClientResponse = await this.props.context.httpClient.fetch(restQuery, SPHttpClient.configurations.v1, httpClientOptions);
        const responseJson: any = await response.json();

        //console.log(responseJson);

        const sitesInHubSite: ISiteInfo[] = responseJson.Items.map((item: any) => {
            const site: ISiteInfo = {
                acronym: item.Acronym,
                bannerImageUrl: item.BannerImageUrl,
                bannerColor: item.BannerColor,
                contentTypeId: item.ContentTypeId,
                webTemplate: item.WebTemplate,
                url: item.Url,
                originalUrl: item.OriginalUrl,
                title: item.Title,
                type: item.Type,
                groupId: item.ItemReference.GroupId,
                webId: item.ItemReference.WebId,
                siteId: item.ItemReference.SiteId
            };

            return site;
        });

        return sitesInHubSite.filter(site => {
            return !Guid.parse(site.siteId).equals(this.props.context.pageContext.site.id);
        });
    }

    public onChangeSelect = (item: IDropdownOption): void => {
        document.location.href = item.key.toString();
    }

    public componentDidMount(): void {
        this._getSitesInHubsite().then((sites: ISiteInfo[]) => {
            this.setState({
                sitesInHubsite: sites
            });
        }).catch(error => {
            console.error(error);
        });
    }

    public render(): React.ReactElement<IHubsiteSiteSwitcherProps> {

        if (this.state.sitesInHubsite.length <= 0) return <div></div>;

        const options = this.state.sitesInHubsite.map(site => {
            return {
                key: site.originalUrl, text: site.title
            };
        });

        return (
            <div className={styles.usefulLinks}>
                <div className={styles.itemsContainer}>
                    <Dropdown
                        placeHolder='Jump to...'
                        id='Basicdrop1'
                        options={options}
                        onChanged={this.onChangeSelect}
                    />
                </div>
            </div>
        );
    }
}