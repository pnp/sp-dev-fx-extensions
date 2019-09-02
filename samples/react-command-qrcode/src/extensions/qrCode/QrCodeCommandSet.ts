import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'QrCodeCommandSetStrings';
import { QRDialog } from './components/QRDialog';

import styles from './QrCodeCommandSet.module.scss';


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IQrCodeCommandSetProperties {

}

const LOG_SOURCE: string = 'QrCodeCommandSet';

export default class QrCodeCommandSet extends BaseListViewCommandSet<IQrCodeCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized QrCodeCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    // Get the command
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');

    if (compareOneCommand) {
      // This command should be hidden if more than 1 item is selected
      compareOneCommand.visible = event.selectedRows.length < 2;

      // This next part is completely unnecessary! I just do it because I wanted my extension icon to
      // match the theme

      // Escape '#' from Hex colours as they are a reserved character in URLs
      const fillColor: string = styles.iconFill.replace('#', '%23');

      // Set the SVG with the `fill` color set to the current theme color
      compareOneCommand.iconImageUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='32' height='32' viewBox='0 0 401.994 401.994' style='enable-background:new 0 0 401.994 401.994;fill:${fillColor};' xml:space='preserve' %3E %3Cg%3E %3Cg%3E %3Cpath d='M0,401.991h182.724V219.265H0V401.991z M36.542,255.813h109.636v109.352H36.542V255.813z'/%3E %3Crect x='73.089' y='292.355' width='36.544' height='36.549'/%3E %3Crect x='292.352' y='365.449' width='36.553' height='36.545'/%3E %3Crect x='365.442' y='365.449' width='36.552' height='36.545'/%3E %3Cpolygon points='365.446,255.813 328.904,255.813 328.904,219.265 219.265,219.265 219.265,401.991 255.813,401.991 255.813,292.355 292.352,292.355 292.352,328.904 401.991,328.904 401.991,219.265 401.991,219.265 365.446,219.265 '/%3E %3Cpath d='M0,182.728h182.724V0H0V182.728z M36.542,36.542h109.636v109.636H36.542V36.542z'/%3E %3Crect x='73.089' y='73.089' width='36.544' height='36.547'/%3E %3Cpath d='M219.265,0v182.728h182.729V0H219.265z M365.446,146.178H255.813V36.542h109.633V146.178z'/%3E %3Crect x='292.352' y='73.089' width='36.553' height='36.547'/%3E %3C/g%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3Cg%3E %3C/g%3E %3C/svg%3E`;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        const { site, list } = this.context.pageContext;
        // Get the site url from the page content
        const siteUrl = site.absoluteUrl;

        // Get the relative URL
        const siteRelativeUrl: string = site.serverRelativeUrl;

        // Find where the tenant name ends
        const endIndex = siteUrl.lastIndexOf(siteRelativeUrl);

        // Get the root site URL by removing the site name
        const rootSiteUrl = siteUrl.substring(0, endIndex);

        // We'll need the file's relative URL, the file name, and absolute URL
        let relativeUrl: string = "";
        let absoluteUrl: string = "";
        let fileName: string = "";

        // See if there is an item currently selected
        if (event.selectedRows.length > 0) {
          // If an item is selected, get the selected item's information
          relativeUrl = event.selectedRows[0].getValueByName('FileRef');
          fileName = event.selectedRows[0].getValueByName('FileLeafRef');
          absoluteUrl = `${rootSiteUrl}${relativeUrl}`;
        } else {
          // If no item is selected, get the link to the list
          relativeUrl = list.serverRelativeUrl;
          fileName = list.title;
          absoluteUrl = `${rootSiteUrl}${relativeUrl}`;
        }

        // Build a callout dialog
        const callout: QRDialog = new QRDialog();
        callout.fileName = fileName;
        callout.absolutePath = absoluteUrl;
        callout.show();
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
