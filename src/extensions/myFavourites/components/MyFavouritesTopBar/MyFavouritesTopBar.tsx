import * as React from "react";
import * as ReactDOM from "react-dom";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { List } from "office-ui-fabric-react/lib/List";
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { IMyFavouritesTopBarProps } from "./IMyFavouritesTopBarProps";
import { IMyFavouritesTopBarState } from "./IMyFavouritesTopBarState";
import { MyFavouritesService } from "../../../services/MyFavouritesService";
import { IMyFavouriteItem } from "../../../interfaces/IMyFavouriteItem";
import MyFavoutiteDisplayItem from "../MyFavoutiteDisplayItem/MyFavoutiteDisplayItem";
import styles from "../MyFavourites.module.scss";

export default class MyFavouritesTopBar extends React.Component<IMyFavouritesTopBarProps, IMyFavouritesTopBarState> {
    private _self = this;
    private _MyFavouritesServiceInstance: MyFavouritesService;
    private _MyFavouriteItems: IMyFavouriteItem[] =[];
    constructor(props: IMyFavouritesTopBarProps) {
        super(props);
        this.state = {
            showPanel: false,
            showDialog: false,
            dialogTitle: "",
            myFavouriteItems: [],
            itemInContext: {
                Id: 0,
                Title: "",
                Description: "",
            },
            isEdit: false,
            status: <Spinner size={SpinnerSize.large} label="Loading..." />,
            disableButtons: false
        };

        this._MyFavouritesServiceInstance = new MyFavouritesService(this.props);
        this._getMyFavourites.bind(this);
    }

