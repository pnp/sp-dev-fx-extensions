import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';


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
      // This command should be hidden unless exactly one row is selected.
      convertToPdfCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'CONVERT_TO_PDF':
        //Dialog.alert(`${this.properties.sampleTextOne}`);
        let siteUrl: string = this.context.pageContext.web.absoluteUrl;
        let itemName: string = event.selectedRows[0].getValueByName('FileLeafRef');
        let listName: string = `${this.context.pageContext.list.serverRelativeUrl}`.split("/").pop();
        let fullItemUrl: string = `${siteUrl}/${listName}/${itemName}`;
        let fileExtension: string = itemName.split('.').pop();
        this.startConversion(fullItemUrl, siteUrl, listName, fileExtension);
        break;
      default:
        throw new Error('Unknown command');
    }
  }


  private async startConversion(itemUrl: string, siteUrl: string, listName: string, fileExtension: string) {
    let swal: any = await import(
      /* webpackChunkName: 'sweetalert2' */
      'sweetalert2'
    )

    if (ALLOWED_EXTENSIONS.indexOf(fileExtension) > -1) {
      let azureFunctionUrl: string = `http://localhost:7071/api/ConvertDocumentToPDF?itemUrl=${itemUrl}&siteUrl=${siteUrl}&libraryName=${listName}`;

      swal({
        title: 'Enter the new document name',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Convert',
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
          swal({
            title: 'All done.',
            text: 'The document has now been converted to PDF.',
            type: 'success',
            confirmButtonColor: this.properties.confirmButtonColor
          }).then(() => {
            location.reload();
          });
        }
      })
    }
    else {
      swal({
        title: 'Cannot convert.',
        text: `Cannot convert document of type ${fileExtension} to PDF.`,
        type: 'info',
        confirmButtonColor: this.properties.confirmButtonColor
      })
    }


  }

}
