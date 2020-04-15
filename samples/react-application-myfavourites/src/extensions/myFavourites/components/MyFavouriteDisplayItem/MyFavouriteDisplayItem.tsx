import * as React from "react";

import { IMyFavouriteDisplayItemProps } from "./IMyFavouriteDisplayItemProps";
import { IMyFavouriteDisplayItemState } from "./IMyFavouriteDisplayItemState";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { css } from "@uifabric/utilities/lib/css";

import styles from "../MyFavourites.module.scss";
import * as strings from 'MyFavouritesApplicationCustomizerStrings';

export class MyFavouriteDisplayItem extends React.Component<IMyFavouriteDisplayItemProps, IMyFavouriteDisplayItemState> {
    constructor(props: IMyFavouriteDisplayItemProps) {
        super(props);
        this.state = {
            status: <span></span>,
            disableButtons: false
        };
    }

    public render(): React.ReactElement<IMyFavouriteDisplayItemProps> {
        const firstLetter: string = this.props.displayItem.Title.charAt(0).toUpperCase();
        return (
                <div className={`${styles.ccitemContent}`}>
                    <Link href={this.props.displayItem.ItemUrl} className={styles.ccRow}>
                        <div className={css('ms-font-su',styles.ccInitials)}>
                            {firstLetter}
                        </div>
                        <div className={styles.ccitemName}>
                            <span className={'ms-font-l'}>{this.props.displayItem.Title}</span>
                        </div>
                        <div className={styles.ccitemDesc}>{this.props.displayItem.Description}</div>
                    </Link>
                    <div className={styles.ccitemDesc}>
                        <PrimaryButton
                            data-automation-id='btnEdit'
                            iconProps={{ iconName: 'Edit' }}
                            text={strings.EditButtonLabel}
                            disabled={this.state.disableButtons}
                            onClick={this._editFavourite}
                            className={styles.ccButton}
                        />
                        <PrimaryButton
                            data-automation-id='btnDel'
                            iconProps={{ iconName: 'ErrorBadge' }}
                            text={strings.DeleteButtonLabel}
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
        this.setState({ status, disableButtons });
    }

    private _editFavourite = () => {
        let status: JSX.Element = <Spinner size={SpinnerSize.small} />;
        let disableButtons: boolean = true;
        this.setState({ status, disableButtons });

        this.props.editFavoutite(this.props.displayItem);

        status = <span></span>;
        disableButtons = false;
        this.setState({ status, disableButtons });
    }
}
