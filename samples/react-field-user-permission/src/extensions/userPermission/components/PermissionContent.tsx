import { override } from '@microsoft/decorators';
import * as React from 'react';
import * as strings from 'UserPermissionFieldCustomizerStrings';


export interface IPermissionContentProps {
    isEditor: boolean;
}

export default class PermissionContent extends React.Component<IPermissionContentProps, {}> {

    @override
    public render(): React.ReactElement<{}> {
        let permIcon;

        if (this.props.isEditor) {
            permIcon = <span style={{ color: "rgb(152, 60, 12)" }}><i className="ms-Icon ms-Icon--PageEdit" style={{ fontSize: "17px", float: "left", marginRight: "5px" }} aria-hidden="true"></i>
            <p style={{ margin: "0", float: "left" }}>{strings.UserPermissionEdit}</p></span>;
        } else {
            permIcon = <span style={{ color: "rgb(152, 60, 12)" }}><i className="ms-Icon ms-Icon--ReadingMode" style={{ fontSize: "17px", float: "left", marginRight: "5px" }} aria-hidden="true"></i>
            <p style={{ margin: "0", float: "left" }}>{strings.UserPermissionRead}</p></span>;
        }

        return (
            <div>
                {permIcon}
            </div>
        );
    }


}