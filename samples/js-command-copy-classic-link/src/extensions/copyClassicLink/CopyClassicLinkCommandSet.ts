import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { SPComponentLoader } from '@microsoft/sp-loader';

import * as copy from 'copy-to-clipboard';

export interface ICopyClassicLinkCommandSetProperties {
  showToastr: string;
}

const LOG_SOURCE: string = 'CopyClassicLinkCommandSet';

export default class CopyClassicLinkCommandSet extends BaseListViewCommandSet<ICopyClassicLinkCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CopyClassicLinkCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const copyClassicLinkCommand: Command = this.tryGetCommand('COPY_CLASSIC_LINK');
    if (copyClassicLinkCommand) {
      // This command should be hidden unless exactly one row is selected.
      copyClassicLinkCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COPY_CLASSIC_LINK':
        let itemName: string = event.selectedRows[0].getValueByName('FileLeafRef');
        let listName: string = `${this.context.pageContext.list.serverRelativeUrl}`.split("/").pop();
        let fullItemUrl: string = `${this.context.pageContext.web.absoluteUrl}/${listName}/${itemName}`;
        copy(fullItemUrl);
        if (this.properties.showToastr.toLowerCase() === "yes") {
          this.showToastr();
        }
        else {
          this.showSwal(fullItemUrl);
        }
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private async showToastr() {
    let toastr: any = await import(
      /* webpackChunkName: 'toastr-js' */
      'toastr'
    );
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css');
    toastr.success("Link copied. Press Ctrl+V to use it.");
  }

  private async showSwal(fullItemUrl: string) {
    let imageExtensions: Array<string> = ["jpg", "jpeg", "png"]
    let re = /(?:\.([^.]+))?$/;
    let ext = re.exec(fullItemUrl);

    let swal: any = await import(
      /* webpackChunkName: 'sweetalert2' */
      'sweetalert2'
    )
    if (imageExtensions.indexOf(ext[1]) > -1) {
      swal({
        title: 'Link copied.',
        text: 'Press Ctrl+V to use it.',
        type: 'success',
        imageUrl: fullItemUrl,
        imageHeight: 50,
        imageAlt: 'Image'
      });
    }
    else {
      swal(
        'Link copied.',
        'Press Ctrl+V to use it.',
        'success'
      );
    }
  }
}
