import { useBoolean } from '@fluentui/react-hooks';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import * as React from "react";
import StatefulPanel from "../StatefulPanel/StatefulPanel";
import { IMyComponentProps } from "./IMyComponentProps";

export default function MyComponent(props: IMyComponentProps) {
    const [refreshPage, setRefreshPage] = useBoolean(false);

    const _onPanelClosed = () => {
        if (refreshPage) {
            //Reloads the entire page since there isn't currently a way to just reload the list view
            location.reload(); 
        }
    };
    
    return <StatefulPanel
        title={props.panelConfig.title}
        panelTop={props.panelConfig.panelTop}
        shouldOpen={props.panelConfig.shouldOpen}
        onDismiss={_onPanelClosed}
    >
        <Toggle
            label="Refresh the page when panel closes:"
            inlineLabel
            onChange={setRefreshPage.toggle}
            onText="Yes"
            offText="No"
            defaultChecked={refreshPage} />
    </StatefulPanel>;
}