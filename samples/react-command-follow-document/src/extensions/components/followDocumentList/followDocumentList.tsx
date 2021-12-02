import * as React from 'react';
import styles from './followDocumentList.module.scss';
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import Graph from "../../Services/GraphService";
import { FileList, File, ViewType, MgtTemplateProps } from '@microsoft/mgt-react';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { IfollowDocumentListProps } from './IfollowDocumentListProps';
import { IfollowDocumentListState } from './IfollowDocumentListState';

export class followDocumentListPanel extends React.Component<IfollowDocumentListProps, IfollowDocumentListState> {

    constructor(props: IfollowDocumentListProps) {
        super(props);
        this.state = {
            isOpen: true,
            SiteID: "1",
            fileList: [],
            visible: false,
        };
        //Get MicrosoftGraph.DriveItems
        this.getDriveItems();
    }

    private getDriveItems = () => {
        //Load using Graph
        this.getGraphFollowedDocs();
    }

    /**
     * 
     */
    /*
    private getRestFollowedDocs = async () => {
        const restService: RestService = new RestService();
        const followedData = await restService.followed(
            this.props.context.spHttpClient,
            this.props.context.pageContext.web.absoluteUrl,
        );
        this.setState({
            fileList: followedData,
        });
    }
    */

    private getGraphFollowedDocs = async () => {
        const GraphService: Graph = new Graph();
        let DriveItem: MicrosoftGraph.DriveItem[] = [];
        let graphData: any = await GraphService.getGraphContent("https://graph.microsoft.com/v1.0/me/drive/following?$select=id,name,webUrl,parentReference,followed&Top=1000", this.props.context);
        graphData.value.forEach(data => {
            DriveItem.push({
                id: data.id,
                webUrl: data.webUrl,
                webDavUrl: data.webUrl,
                name: data.name,
                lastModifiedDateTime:data.followed.followedDateTime,
                parentReference:{
                    driveId: data.parentReference.driveId,
                },
            });
        });
        DriveItem = DriveItem.sort((a, b) => {
            return (new Date(b.lastModifiedDateTime)).getTime() -  (new Date(a.lastModifiedDateTime)).getTime();
          });
        this.setState({
            fileList: DriveItem,
            visible: true,
        });

    }

    public async componentWillReceiveProps(nextProps: IfollowDocumentListProps): Promise<void> {

        //Get MicrosoftGraph.DriveItems
        this.getDriveItems();
        // open panel
        this.setState({
            isOpen: nextProps.isOpen,
            visible: false,
        });
    }

    private stopfollowingDocument = async (Item: MicrosoftGraph.DriveItem) => {
        const graphService: Graph = new Graph();
        const initialized = await graphService.initialize(this.props.context.serviceScope);
        if (initialized) {
          const graphData: any = await graphService.postGraphContent(`https://graph.microsoft.com/v1.0/drives/${Item.parentReference.driveId}/items/${Item.id}/unfollow`, "");
          if (graphData === undefined) {
            this.getDriveItems();
          }
        }
    }

    public render(): React.ReactElement<IfollowDocumentListProps> {
        const { SiteID, visible, fileList } = this.state;

        const displayFollowStatusFiles = (Items: MicrosoftGraph.DriveItem[]) => {
            var listItems = Items.map(item => {
                return <div>
                    <Link href={item.webDavUrl} target="_blank" >
                        <File view={ViewType.oneline} fileDetails={item}></File>
                    </Link>
                    <div><TextField  defaultValue={item.webUrl}></TextField></div>
                    <Link onClick={e => this.stopfollowingDocument(item)}>Stop following</Link>
                </div>;
            });
            return <div>{listItems}</div>;
        };

        const MyFile = (props: MgtTemplateProps) => {
            let Item: MicrosoftGraph.DriveItem[] = [];
            const infoFile = props.dataContext;
            infoFile.files.forEach(element => {
                Item.push({
                    webUrl: element.webUrl,
                    name: element.name,
                    webDavUrl: element.webDavUrl,
                    id: element.id,
                    parentReference:element.parentReference,
                });
            });

            return <div>{displayFollowStatusFiles(Item)}</div>;
        };

        const NoData = (props: MgtTemplateProps) => {
            return <div>No follow documents.</div>;
        };

        return (
            <Panel isOpen={this.state.isOpen}
                type={PanelType.smallFixedFar}
                isLightDismiss
                headerText="Followed Documents"
                onRenderFooterContent={this._onRenderFooterContent}
                onDismiss={this._closePanel}
            >
                <div>
                    {(!visible) && <div><Spinner size={SpinnerSize.large} /></div>}
                    <FileList
                        siteId={SiteID}
                        files={fileList}
                        hideMoreFilesButton={true}
                        pageSize={1000}
                    >
                        <MyFile template="default"></MyFile>
                        <NoData template="no-data"></NoData>
                    </FileList>
                </div>
            </Panel>
        );
    }

    private _onRenderFooterContent = () => {
        return (
            <div className={styles.footerSection}>
                <DefaultButton text="Cancel" onClick={this._closePanel} />
            </div>
        );
    }

    /**
     * Close extension panel
     */
    private _closePanel = () => {
        this.setState({
            isOpen: false,
            visible: true
        });
    }

}