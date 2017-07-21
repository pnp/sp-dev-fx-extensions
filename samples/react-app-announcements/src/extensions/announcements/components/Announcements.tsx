import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Button,
  ButtonType
} from 'office-ui-fabric-react';
import { Log } from '@microsoft/sp-core-library';
import Announcement from './Announcement';
import { IAnnouncement } from '../IAnnouncement';
import { IAnnouncementItem } from '../IAnnouncementItem';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const STORAGE_KEY: string = 'AnnouncementsApplicationCustomizer';
const LOG_SOURCE: string = 'AnnouncementsApplicationCustomizer_Announcements';

export interface IAnnouncementsState {
  isLoading: boolean;
  allAnnouncements: IAnnouncement[];
  acknowledgedAnnouncements: number[];
}

export interface IAnnouncementsProps {
  siteUrl: string;
  listName: string;
  spHttpClient: SPHttpClient;
}

export default class Announcements extends React.Component<IAnnouncementsProps, IAnnouncementsState> {
  constructor(props: IAnnouncementsProps) {
    super(props);

    this.state = {
      isLoading: true,
      allAnnouncements: [],
      acknowledgedAnnouncements: []
    };
  }

  protected componentDidMount(): void {
    this.setState({
      isLoading: true,
      allAnnouncements: [],
      acknowledgedAnnouncements: []
    });

    Promise.all([this.getAnnouncements(), this.getAcknowledgedAnnouncements()])
      .then((results: any[]): void => {
        this.setState({
          isLoading: false,
          allAnnouncements: results[0],
          acknowledgedAnnouncements: results[1]
        });
      })
      .catch((error: any): void => {
        Log.error(LOG_SOURCE, new Error(`Error loading announcements: ${error}`));
        this.setState({
          isLoading: false,
          allAnnouncements: [],
          acknowledgedAnnouncements: []
        });
      });
  }

  public render(): JSX.Element {
    if (this.state.isLoading) {
      return null;
    }

    const announcementElements: JSX.Element[] = this.state.allAnnouncements.map((announcement: IAnnouncement): JSX.Element => {
      if (this.state.acknowledgedAnnouncements.indexOf(announcement.id) < 0) {
        return <Announcement {...announcement} acknowledge={this.acknowledgeAnnouncement.bind(this, announcement)} />;
      }
      else {
        return null;
      }
    });

    return <div>
      {announcementElements}
    </div>;
  }

  private getAnnouncements(): Promise<IAnnouncement[]> {
    return new Promise<IAnnouncement[]>((resolve: (announcements: IAnnouncement[]) => void, reject: (error: any) => void): void => {
      this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getByTitle('${this.props.listName}')/items?$select=ID,Title,Announcement,Urgent`, SPHttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json;odata.metadata=none'
        }
      })
        .then((response: SPHttpClientResponse): Promise<{ value: IAnnouncementItem[] }> => {
          return response.json();
        })
        .then((announcements: { value: IAnnouncementItem[] }): void => {
          resolve(announcements.value.map((item: IAnnouncementItem): IAnnouncement => {
            return {
              id: item.ID,
              title: item.Title,
              announcement: item.Announcement,
              urgent: item.Urgent
            };
          }));
        })
        .catch((error: any): void => {
          reject(error);
        });
    });
  }

  private getAcknowledgedAnnouncements(): Promise<number[]> {
    return new Promise<number[]>((resolve: (announcementIds: number[]) => void, reject: (error: any) => void): void => {
      if (window.localStorage) {
        const items: string = window.localStorage.getItem(STORAGE_KEY);
        if (items) {
          resolve(JSON.parse(items));
        }
        else {
          resolve([]);
        }
      }
    });
  }

  private acknowledgeAnnouncement(announcement: IAnnouncement): void {
    if (!window.localStorage) {
      return;
    }

    let items: number[] = [];
    const itemsString: string = window.localStorage.getItem(STORAGE_KEY);
    if (itemsString) {
      items = JSON.parse(itemsString);
    }

    items.push(announcement.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.setState((prevState: IAnnouncementsState, props: IAnnouncementsProps): IAnnouncementsState => {
      prevState.acknowledgedAnnouncements = items;
      return prevState;
    });
  }
}