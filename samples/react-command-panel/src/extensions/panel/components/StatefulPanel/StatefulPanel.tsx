import { useBoolean } from '@fluentui/react-hooks';
import {
    Logger, LogLevel
} from "@pnp/logging";
import { IPanelStyles, MessageBar, MessageBarType, Panel, PanelType } from "office-ui-fabric-react";
import * as React from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { IStatefulPanelProps } from "./IStatefulPanelProps";

export default function StatefulPanel(props: React.PropsWithChildren<IStatefulPanelProps>){
    const IframePanelStyles: Partial<IPanelStyles> = { root: { top: props.panelTop } };
    const [isOpen, setIsOpen] = useBoolean(false);

    React.useEffect(() => {
        if (props.shouldOpen && !isOpen ) { 
            setIsOpen.setTrue();
            props.shouldOpen = false;
        }
    }, [props.shouldOpen]);
    
    const _onPanelClosed = () => {
        setIsOpen.setFalse();
        if (props.onDismiss) { 
            props.onDismiss();
        }
    };
    const _errorFallback = (error): JSX.Element => {
        return <MessageBar messageBarType={MessageBarType.error} isMultiline={true} dismissButtonAriaLabel="Close" >{error}</MessageBar>;
    };
    const _errorHandler = (error: Error, info: { componentStack: string }) => {
        Logger.error(error);
        Logger.write(info.componentStack, LogLevel.Error);
    };

    return <Panel
        headerText={props.title}
        isOpen={isOpen}
        type={PanelType.medium}
        isLightDismiss={false}
        styles={IframePanelStyles}
        onDismiss={_onPanelClosed}>
        {/* Ensure there are children to render, otherwise ErrorBoundary throws error */}
        {props.children && 
            <ErrorBoundary FallbackComponent={_errorFallback} onError={_errorHandler}>
                {props.children}
            </ErrorBoundary>
        }
        </Panel>;
}


