import * as React from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';

import { IFollowedSitesProps } from './IFollowedSitesProps';
import { ISiteItem } from '../../../Common/Modules/ISiteItem';
import styles from '../../MyFollowedSitesApplicationCustomizer.module.scss';
import { formProperties } from '@uifabric/utilities';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { sortBy } from '@microsoft/sp-lodash-subset';
import Utilities from '../../../Common/Services/Utilities';

export default class FollowedSites extends React.Component<IFollowedSitesProps, any>{

    //Stores user followed sites locally
    private _myFollowedSites: ISiteItem[] | undefined;
    //Browser session storage key to store user followed sites for re-use.
    private _UserSessionStorageKey: string | undefined;

    public constructor(props: IFollowedSitesProps) {
        super(props);

        this.state = {
            openPanel: false,
            isDataLoaded: false,
            myFollowedSites: []
        };

    }
    /**
     * @description - React component lifecycle method
     */
    public componentDidMount(): void {
        try {
            //Generate dynamic session storage key to store information about user followed sites.
            this._UserSessionStorageKey = this.props.currentContext.pageContext.user.loginName.substring(0, this.props.currentContext.pageContext.user.loginName.indexOf('@')) + '_FollowedSites';
        } catch (error) {

        }
    }
    /**
     * @description - React lifecycle event
     */

