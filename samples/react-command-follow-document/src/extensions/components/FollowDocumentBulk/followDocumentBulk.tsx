import * as React from 'react';

import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { IfollowDocumentBulkProps } from "./IfollowDocumentBulkProps";
import { IfollowDocumentBulkState } from "./IfollowDocumentBulkState";
import Graph from "../../Services/GraphService";

export class FollowDocumentBulk extends React.Component<IfollowDocumentBulkProps, IfollowDocumentBulkState> {
    constructor(props) {
        super(props);
        this.isfollowed();
        this.state = {
            fileInfo: this.props.fileInfo,
            followStatus: true
        };
    }
    private isfollowed = async () => {
        const graphService: Graph = new Graph();
        const initialized = await graphService.initialize(this.props.context.serviceScope);
        const result = [];
        if (initialized) {
            let graphFollowedData: any = await graphService.getGraphContent("https://graph.microsoft.com/v1.0/me/drive/following?$select=id,name,webUrl,parentReference,followed&Top=1000", this.props.context);
            
            for (let index = 0; index < this.props.fileInfo.length; index++) {
                const itemFollowed = graphFollowedData.value.filter((item) => {
                    return item.id ===this.props.fileInfo[index].ItemID && item.parentReference.driveId === this.props.fileInfo[index].DriveId;
                });
                console.log(itemFollowed);
                if(itemFollowed.length > 0)
                {
                    result.push(<div key={index.toString()}>Already following <b>"{this.props.fileInfo[index].fileLeafRef}"</b>.</div>);
                }else{
                    const graphData: any = await graphService.postGraphContent(`https://graph.microsoft.com/v1.0/drives/${this.props.fileInfo[index].DriveId}/items/${this.props.fileInfo[index].ItemID}/follow`, "");
                    if (graphData !== undefined) {
                        result.push(<div key={index.toString()}>Following <b>"{this.props.fileInfo[index].fileLeafRef}"</b>.</div>);
                    }
                }
            }
            this.setState({
                outPutResult: result,
                followStatus: false,
            });
        }


    }
    public render(): React.ReactElement<IfollowDocumentBulkProps> {
        const { followStatus } = this.state;

        return (<DialogContent
            title="Follow Status"
            showCloseButton={true}
            onDismiss={this.props.close}
        >{(followStatus) && <div><Spinner size={SpinnerSize.large} /></div>}
            <div>{
                this.state.outPutResult
            }</div>
        </DialogContent>);
    }
}