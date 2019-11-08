import { override } from '@microsoft/decorators';
import { Guid } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { ThumbnailDialog } from './components/ThumbnailDialog';
import { sp } from '@pnp/sp';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGetthumbnailCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

export default class GetthumbnailCommandSet extends BaseListViewCommandSet<IGetthumbnailCommandSetProperties> {
  private siteId: Guid;
  private listId: Guid;
  private folderId: string;

  @override
  protected onInit(): Promise<void> {
    return super.onInit().then(async _ => {
      sp.setup({
        spfxContext: this.context
      });

      //Get Site Id and List Id
      this.siteId = this.context.pageContext.site.id;
      this.listId = this.context.pageContext.list.id;

      //Get Content Type Id for Folder content type
      let folderContentTypeId = await sp.web.lists.getById(this.listId.toString()).contentTypes.select('StringId').filter(`Name eq 'Folder'`).get();
      this.folderId = folderContentTypeId[0].StringId;
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const thumbnailCommand: Command = this.tryGetCommand('GetThumbnail');
    if (thumbnailCommand) {
      if (event.selectedRows.length === 1) {
        //Hide Command Set for items with Folder Content Type as folders do not have a thumbnail image
        thumbnailCommand.visible = this.folderId !== event.selectedRows[0].getValueByName('ContentTypeId');
      } else {
        thumbnailCommand.visible = false;
      }
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'GetThumbnail':
        const dialog: ThumbnailDialog = new ThumbnailDialog({ isBlocking: true });
        let itemId = event.selectedRows[0].getValueByName('ID');

        dialog.data = {
          siteId: this.siteId,
          listId: this.listId,
          itemId: itemId
        };
        dialog.context = this.context;
        dialog.show();
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
