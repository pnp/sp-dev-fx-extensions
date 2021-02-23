import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { getThemeColor } from './themeHelper';

interface IWaitDialogContentProps {
    message: string;
    error: string;
    title: string;
    showClose: boolean;
    hidden: boolean;
    closeCallback: () => void;
}

class WaitDialogContent extends React.Component<IWaitDialogContentProps, {}> {
    constructor(props) {
        super(props);
        this.closeDialog = this.closeDialog.bind(this);
    }

    public render(): JSX.Element {
        let logo = require('./parker.png');

        let dialogType = this.props.showClose ? DialogType.close : DialogType.normal;
        const color = getThemeColor("themePrimary");

        return (<div style={{ width: "400px" }}>

            <Dialog hidden={this.props.hidden} isDarkOverlay={true} isBlocking={true}
                onDismiss={this.closeDialog}
                dialogContentProps={{
                    type: dialogType,
                    title: this.props.title,
                    subText: this.props.message
                }} >
                <Label>
                    <span dangerouslySetInnerHTML={{ __html: this.props.error }} />
                </Label>
                <div style={{ fontSize: '0.8em', float: 'right' }}>
                    <a href="https://github.com/pnp/PnP" target="_blank" data-interception="off" style={{ color: color }}>
                        Powered by
                    <br />
                        <img src={logo} style={{ width: '100px' }} />
                    </a>
                </div>
            </Dialog>
        </div >);
    }
    private closeDialog() {
        if (this.props.closeCallback) {
            this.props.closeCallback();
        }
    }
}

const div = document.createElement("div");
export default class WaitDialog {
    public message: string;
    public title: string;
    public error: string;
    public showClose: boolean = false;
    public hidden: boolean = true;

    constructor(props) {
        this.close = this.close.bind(this);
    }

    public render(): void {
        ReactDOM.render(<WaitDialogContent
            message={this.message}
            title={this.title}
            error={this.error}
            showClose={this.showClose}
            closeCallback={this.close}
            hidden={this.hidden}
            key={"b" + new Date().toISOString()}
        />, div);
    }

    public show() {
        this.hidden = false;
        this.render();
    }

    public close() {
        this.hidden = true;
        this.render();
    }
}