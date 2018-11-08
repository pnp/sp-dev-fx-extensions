import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import swal from 'sweetalert2';
import { SPComponentLoader } from '@microsoft/sp-loader';

export interface IConvertToPdfCommandSetProperties {
  confirmButtonColor: string;
}

const LOG_SOURCE: string = 'ConvertToPdfCommandSet';
const ALLOWED_EXTENSIONS: string[] = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"]

export default class ConvertToPdfCommandSet extends BaseListViewCommandSet<IConvertToPdfCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ConvertToPdfCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const convertToPdfCommand: Command = this.tryGetCommand('CONVERT_TO_PDF');
    if (convertToPdfCommand) {
      convertToPdfCommand.visible = event.selectedRows.length >= 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'CONVERT_TO_PDF':

        let siteUrl: string = this.context.pageContext.web.absoluteUrl;
        let listName: string = `${this.context.pageContext.list.serverRelativeUrl}`.split("/").pop();

        if (event.selectedRows.length === 1) {
          let itemName: string = event.selectedRows[0].getValueByName('FileLeafRef');
          let fileExtension: string = itemName.split('.').pop();
          if (ALLOWED_EXTENSIONS.indexOf(fileExtension) > -1) {
            this.startConversion(itemName, siteUrl, listName, false);
          }
          else {
            this.cannotConvert(fileExtension);
          }
        }
        else {
          let itemNames: string[] = [];
          let cannotConvert: boolean = false;
          let fileExtensionNotAllowed: string = "";
          for (let row of event.selectedRows) {
            let itemName: string = row.getValueByName('FileLeafRef');
            itemNames.push(itemName);
            let fullItemUrl: string = `${siteUrl}/${listName}/${itemName}`;
            let fileExtension: string = itemName.split('.').pop();
            if (ALLOWED_EXTENSIONS.indexOf(fileExtension) < 0) {
              cannotConvert = true;
              fileExtensionNotAllowed = fileExtension;
              break;
            }
          }
          if (cannotConvert == false) {
            let itemNamesString: string = itemNames.join(";");
            this.startConversion(itemNamesString, siteUrl, listName, true);
          }
          else {
            this.cannotConvert(fileExtensionNotAllowed);
          }
        }
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private cannotConvert(fileExtension: string) {
    swal({
      title: 'Cannot convert.',
      text: `Cannot convert document of type ${fileExtension} to PDF.`,
      type: 'info',
      confirmButtonColor: this.properties.confirmButtonColor
    })
  }

  private showSucessAndReload(messageToShow: string) {
    swal({
      title: 'All done.',
      text: messageToShow,
      type: 'success',
      confirmButtonColor: this.properties.confirmButtonColor
    }).then(() => {
      location.reload();
    });
  }


  private async startConversion(itemNames: string, siteUrl: string, listName: string, multiple: boolean) {
    SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');
    let azureFunctionUrl: string = `http://localhost:7071/api/ConvertDocumentToPDF?itemNames=${itemNames}&siteUrl=${siteUrl}&libraryName=${listName}`;

    if (!multiple) {

      swal({
        title: 'Enter the new document name',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-check"></i> Convert',
        cancelButtonText: '<i class="fa fa-times"></i> Cancel',
        confirmButtonColor: this.properties.confirmButtonColor,
        showLoaderOnConfirm: true,
        inputValidator: (value) => {
          return !value && 'Please enter a value'
        },
        preConfirm: (newDocumentName) => {
          return fetch(`${azureFunctionUrl}&newDocumentName=${newDocumentName}`)
            .then(response => {

              if (!response.ok) {
                throw new Error(response.statusText)
              }
              return response.json()
            })
            .catch(error => {
              swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        },
        allowOutsideClick: () => !swal.isLoading()
      }).then((result) => {
        if (result.value) {
          this.showSucessAndReload("The document has now been converted to PDF.");
        }
      })
    }
    else {

      swal({
        title: 'Are you sure?',
        text: "All the selected documents will be converted to PDF.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-check"></i> Convert',
        cancelButtonText: '<i class="fa fa-times"></i> Cancel',
        confirmButtonColor: this.properties.confirmButtonColor,
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return fetch(azureFunctionUrl)
            .then(response => {

              if (!response.ok) {
                throw new Error(response.statusText)
              }
              return response.json()
            })
            .catch(error => {
              swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        }
      }).then((result) => {
        if (result.value) {
          this.showSucessAndReload("The documents have now been converted to PDF.");
        }
      })
    }
  }

}
