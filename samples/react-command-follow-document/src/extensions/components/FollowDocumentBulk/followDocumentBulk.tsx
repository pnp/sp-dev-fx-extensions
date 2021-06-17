import * as React from 'react';

import { DialogContent } from 'office-ui-fabric-react/lib/Dialog';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { IfollowDocumentBulkProps } from "./IfollowDocumentBulkProps";
import { IfollowDocumentBulkState } from "./IfollowDocumentBulkState";
import RestService from "../../Services/RestService";

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
        const result = [];
        const restService: RestService = new RestService();
        for (let index = 0; index < this.props.fileInfo.length; index++) {
            const FollowDocumentExist = await restService.follow(this.props.fileInfo[index].context.spHttpClient, this.props.fileInfo[index].fileUrl, this.props.fileInfo[index].context.pageContext.site.absoluteUrl);
            if (FollowDocumentExist) {
                result.push(<div key={index.toString()}>Following <b>"{this.props.fileInfo[index].fileLeafRef}"</b>.</div>);
            } else { result.push(<div key={index.toString()}>Already following <b>"{this.props.fileInfo[index].fileLeafRef}"</b>.</div>); }
        }
        this.setState({
            outPutResult: result,
            followStatus: false,
        });
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