    private handleLogoClick(): void {
        try {
            //Open panel and show data loading progress.
            this.setState({ openPanel: true, isDataLoaded: false });
            //Getting user followed site information session storage if available.
            //let myFollowedSitesString: string = this.getFromSessionStorage(this._UserSessionStorageKey);
            let myFollowedSitesString: string = Utilities.getFromSessionStorage(this._UserSessionStorageKey);
            if (myFollowedSitesString && myFollowedSitesString !== undefined && myFollowedSitesString.length > 0) {
                console.log('Loading from Session storage');

                this._myFollowedSites = JSON.parse(myFollowedSitesString);
                //Optional:Setting timeout to have effect of loading data
                setTimeout(() => {
                    this.setState({ myFollowedSites: this._myFollowedSites, isDataLoaded: true });
                }, 500);


            } else {
                //Getting followed sites information from server
                console.log('Loading from server');
                this.setState({ openPanel: true, isDataLoaded: false });
                this.getUserFollowedSitesFromServer().then(ufsites => {
                    if (ufsites) {
                        //Setting data to react component state
                        this.setState({ myFollowedSites: ufsites, isDataLoaded: true });
                        //Convert user followed sites object array as JSON string
                        myFollowedSitesString = JSON.stringify(ufsites);
                        //store value in session so it can be retrieved when required.
                        //this.updateSessionStorage(this._UserSessionStorageKey, myFollowedSitesString);
                        Utilities.updateSessionStorage(this._UserSessionStorageKey, myFollowedSitesString);
                    }
                });
            }

        } catch (error) {
            console.log(JSON.stringify(error));
        }
    }
    /**
     * @description - Loads user followed sites from server
     */
    private handleRefreshClick(): void {
        try {
            event.preventDefault();
            console.log('Loading from server');
            let myFollowedSitesString: string | undefined;
            this.setState({ openPanel: true, isDataLoaded: false });
            this.getUserFollowedSitesFromServer().then(ufsites => {
                if (ufsites) {
                    this.setState({ myFollowedSites: ufsites, isDataLoaded: true });
                    //store value in session so it can be retrieved when required.
                    myFollowedSitesString = JSON.stringify(ufsites);
                    if (undefined !== myFollowedSitesString) {
                        this.updateSessionStorage(this._UserSessionStorageKey, myFollowedSitesString);
                    }
                }
            }).catch(err => {
                console.log(JSON.stringify(err));
            });

        } catch (error) {
            console.log(error);

        }
    }
    /***
     * @description - Generate UI for Followed sites
     */
    private generateFollowedSitesUI(): React.ReactElement[] {
        let sitesUI: React.ReactElement[] = [];
        try {
            if (this.state.myFollowedSites && this.state.myFollowedSites.length > 0) {
                this.state.myFollowedSites.map((mysite: ISiteItem) => {
                    sitesUI.push(
                        <div className={styles.sitelink}>
                            <Link href={mysite.Uri} target="_blank">
                                {(mysite.SiteLogo === null || mysite.SiteLogo === undefined) &&
                                    <Icon iconName="FavoriteStarFill" className={styles.sitelogdefault} />
                                }
                                {mysite.SiteLogo && mysite.SiteLogo !== undefined &&
                                    <img src={mysite.SiteLogo} className={styles.sitelogo} />
                                }
                                {mysite.Name}

                            </Link>
                        </div>
                    );
                });
            }
            return sitesUI;
        } catch (error) {
            console.log(JSON.stringify(error));
        }
    }
    /**
     * @description - Method to close panel.
     * @param event - Close panel
     */
    private dismissPanel(event: any): void {
        try {
            event.preventDefault();
            this.setState({ openPanel: false });
        } catch (error) {

        }
    }
    /**
     * @description -Retrieve information from session storage based on key.
     * @param key - Session storage key
     */
    private getFromSessionStorage(key: string): string {
        let sessionValue: string = null;
        try {
            if (key !== undefined && key) {
                sessionValue = window.sessionStorage.getItem(key);
            }

        } catch (error) {

        }

        return sessionValue;
    }
    /**
     * @description - Storage new key value pair in user session.
     * @param key - Session storage key
     * @param value - Session storage value
     */
    private updateSessionStorage(key: string, value: string): void {
        try {
            if (key && key !== undefined && value && value !== undefined) {
                window.sessionStorage.setItem(key, value);
            }

        } catch (error) {

        }
    }
    /**
     * @description - Return user followed sites retrieved from server
     */
    private async  getUserFollowedSitesFromServer(): Promise<ISiteItem[]> {
        try {

            return this.props.spService.getMyFollowedSites().then(fSites => {
                if (fSites && fSites !== undefined && fSites.length > 0) {

                    let uniqueSites: ISiteItem[] = [];
                    //Remove duplicates if any
                    fSites.forEach(fsite => {
                        if (undefined !== fsite) {

                            if (uniqueSites.indexOf(uniqueSites.filter(u => u.Uri === fsite.Uri)[0]) === -1) {
                                uniqueSites.push(fsite);
                            }

                        }

                    });
                    //Sort based on site Name
                    let sortedFSites: ISiteItem[] = sortBy(uniqueSites, ['Name']);
                    //let sortedFSites: ISiteItem[] = this.props.spService.SortMyFollowedSites(uniqueSites, "Name");

                    this._myFollowedSites = sortedFSites;
                    return sortedFSites;

                }

            });

        } catch (error) {


        }
    }
    /**
     * @description - React lifecycle event -Render component UI
     */
    public render(): React.ReactElement<IFollowedSitesProps> {

        const mySitesUI = this.generateFollowedSitesUI();
        return (
            <div className={styles.app} >
                <div className={styles.iconcontainer}>
                    <IconButton iconProps={{ iconName: 'AdminSLogoInverse32', className: styles.iconstyle }} ariaLabel='My Followed Sites' title='My Followed Sites' onClick={this.handleLogoClick.bind(this)} />
                </div>
                {this.state.openPanel &&
                    <Panel
                        isOpen={this.state.openPanel}
                        type={PanelType.medium}
                        closeButtonAriaLabel="Close"
                        headerText="My Followed Sites"
                        onDismiss={this.dismissPanel.bind(this)}
                    >
                        <Shimmer ariaLabel="Loading data" isDataLoaded={this.state.isDataLoaded}>
                            <div className={styles.refreshcontainer}>
                                <div className={styles.refreshbutton}>
                                    <IconButton iconProps={{ iconName: 'Refresh', className: styles.refreshbuttonstyle }} ariaLabel='Refresh' title='Refresh' onClick={this.handleRefreshClick.bind(this)} />
                                </div>
                            </div>
                            <p className={styles.sitespanel}>
                                {mySitesUI}
                            </p>
                        </Shimmer>
                    </Panel>
                }
            </div >
        );
    }
}