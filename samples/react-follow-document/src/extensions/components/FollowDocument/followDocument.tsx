import * as React from 'react';

import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { File, ViewType } from '@microsoft/mgt-react';
import RestService from "../../Services/RestService";
import { IfollowDocumentProps } from "./IfollowDocumentProps";
import { IfollowDocumentState } from "./IfollowDocumentState";
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';

const linkClass = mergeStyles({
    paddingLeft: 5,
  });

export class FollowDocument extends React.Component<IfollowDocumentProps, IfollowDocumentState> {

    constructor(props) {
        super(props);
        this.isfollowed();
        this.state = {
            fileInfo: this.props.fileInfo,
        };
    }
    private isfollowed = async () => {
        const restService: RestService = new RestService();
        const followDocumentExist = await restService.isfollowed(this.props.fileInfo[0].context.spHttpClient, this.props.fileInfo[0].fileUrl, this.props.fileInfo[0].context.pageContext.site.absoluteUrl);
        this.setState({
            followStatus:followDocumentExist,
        });
    }

    public render(): React.ReactElement<IfollowDocumentProps> {
        const { fileInfo, followStatus } = this.state;
        
        const followSocialDocument = () => {
            const restService: RestService = new RestService();
            const Status = restService.follow(
                fileInfo[0].context.spHttpClient,
                fileInfo[0].fileUrl,
                fileInfo[0].context.pageContext.web.absoluteUrl
            );
            if (Status)
                this.setState({
                    followStatus: true,
                });
        };
        const stopfollowingDocument = () => {
            const restService: RestService = new RestService();
            const Status = restService.stopfollowing(
                fileInfo[0].context.spHttpClient,
                fileInfo[0].fileUrl,
                fileInfo[0].context.pageContext.web.absoluteUrl
            );
            if (Status) {
                this.setState({
                    followStatus: false,
                });
            }

        };

        return (
            <DialogContent
                title="Follow Status"
                showCloseButton={true}
                onDismiss={this.props.close}
            >
                <div>
                    <File view={ViewType.threelines} driveId={this.props.fileInfo[0].DriveId} itemId={this.props.fileInfo[0].ItemID}></File>
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
