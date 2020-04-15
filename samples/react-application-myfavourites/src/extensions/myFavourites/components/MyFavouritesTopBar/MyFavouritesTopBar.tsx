import * as React from "react";
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
import { MyFavouriteDisplayItem } from '../MyFavouriteDisplayItem';
import { css } from "@uifabric/utilities/lib/css";
import styles from "../MyFavourites.module.scss";
import * as strings from 'MyFavouritesApplicationCustomizerStrings';

export class MyFavouritesTopBar extends React.Component<IMyFavouritesTopBarProps, IMyFavouritesTopBarState> {
  private _MyFavouritesServiceInstance: MyFavouritesService;
  private _MyFavouriteItems: IMyFavouriteItem[] = [];
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
      status: <Spinner size={SpinnerSize.large} label={strings.LoadingStatusLabel} />,
      disableButtons: false
    };

    this._MyFavouritesServiceInstance = new MyFavouritesService(this.props);
    this._getMyFavourites.bind(this);
  }

  public render(): React.ReactElement<IMyFavouritesTopBarProps> {
    return (
      <div className={styles.ccTopBar}>
        <PrimaryButton data-id="menuButton"
          title={strings.ShowMyFavouritesLabel}
          text={strings.ShowMyFavouritesLabel}
          ariaLabel={strings.ShowMyFavouritesLabel}
          iconProps={{ iconName: "View" }}
          className={styles.ccTopBarButton}
          onClick={this._showMenu}
        />
        <PrimaryButton data-id="menuButton"
          title={strings.AddPageToFavouritesLabel}
          text={strings.AddPageToFavouritesLabel}
          ariaLabel={strings.AddPageToFavouritesLabel}
          iconProps={{ iconName: "Add" }}
          className={styles.ccTopBarButton}
          onClick={this._showDialog}
        />
        <Panel isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._hideMenu}
          headerText={strings.MyFavouritesHeader}
          isLightDismiss={true}
        >

          <div data-id="menuPanel">
            <TextField placeholder={strings.FilterFavouritesPrompt}
              iconProps={{ iconName: "Filter" }}
              onChange={this._onFilterChanged} />
            <div>
              {this.state.status}
            </div>
            <FocusZone direction={FocusZoneDirection.vertical}>
              {this.state.myFavouriteItems.length > 0 ?
                <List
                  items={this.state.myFavouriteItems}
                  onRenderCell={this._onRenderCell}
                /> :
                <MessageBar
                  messageBarType={MessageBarType.warning}
                  isMultiline={false}>
                  {strings.NoFavouritesLabel}
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
          <TextField label={strings.TitleFieldName}
            onChange={this._setTitle}
            value={this.state.itemInContext.Title} />
          <TextField label={strings.DescriptionFieldName}
            multiline rows={4}
            onChange={this._setDescription}
            value={this.state.itemInContext.Description} />
          <DialogFooter>
            <PrimaryButton onClick={_event => this._saveMyFavourite()}
              disabled={this.state.disableButtons}
              text={strings.SaveButtonLabel}
            />
            <DefaultButton onClick={this._hideDialog}
              disabled={this.state.disableButtons}
              text={strings.CancelButtonLabel}
            />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }

  public async deleteFavourite(favouriteItemId: number): Promise<void> {
    let result: boolean = await this._MyFavouritesServiceInstance.deleteFavourite(favouriteItemId);
    if (result) {
      this._getMyFavourites();
    }
  }

  public editFavourite(favouriteItem: IMyFavouriteItem): void {
    let status: JSX.Element = <span></span>;
    let dialogTitle: string = strings.EditFavouritesDialogTitle;
    this.setState({ showPanel: false, itemInContext: favouriteItem, isEdit: true, showDialog: true, dialogTitle, status });
  }

  private async _getMyFavourites(): Promise<void> {
    let status: JSX.Element = <Spinner size={SpinnerSize.large} label={strings.LoadingStatusLabel} />;
    this.setState({ status });

    const myFavouriteItems: IMyFavouriteItem[] = await this._MyFavouritesServiceInstance.getMyFavourites(true);
    this._MyFavouriteItems = myFavouriteItems;
    status = <span></span>;
    this.setState({ myFavouriteItems, status });
  }

  private async _saveMyFavourite(): Promise<void> {
    let status: JSX.Element = <Spinner size={SpinnerSize.large} label={strings.SavingStatusLabel} />;
    let disableButtons: boolean = true;
    this.setState({ status, disableButtons });
    let itemToSave: IMyFavouriteItem = {
      Title: this.state.itemInContext.Title,
      Description: this.state.itemInContext.Description
    };
    let itemToEdit: IMyFavouriteItem = { ...itemToSave, Id: this.state.itemInContext.Id };
    let result: boolean = this.state.isEdit ? await this._MyFavouritesServiceInstance.updateFavourite(itemToEdit) : await this._MyFavouritesServiceInstance.saveFavourite(itemToSave);
    if (result) {
      this._hideDialog();
    } else {
      status = <MessageBar
        messageBarType={MessageBarType.error}
        isMultiline={false}>
        There was an error!
                    </MessageBar>;
    }
    disableButtons = false;
    this.setState({ status, disableButtons });
  }

  private _showMenu = () => {
    this._getMyFavourites();
    this.setState({ showPanel: true });
  }

  private _hideMenu = () => {
    this.setState({ showPanel: false });
  }

  private _showDialog = () => {
    let itemInContext: IMyFavouriteItem = {
      Id: 0,
      Title: "",
      Description: "",
    };
    let isEdit: boolean = false;
    let status: JSX.Element = <span></span>;
    let dialogTitle: string = strings.AddToFavouritesDialogTitle;
    this.setState({ itemInContext, isEdit, showDialog: true, dialogTitle, status });
  }

  private _hideDialog = () => {
    this.setState({ showDialog: false });
  }

  private _onRenderCell = (myFavouriteItem: IMyFavouriteItem, _index: number | undefined): JSX.Element => {
    return (
      <div className={css('ms-slideDownIn20', styles.ccitemCell)} data-is-focusable={true}>
        <MyFavouriteDisplayItem
          displayItem={myFavouriteItem}
          deleteFavourite={(favouriteItemId: number)=>this.deleteFavourite(favouriteItemId)}
          editFavoutite={this.editFavourite} />
      </div>
    );
  }

  private _onFilterChanged = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    let items: IMyFavouriteItem[] = this._MyFavouriteItems;
    this.setState({
      myFavouriteItems: newValue ?
        items.filter(item => item.Title.toLowerCase().indexOf(newValue.toLowerCase()) >= 0) :
        items
    });
  }

  private _setTitle = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    const { itemInContext } = this.state;
    itemInContext.Title = newValue;
    this.setState({ itemInContext });
  }

  private _setDescription = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    const { itemInContext } = this.state;
    itemInContext.Description = newValue;
    this.setState({ itemInContext });
  }
}
