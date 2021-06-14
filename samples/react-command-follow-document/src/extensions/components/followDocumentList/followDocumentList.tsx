import * as React from 'react';
import styles from './followDocumentList.module.scss';
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { Text } from "office-ui-fabric-react/lib/Text";
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import Graph from "../../Services/GraphService";
import { FileList, File, ViewType, MgtTemplateProps } from '@microsoft/mgt-react';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import RestService from "../../Services/RestService";

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
    //Load using REST
    //this.getRestFollowedDocs();
  }

  /**
   * 
   */
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

  private getGraphFollowedDocs = async () => {
    const GraphService: Graph = new Graph();
    let graphData: any = await GraphService.getGraphContent("https://graph.microsoft.com/v1.0/me/drive/list", this.props.context);
    const DriveItem: MicrosoftGraph.DriveItem[] = await this.getListID(graphData.parentReference.siteId);
    this.setState({
      fileList: DriveItem,
      visible: false,
    });

  }
  private getListID = async (siteId: string): Promise<MicrosoftGraph.DriveItem[]> => {
    const GraphService: Graph = new Graph();
    let graphData: any = await GraphService.getGraphContent(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$select=id&$filter=displayName eq 'Social'`, this.props.context);
    const DriveItem: MicrosoftGraph.DriveItem[] = await this.getFollowDocuments(siteId, graphData.value[0].id);
    return DriveItem;
  }

  private getFollowDocuments = async (siteId: string, listId: string): Promise<MicrosoftGraph.DriveItem[]> => {
    const GraphService: Graph = new Graph();
    let graphData: any = await GraphService.getGraphContent(`https://graph.microsoft.com/v1.0/sites/${siteId}/Lists/${listId}/items?expand=fields(select=ItemId,ListId,SiteId,webId,Title,Url,ServerUrlProgid,IconUrl)&$filter=fields/ItemId gt -1`, this.props.context);
    let Item: MicrosoftGraph.DriveItem[] = [];
    graphData.value.forEach(element => {
      Item.push({
        webUrl: element.fields.Url,
        name: element.fields.Title,
      });
    });
    return Item;
  }

  public async componentWillReceiveProps(nextProps: IfollowDocumentListProps): Promise<void> {

    //Get MicrosoftGraph.DriveItems
    this.getDriveItems();
    // open panel
    this.setState({
      isOpen: nextProps.isOpen,
      visible:false,
    });
  }

  private stopfollowingDocument = async (Item: MicrosoftGraph.DriveItem) => {
    const restService: RestService = new RestService();
    const Status = await restService.stopfollowing(
      this.props.context.spHttpClient,
      Item.webUrl,
      this.props.context.pageContext.web.absoluteUrl,
    );
    if (Status) {
      //Get MicrosoftGraph.DriveItems
      this.getDriveItems();
    }
  }

  public render(): React.ReactElement<IfollowDocumentListProps> {
    const {SiteID, visible, fileList } = this.state;

    const displayFollowStatusFiles = (Items: MicrosoftGraph.DriveItem[]) => {
      var listItems = Items.map(item => {
        return <div>
          <Link href={item.webUrl} target="_alt" >
            <File view={ViewType.oneline} fileDetails={item}></File>
          </Link>
          <div><Text variant="small">{item.webUrl}</Text></div>
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
        });
      });

      return <div>{displayFollowStatusFiles(Item)}</div>;
    };

    const Loading = (props: MgtTemplateProps) => {
      return <Spinner size={SpinnerSize.large} />;
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
          
          <FileList
            siteId={SiteID}
            files={fileList}
            hideMoreFilesButton={true}
            pageSize={1000}
          >
            <MyFile template="default"></MyFile>
            <Loading template="loading"></Loading>
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