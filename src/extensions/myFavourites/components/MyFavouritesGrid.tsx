import * as React from "react";
import * as ReactDOM from "react-dom";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { List } from 'office-ui-fabric-react/lib/List';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { IMyFavouritesProps } from "./IMyFavouritesProps";
import { IMyFavouritesState } from "./IMyFavouritesState";
import { ServiceScope } from "@microsoft/sp-core-library";
import { IMyFavoutitesService } from "../../services/IMyFavouritesService";
import { MyFavouriteService } from "../../services/MyFavouriteService";
import { IMyFavouriteItem } from "../../interfaces/IMyFavouriteItem";
import MyFavoutiteDisplayItem from "./MyFavoutiteDisplayItem/MyFavoutiteDisplayItem";
import styles from "./MyFavourites.module.scss";

export default class MyFavouritesGrid extends React.Component<IMyFavouritesProps, IMyFavouritesState> {
    private _self = this;
    private _MyFavouritesServiceInstance: IMyFavoutitesService;

    constructor(props: IMyFavouritesProps) {
        super(props);
        this.state = {
            showPanel: false,
            showDialog: false,
            myFavouriteItems: [],
            itemInContext: {
                Id: 0,
                Title: " ",
                Description: " ",
            },
            isEdit: false,
            status: <Spinner size={SpinnerSize.large} label='Loading...' />,
            disableButtons: false
        };

        let serviceScope: ServiceScope;
        serviceScope = this.props.serviceScope

        this._MyFavouritesServiceInstance = serviceScope.consume(MyFavouriteService.serviceKey);
        this._getMyFavourites.bind(this);
    }

    public async deleteFavourite(favouriteItemId: number) {
        let result: boolean = await this._MyFavouritesServiceInstance.deleteFavourite(favouriteItemId);
        if (result) {
            this._getMyFavourites();
        }
    }

    public editFavourite(favouriteItem: IMyFavouriteItem) {
        console.log(favouriteItem);
        let status: JSX.Element = <span></span>;
        this.setState({ ...this.state, showPanel: false, itemInContext: favouriteItem, isEdit: true, showDialog: true, status });
    }

    private async _getMyFavourites(): Promise<void> {
        let status: JSX.Element = <Spinner size={SpinnerSize.large} label='Loading...' />;
        this.setState({ ...this.state, status });

        const myFavouriteItems: IMyFavouriteItem[] = await this._MyFavouritesServiceInstance.getMyFavourites(true);

        status = <span></span>;
        this.setState({ ...this.state, myFavouriteItems, status });
    }

    public render(): React.ReactElement<IMyFavouritesProps> {
        return (
            <div>
                <DefaultButton data-id="menuButton"
                    title="Show My Favourites"
                    text="Show My Favourites"
                    ariaLabel="Show My Favourites"
                    onClick={this._showMenu.bind(this)}
                />
                <DefaultButton data-id="menuButton"
                    title="Add this page to My Favourites"
                    text="Add to My Favourites"
                    ariaLabel="Add to My Favourites"
                    onClick={this._initAdd.bind(this)}
                />

                <Panel isOpen={this.state.showPanel}
                    type={PanelType.medium}
                    onDismiss={this._hideMenu.bind(this)}
                    headerText="My Favourites"
                >
                    <div data-id="menuPanel">
                        <div>
                            {this.state.status}
                        </div>
                        <FocusZone direction={ FocusZoneDirection.vertical }>
                            <List 
                                items = { this.state.myFavouriteItems }
                                onRenderCell={ this._onRenderCell.bind(this) }
                            />
                        </FocusZone>
                    </div>
                </Panel>

                <Dialog
                    hidden={!this.state.showDialog}
                    onDismiss={this._hideDialog}
                    dialogContentProps={{
                        type: DialogType.largeHeader,
                        title: 'Add to my favourites'
                    }}
                    modalProps={{
                        titleAriaId: 'myLabelId',
                        subtitleAriaId: 'mySubTextId',
                        isBlocking: false,
                        containerClassName: 'ms-dialogMainOverride'
                    }}
                >
                    <div>
                        {this.state.status}
                    </div>
                    <TextField label='Title' onChanged={this._getTitle.bind(this)} value={this.state.itemInContext.Title} />
                    <TextField label='Description' multiline rows={4} onChanged={this._getDescription.bind(this)} value={this.state.itemInContext.Description} />

                    {null /** You can also include null values as the result of conditionals */}
                    <DialogFooter>
                        <PrimaryButton onClick={this._saveItem.bind(this)} disabled={this.state.disableButtons} text='Save' />
                        <DefaultButton onClick={this._hideDialog.bind(this)} disabled={this.state.disableButtons} text='Cancel' />
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }

    private _initAdd() {
        this.setState(
            {
                itemInContext: {
                    Id: 0,
                    Title: " ",
                    Description: " ",
                },
                isEdit: false
            }
        );
        this._showDialog();
    }

    private _showMenu(): void {
        this._getMyFavourites();
        this.setState({ showPanel: true });
    }

    private _hideMenu(): void {
        this.setState({ showPanel: false });
    }

    private _showDialog(): void {
        let status: JSX.Element = <span></span>;
        this.setState({ ...this.state, showDialog: true, status });
    }

    private _hideDialog(): void {
        this.setState({ showDialog: false });
    }

    private async _saveItem(): Promise<void> {
        let status: JSX.Element = <Spinner size={SpinnerSize.large} label='Loading...' />;
        let disableButtons: boolean = true;
        this.setState({ ...this.state, status, disableButtons });

        let itemToSave: IMyFavouriteItem = {
            Title: this.state.itemInContext.Title,
            Description: this.state.itemInContext.Description
        }

        console.log(itemToSave);

        let itemToEdit: IMyFavouriteItem = { ...itemToSave, Id: this.state.itemInContext.Id };

        let result: boolean = this.state.isEdit ? await this._MyFavouritesServiceInstance.updateFavourite(itemToEdit) : await this._MyFavouritesServiceInstance.saveFavourite(itemToSave);
        console.log(result);

        if (result) {
            status = <span>Done!</span>;
        }
        else {
            status = <span>There was an error!</span>;
        }
        disableButtons = false;
        this.setState({ ...this.state, status, disableButtons });
    }

    private _getTitle(value: string): void {
        let itemInContext: IMyFavouriteItem = this.state.itemInContext;
        itemInContext.Title = value;
        this.setState({ ...this.state, itemInContext });
    }

    private _getDescription(value: string): void {
        let itemInContext: IMyFavouriteItem = this.state.itemInContext;
        itemInContext.Description = value;
        this.setState({ ...this.state, itemInContext });
    }

    private _onRenderCell(myFavouriteItem: IMyFavouriteItem, index: number | undefined): JSX.Element{
        return (
            <div className={styles.msListBasicExampleitemCell} data-is-focusable={ true }>
                 <MyFavoutiteDisplayItem
                    displayItem={myFavouriteItem}
                    deleteFavourite={this.deleteFavourite.bind(this)}
                    editFavoutite={this.editFavourite.bind(this)} />
            </div>
        )
    }
}
