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
        let firstLetter: string = this.props.displayItem.Title.charAt(0).toUpperCase();
        return (
                <div className={`${styles.ccitemContent}`}>
                    <Link href={this.props.displayItem.ItemUrl} className={styles.ccRow}>
                        <div className={`ms-font-su ${styles.ccInitials}`}>
                            {firstLetter}
                        </div>
                        <div className={styles.ccitemName}>
                            <span className={`ms-font-l`}>{this.props.displayItem.Title}</span>
                        </div>
                        <div className={styles.ccitemDesc}>{this.props.displayItem.Description}</div>
                    </Link>
                    <div className={styles.ccitemDesc}>
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
                        <div className={styles.ccStatus}>
                            {this.state.status}
                        </div>
                    </div>
                </div>
        );
    }

    private async _deleteFavourite(): Promise<void> {

        let status: JSX.Element = <Spinner size={SpinnerSize.small} />;
        let disableButtons: boolean = true;
        this.setState({ ...this.state, status, disableButtons });
        await this.props.deleteFavourite(this.props.displayItem.Id);
        status = <span></span>;
        disableButtons = false;
        this.setState({ ...this.state, status, disableButtons });
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