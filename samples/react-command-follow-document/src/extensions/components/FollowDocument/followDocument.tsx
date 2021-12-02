import * as React from 'react';

import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { File, ViewType, MgtTemplateProps } from '@microsoft/mgt-react';
import { IfollowDocumentProps } from "./IfollowDocumentProps";
import { IfollowDocumentState } from "./IfollowDocumentState";
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import Graph from "../../Services/GraphService";

const linkClass = mergeStyles({
    paddingLeft: 5,
});

export class FollowDocument extends React.Component<IfollowDocumentProps, IfollowDocumentState> {

    constructor(props) {
        super(props);
        this.isfollowed();
        this.state = {
            fileInfo: this.props.fileInfo,
            context: this.props.context,
        };
    }
    private isfollowed = async () => {
        const GraphService: Graph = new Graph();
        let graphData: any = await GraphService.getGraphContent("https://graph.microsoft.com/v1.0/me/drive/following?$select=id,name,webUrl,parentReference,followed&Top=1000", this.props.context);
        const state = graphData.value.filter((data) => {
            return data.id === this.props.fileInfo[0].ItemID && data.parentReference.driveId === this.props.fileInfo[0].DriveId;
        });
        this.setState({
            followStatus: state.length > 0 ? true : false,
        });
    }

    public render(): React.ReactElement<IfollowDocumentProps> {
        const { fileInfo, followStatus } = this.state;

        const followSocialDocument = async () => {
            const graphService: Graph = new Graph();
            const initialized = await graphService.initialize(this.props.context.serviceScope);
            if (initialized) {
                const graphData: any = await graphService.postGraphContent(`https://graph.microsoft.com/v1.0/drives/${fileInfo[0].DriveId}/items/${fileInfo[0].ItemID}/follow`, "");
                if (graphData.followed !== undefined) {
                    this.setState({
                        followStatus: true,
                    });
                }
                
            }
        };
        const stopfollowingDocument = async () => {
            const graphService: Graph = new Graph();
            const initialized = await graphService.initialize(this.props.context.serviceScope);
            if (initialized) {
                const graphData: any = await graphService.postGraphContent(`https://graph.microsoft.com/v1.0/drives/${fileInfo[0].DriveId}/items/${fileInfo[0].ItemID}/unfollow`, "");
                if (graphData === undefined) {
                    this.setState({
                        followStatus: false,
                    });
                }
            }
        };

        const Loading = (props: MgtTemplateProps) => {
            return <Spinner size={SpinnerSize.large} />;
        };

        return (
            <DialogContent
                title="Follow Status"
                showCloseButton={true}
                onDismiss={this.props.close}
            >
                <div>
                    <File view={ViewType.threelines} driveId={this.props.fileInfo[0].DriveId} itemId={this.props.fileInfo[0].ItemID}>
                        <Loading template="loading"></Loading>
                    </File>
                    <div>
                        {(followStatus === true) &&
                            <div>
                                <Icon iconName="FavoriteStarFill" ></Icon><Link className={linkClass} onClick={stopfollowingDocument} >Stop following</Link>
                            </div>
                        }
                        {(followStatus === false) &&
                            <div>
                                <Icon iconName="FavoriteStar" ></Icon><Link className={linkClass} onClick={followSocialDocument}>Follow</Link>
                            </div>
                        }
                    </div>
                </div>
            </DialogContent>
        );
    }
}
