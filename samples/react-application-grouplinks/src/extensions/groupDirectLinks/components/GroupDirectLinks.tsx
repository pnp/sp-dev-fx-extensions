import * as React from "react";
import { IGroupDirectLinksProps, IGroupDirectLinksState, IGroupDirectLinksInfo } from "./IGroupDirectLinks";
import { SPHttpClient, HttpClientResponse, ISPHttpClientOptions, SPHttpClientResponse } from "@microsoft/sp-http";
import {
    DefaultButton,
    ActionButton,
    IButtonProps
} from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';

import styles from './GroupDirectLinks.module.scss';
import { Guid } from "@microsoft/sp-core-library";

export default class GroupDirectLinks extends React.Component<IGroupDirectLinksProps, IGroupDirectLinksState> {

    private _menuButtonElement: HTMLElement | null;

    constructor(props: IGroupDirectLinksProps) {
        super(props);

        this.state = {
            groupDirectLinksInfo: null
        };
    }

    public componentDidMount(): void {
        this._getGroupDirectLinksInfo().then(data => {
            this.setState({
                groupDirectLinksInfo: data
            });
        });
    }

    public render(): React.ReactElement<IGroupDirectLinksProps> {
        if (this.state.groupDirectLinksInfo == null) {
            return <p>...</p>;
        }

        return (
            <div className={styles.usefulLinks}>
                <div className={styles.itemsContainer}>
                    <ActionButton
                        iconProps={{ iconName: 'Calendar' }}
                        href={this.state.groupDirectLinksInfo.calendarUrl} >
                        Calendar
                </ActionButton>
                    <ActionButton
                        iconProps={{ iconName: 'FolderList' }}
                        href={this.state.groupDirectLinksInfo.documentsUrl} >
                        Files
                </ActionButton>
                    <ActionButton
                        iconProps={{ iconName: 'Inbox' }}
                        href={this.state.groupDirectLinksInfo.inboxUrl} >
                        Inbox
                </ActionButton>
                    <ActionButton
                        iconProps={{ iconName: 'OneNoteLogo' }}
                        href={this.state.groupDirectLinksInfo.notebookUrl} >
                        Notebook
                </ActionButton>
                    <ActionButton
                        iconProps={{ iconName: 'People' }}
                        href={this.state.groupDirectLinksInfo.peopleUrl} >
                        People
                </ActionButton>  
                </div>         
            </div>
        );
    }

    private async _getGroupDirectLinksInfo(): Promise<IGroupDirectLinksInfo> {
        const groupId: Guid = this.props.context.pageContext.site.group.id;
        const siteCollectionUrl = this.props.context.pageContext.web.absoluteUrl;
        const restQuery = `${siteCollectionUrl}/_api/SP.Directory.DirectorySession/Group('${groupId}')`;
        const httpClientOptions: ISPHttpClientOptions = {};
        const response: SPHttpClientResponse = await this.props.context.spHttpClient.fetch(restQuery, SPHttpClient.configurations.v1, httpClientOptions);
        const responseJson: any = await response.json();

        const data: IGroupDirectLinksInfo = {
            id: responseJson.Id,
            allowToAddGuests: responseJson.allowToAddGuests,
            calendarUrl: responseJson.calendarUrl,
            documentsUrl: responseJson.documentsUrl,
            inboxUrl: responseJson.inboxUrl,
            isPublic: responseJson.isPublic,
            notebookUrl: responseJson.notebookUrl,
            peopleUrl: responseJson.peopleUrl
        };

        return data;
    }
}