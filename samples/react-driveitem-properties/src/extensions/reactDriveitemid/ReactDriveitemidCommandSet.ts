import { Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs,
} from "@microsoft/sp-listview-extensibility";
import { IDriveItemInfoProps } from "./models/IDriveItemInfo";
import { DriveItemInfo } from "./components/DriveItemInfo";
import * as React from "react";
import * as ReactDom from "react-dom";
import { getThemeColor } from "../../common/ThemeHelper";
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IReactDriveitemidCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = "ReactDriveitemidCommandSet";

export default class ReactDriveitemidCommandSet extends BaseListViewCommandSet<IReactDriveitemidCommandSetProperties> {
  private driveInfoPlaceholder: HTMLDivElement;
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Initialized ReactDriveitemidCommandSet");
    // initial state of the command's visibility
    const driveDetailsCommand: Command = this.tryGetCommand("GETDRIVEDETAILS");

    // Get proper theme color
    const fillColor = getThemeColor("themeDarkAlt").replaceAll("#", "%23");

    //const copyPathSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2048 2048'%3E%3Cpath d='M901 1472q0 65 37 113t97 70q-3 18-5 36t-2 37q0 14 1 29t4 29q-57-11-104-39t-82-70-54-94-19-111q0-66 25-124t67-101 101-69 124-26h254q65 0 123 25t101 70 68 102 25 123q0 56-19 108t-52 94-81 71-102 40v-133q57-22 92-69t35-111q0-39-15-74t-40-61-60-42-75-15h-254q-40 0-75 15t-60 41-40 61-15 75zm1147 253q0 66-25 125t-68 103-102 69-125 26h-256q-67 0-125-25t-101-70-69-103-25-125q0-56 19-108t53-95 81-73 103-40v133q-29 10-52 28t-40 43-26 53-10 59q0 40 15 75t41 62 61 42 75 16h256q40 0 75-15t61-43 41-62 15-75q0-31-10-60t-27-54-43-43-55-28q3-18 5-36t2-37q0-15-2-29t-4-29q57 11 105 40t83 71 54 94 20 111zM128 128v1792h896v128H0V0h1115l549 549v475h-128V640h-512V128H128zm1024 91v293h293l-293-293z' fill='${fillColor}'%3E%3C/path%3E%3C/svg%3E`;
    const drivePathSVG = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%202048%202048%22%3E%3Cpath%20d%3D%22M1856%20640q40%200%2075%2015t61%2041%2041%2061%2015%2075v576H0V832q0-40%2015-75t41-61%2061-41%2075-15h1664zm64%20192q0-26-19-45t-45-19H192q-26%200-45%2019t-19%2045v448h1792V832zm-256%2064h128v128h-128V896zm-256%200h128v128h-128V896z%22%20fill='${fillColor}'%3E%3C%2Fpath%3E%3C%2Fsvg%3E`;
    driveDetailsCommand.iconImageUrl = drivePathSVG;
    driveDetailsCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(
      this,
      this._onListViewStateChanged
    );
    this.driveInfoPlaceholder = document.body.appendChild(
      document.createElement("div")
    );
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    let element: React.ReactElement;
    switch (event.itemId) {
      case "GETDRIVEDETAILS": {
        const itemUrl = event.selectedRows?.[0]?.getValueByName(".spItemUrl");
        element = React.createElement<IDriveItemInfoProps>(DriveItemInfo, {
          itemUrl: itemUrl,
        });
        break;
      }

      default:
        throw new Error("Unknown command");
    }

    ReactDom.render(element, this.driveInfoPlaceholder);
  }

  private _onListViewStateChanged = (
    args: ListViewStateChangedEventArgs
  ): void => {
    Log.info(LOG_SOURCE, "List view state changed");

    const driveDetailsCommand: Command = this.tryGetCommand("GETDRIVEDETAILS");
    if (driveDetailsCommand) {
      // This command should be hidden unless exactly one row is selected.
      driveDetailsCommand.visible =
        this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
    ReactDom.unmountComponentAtNode(this.driveInfoPlaceholder);
  };
}