    public render(): React.ReactElement<IMyFavouritesTopBarProps> {
        return (
            <div className={styles.ccTopBar}>
                <PrimaryButton data-id="menuButton"
                    title="Show My Favourites"
                    text="Show My Favourites"
                    ariaLabel="Show My Favourites"
                    iconProps={{ iconName: "View" }}
                    className={styles.ccTopBarButton}
                    onClick={this._showMenu.bind(this)}
                />
                <PrimaryButton data-id="menuButton"
                    title="Add this page to My Favourites"
                    text="Add to My Favourites"
                    ariaLabel="Add to My Favourites"
                    iconProps={{ iconName: "Add" }}
                    className={styles.ccTopBarButton}
                    onClick={this._showDialog.bind(this)}
                />
                <Panel isOpen={this.state.showPanel}
                    type={PanelType.medium}
                    onDismiss={this._hideMenu.bind(this)}
                    headerText="My Favourites"
                    headerClassName={`ms-font-xl ${styles.ccPanelHeader}`}
                    isLightDismiss={ true }
                >
                    <div data-id="menuPanel">
                    <TextField placeholder="Filter favourites..."
                               iconProps={ { iconName: "Filter" } }
                               onBeforeChange={ this._onFilterChanged.bind(this) } />
                        <div>
                            {this.state.status}
                        </div>
                        <FocusZone direction={ FocusZoneDirection.vertical }>
                        { this.state.myFavouriteItems.length > 0 ? 
                            <List
                                items = { this.state.myFavouriteItems }
                                onRenderCell={ this._onRenderCell.bind(this) }
                            /> :
                            <MessageBar
                                messageBarType={ MessageBarType.warning }
                                isMultiline={ false }>
                                You do not have any favourites.
                            </MessageBar>
                        }
                        </FocusZone>
                    </div>
                </Panel>
                <Dialog
                    hidden={!this.state.showDialog}
                    onDismiss={this._hideDialog}
                    dialogContentProps={{
                        type: DialogType.largeHeader,
                        title: this.state.dialogTitle
                    }}
                    modalProps={{
                        titleAriaId: "myFavDialog",
                        subtitleAriaId: "myFavDialog",
                        isBlocking: false,
                        containerClassName: "ms-dialogMainOverride"
                    }}
                >
                    <div>
                        {this.state.status}
                    </div>
                    <TextField label="Title"
                               onChanged={this._setTitle.bind(this)}
                               value={this.state.itemInContext.Title} />
                    <TextField label="Description"
                                multiline rows={4}
                                onChanged={this._setDescription.bind(this)}
                                value={this.state.itemInContext.Description} />
                    <DialogFooter>
                        <PrimaryButton onClick={this._saveMyFavourite.bind(this)}
                                       disabled={this.state.disableButtons}
                                       text="Save" iconProps={{ iconName: "Save" }}
                                       className={styles.ccDialogButton}/>
                        <DefaultButton onClick={this._hideDialog.bind(this)}
                                       disabled={this.state.disableButtons}
                                       text="Cancel"
                                       iconProps={{ iconName: "Cancel" }} />
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }

    //#region CRUD
    public async deleteFavourite(favouriteItemId: number): Promise<void> {
        let result: boolean = await this._MyFavouritesServiceInstance.deleteFavourite(favouriteItemId);
        if (result) {
            this._getMyFavourites();
        }
    }

    public editFavourite(favouriteItem: IMyFavouriteItem): void {
        console.log(favouriteItem);
        let status: JSX.Element = <span></span>;
        let dialogTitle: string = "Edit favourite";
        this.setState({ ...this.state, showPanel: false, itemInContext: favouriteItem, isEdit: true, showDialog: true, dialogTitle, status });
    }

    private async _getMyFavourites(): Promise<void> {
        let status: JSX.Element = <Spinner size={SpinnerSize.large} label='Loading...' />;
        this.setState({ ...this.state, status });

        const myFavouriteItems: IMyFavouriteItem[] = await this._MyFavouritesServiceInstance.getMyFavourites(true);
        this._MyFavouriteItems = myFavouriteItems;
        status = <span></span>;
        this.setState({ ...this.state, myFavouriteItems, status });
    }

    private async _saveMyFavourite(): Promise<void> {
        let status: JSX.Element = <Spinner size={SpinnerSize.large} label='Loading...' />;
        let disableButtons: boolean = true;
        this.setState({ ...this.state, status, disableButtons });
        let itemToSave: IMyFavouriteItem = {
            Title: this.state.itemInContext.Title,
            Description: this.state.itemInContext.Description
        };
        let itemToEdit: IMyFavouriteItem = { ...itemToSave, Id: this.state.itemInContext.Id };
        let result: boolean = this.state.isEdit ? await this._MyFavouritesServiceInstance.updateFavourite(itemToEdit) : await this._MyFavouritesServiceInstance.saveFavourite(itemToSave);
        if (result) {
            status = <MessageBar
                        messageBarType={ MessageBarType.success }
                        isMultiline={ false }>
                        Done!
                    </MessageBar>;
        } else {
            status = <MessageBar
                        messageBarType={ MessageBarType.error }
                        isMultiline={ false }>
                        There was an error!
                    </MessageBar>;
        }
        disableButtons = false;
        this.setState({ ...this.state, status, disableButtons });
    }
    //#endregion

    //#region Render related
    private _showMenu(): void {
        this._getMyFavourites();
        this.setState({ showPanel: true });
    }

    private _hideMenu(): void {
        this.setState({ showPanel: false });
    }

    private _showDialog(): void {
        let itemInContext: IMyFavouriteItem = {
            Id: 0,
            Title: "",
            Description: "",
        };
        let isEdit: boolean = false;
        let status: JSX.Element = <span></span>;
        let dialogTitle: string = "Add to my favourites";
        this.setState({ ...this.state, itemInContext, isEdit, showDialog: true, dialogTitle, status });
    }

    private _hideDialog(): void {
        this.setState({ showDialog: false });
    }

    private _onRenderCell(myFavouriteItem: IMyFavouriteItem, index: number | undefined): JSX.Element {
        let animationClass: string = `ms-slideDownIn20`;
        return (
            <div className={`${animationClass} ${styles.ccitemCell}`} data-is-focusable={ true }>
                 <MyFavoutiteDisplayItem
                    displayItem={myFavouriteItem}
                    deleteFavourite={this.deleteFavourite.bind(this)}
                    editFavoutite={this.editFavourite.bind(this)} />
            </div>
        );
    }

    private _onFilterChanged(text: string): void {
        let items: IMyFavouriteItem[] = this._MyFavouriteItems;
        this.setState({
            myFavouriteItems: text ?
            items.filter(item => item.Title.toLowerCase().indexOf(text.toLowerCase()) >= 0) :
            items
        });
    }

    //#endregion

    private _setTitle(value: string): void {
        let itemInContext: IMyFavouriteItem = this.state.itemInContext;
        itemInContext.Title = value;
        this.setState({ ...this.state, itemInContext });
    }

    private _setDescription(value: string): void {
        let itemInContext: IMyFavouriteItem = this.state.itemInContext;
        itemInContext.Description = value;
        this.setState({ ...this.state, itemInContext });
    }

}
