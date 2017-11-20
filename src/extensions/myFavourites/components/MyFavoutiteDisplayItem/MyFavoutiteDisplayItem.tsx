import * as React from "react";

import { IMyFavoutiteDisplayItemProps } from "./IMyFavoutiteDisplayItemProps";
import { IMyFavoutiteDisplayItemState } from "./IMyFavoutiteDisplayItemState";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import styles from "../MyFavourites.module.scss";

export default class MyFavoutiteDisplayItem extends React.Component<IMyFavoutiteDisplayItemProps, IMyFavoutiteDisplayItemState> {
    constructor(props: IMyFavoutiteDisplayItemProps) {
        super(props);
        this.state = {
            status: <span></span>,
            disableButtons: false
        };
    }

    public render(): React.ReactElement<IMyFavoutiteDisplayItemProps> {
        return (
            <div className={styles.msListBasicExampleitemContent}>
                <div className={styles.msListBasicExampleitemName}>
                    <Link className={`ms-font-l ${styles.ccFavLink}`} href={this.props.displayItem.ItemUrl}>{this.props.displayItem.Title}</Link>
                </div>
                <div className={styles.msListBasicExampleitemDesc}>{this.props.displayItem.Description}</div>
                <div className={styles.msListBasicExampleitemDesc}>
                    <PrimaryButton
                        data-automation-id='btnEdit'
                        iconProps={{ iconName: 'Edit' }}
                        text='Edit'
                        disabled={this.state.disableButtons}
                        onClick={this._editFavourite.bind(this)}
                        className={styles.ccButton}
                    />
                    <PrimaryButton
                        data-automation-id='btnDel'
                        iconProps={{ iconName: 'ErrorBadge' }}
                        text='Delete'
                        disabled={this.state.disableButtons}
                        onClick={this._deleteFavourite.bind(this)}
                        className={styles.ccButton}
                    />
                    <div className={styles.msListBasicExamplechevron}>
                        {this.state.status}
                    </div>
                </div>
            </div>
        )
    }

    private async _deleteFavourite(): Promise<void> {

        let status: JSX.Element = <Spinner size={SpinnerSize.small} />;
        let disableButtons: boolean = true;
        this.setState({ ...this.state, status, disableButtons });
        this.props.deleteFavourite(this.props.displayItem.Id);
    }

    private _editFavourite(): void {
        let status: JSX.Element = <Spinner size={SpinnerSize.small} />;
        let disableButtons: boolean = true;
        this.setState({ ...this.state, status, disableButtons });

        this.props.editFavoutite(this.props.displayItem);

        status = <span></span>;
        disableButtons = false;
        this.setState({ ...this.state, status, disableButtons });
    }
}