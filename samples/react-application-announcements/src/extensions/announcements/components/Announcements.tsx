import * as React from 'react';
import { Link, MessageBar, MessageBarType } from '@microsoft/office-ui-fabric-react-bundle';
import { Web } from "@pnp/sp/presets/all";
import { useEffect, useState } from 'react';
import * as strings from 'announcementsStrings';
import { QUALIFIED_NAME } from '../AnnouncementsApplicationCustomizer';

interface IAnnouncementItem {
    ID: number;
    Title: string;
    Announcement: string;
    Urgent: boolean;
    Link: { Description: string, Url: string };
}

export interface IAnnouncementsProps {
    siteUrl: string;
    listName: string;
    culture: string;
}

export default function RenderAnnouncements(props: IAnnouncementsProps) {
    // Two local state variables with their setter
    let [announcements, setAnnouncements] = useState<IAnnouncementItem[]>([]);
    let [acknowledgedAnnouncements, setAcknowledgedAnnouncements] = useState<number[]>([]);

    // Use an effect to query the list data only once,
    // not on every render. The effect will be re-run if
    // props.siteUrl or props.listName changes
    useEffect(() => {
        if (window.localStorage) {
            const items: string = window.localStorage.getItem(QUALIFIED_NAME);
            if (items) {
                setAcknowledgedAnnouncements(JSON.parse(items));
            }
        }

        // Use PnP JS to query SharePoint
        const now: string = new Date().toISOString();
        Web(props.siteUrl)
            .lists.getByTitle(props.listName)
            .items
            .filter(`(Locale eq '${props.culture}' or Locale eq null) and (StartDateTime le datetime'${now}' and EndDateTime ge datetime'${now}')`)
            .select("ID", "Title", "Announcement", "Urgent", "Link", "Locale", "StartDateTime", "EndDateTime")
            .get<IAnnouncementItem[]>()
            .then(setAnnouncements);

    }, [props.siteUrl, props.listName]);

    const announcementElements = announcements
        .filter(announcement => acknowledgedAnnouncements.indexOf(announcement.ID) < 0)
        .map(announcement => <MessageBar
            messageBarType={(announcement.Urgent ? MessageBarType.error : MessageBarType.warning)}
            isMultiline={false}
            onDismiss={() => {
                // On dismiss, add the current announcement id to the array 
                // STORAGE_KEY item in localStorage so it is remembered locally
                let items: number[] = JSON.parse(window.localStorage.getItem(QUALIFIED_NAME)) || [];
                items.push(announcement.ID);
                window.localStorage.setItem(QUALIFIED_NAME, JSON.stringify(items));
                setAcknowledgedAnnouncements(items);
            }}
            dismissButtonAriaLabel={strings.Close}>
            <strong>{announcement.Title}</strong>&nbsp;
            {/* 
            Unsafe set of HTML, this could cause XSS, use with care.
            Since the source list is under administrative control, this should be safe.
            */}
            <span dangerouslySetInnerHTML={{ __html: announcement.Announcement }} />
            { announcement.Link && <Link href={announcement.Link.Url} target="_blank">{announcement.Link.Description}</Link> }
        </MessageBar>);

    return <div>{announcementElements}</div>;
}