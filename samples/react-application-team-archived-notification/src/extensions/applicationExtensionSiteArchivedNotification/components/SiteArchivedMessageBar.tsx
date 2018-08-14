import * as React from "react";
import * as ReactDOM from "react-dom";
import { MessageBar, MessageBarType} from 'office-ui-fabric-react/lib/MessageBar';
//import {ISiteArchivedMessageBarProps} from "./ISiteArchivedMessageBar";
import * as strings from 'ApplicationExtensionSiteArchivedNotificationApplicationCustomizerStrings';
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { MessageBarButton } from "office-ui-fabric-react/lib/Button";

export interface ISiteArchivedMessageBarProps {
    context: ApplicationCustomizerContext;
    
 }

export default class SiteArchivedMessageBar extends React.Component<ISiteArchivedMessageBarProps>
{
    constructor(props: ISiteArchivedMessageBarProps)
    {
        console.log(props);
        super(props);
    }

    public render(): React.ReactElement<ISiteArchivedMessageBarProps>
    {
       
        return(
            <MessageBar
            messageBarType={MessageBarType.severeWarning}
            >{strings.SiteArchivedText}
            </MessageBar>

        );
    }

    
}