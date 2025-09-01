import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { SPPermission } from '@microsoft/sp-page-context';
import { AadHttpClient } from '@microsoft/sp-http';
import ArchiveDialog from './ArchiveDialog';
import { AZURE_FUNCTION_APP_ID, AZURE_FUNCTION_URL } from '../../config';

/**
 * Configuration properties for the Archive Document Command Set
 */
export interface IArchiveDocumentCommandSetProperties {
  /**
   * Azure Function URL for archiving documents
   */
  azureFunctionUrl?: string;
}

const LOG_SOURCE: string = 'ArchiveDocumentCommandSet';

export default class ArchiveDocumentCommandSet extends BaseListViewCommandSet<IArchiveDocumentCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ArchiveDocumentCommandSet');

    // Initial state of the archive command's visibility
    const archiveCommand: Command = this.tryGetCommand('ARCHIVE_COMMAND');
    if (archiveCommand) {
      archiveCommand.visible = false;
    }

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'ARCHIVE_COMMAND':
        this._showArchiveDialog();
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const archiveCommand: Command = this.tryGetCommand('ARCHIVE_COMMAND');
    if (archiveCommand) {
      // Check if user has edit permissions and at least one item is selected
      const hasEditPermissions = this.context.pageContext.list?.permissions?.hasPermission(SPPermission.editListItems) ?? false;
      const hasSelectedItems = (this.context.listView.selectedRows?.length ?? 0) >= 1;
      
      archiveCommand.visible = hasEditPermissions && hasSelectedItems;
    }

    // Update the command bar
    this.raiseOnChange();
  }

  /**
   * Shows the archive dialog with options to archive or delete documents
   */
  private _showArchiveDialog(): void {
    const selectedItems = this.context.listView.selectedRows;
    if (!selectedItems || selectedItems.length === 0) {
      return;
    }

    const dialog = new ArchiveDialog({
      itemCount: selectedItems.length,
      onArchive: () => this._archiveSelectedItems(),
    });

    dialog.show().catch(() => { /* ignore dialog errors */ });
  }

  /**
   * Archives the selected items using Azure Function
   */
  private _archiveSelectedItems(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const selectedItems = this.context.listView.selectedRows;
      if (!selectedItems || selectedItems.length === 0) {
        resolve(true);
        return;
      }

      const azureFunctionUrl = AZURE_FUNCTION_URL + '/api/MoveDoc2Blob';
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const listId = this.context.pageContext.list?.id?.toString();

      if (!listId) {
        Dialog.alert('Unable to determine list ID for archiving.').catch(() => { /* ignore */ });
        reject(new Error('Unable to determine list ID for archiving'));
        return;
      }

      this.context.aadHttpClientFactory.getClient(AZURE_FUNCTION_APP_ID)
        .then((client) => {
          // Create promises for all items to process them in parallel
          const archivePromises = selectedItems.map((item) => {
            const itemId = item.getValueByName('ID');
            
            const requestData = {
              ListID: listId,
              ItemID: itemId.toString(),
              SiteURL: siteUrl
            };

            return client.fetch(azureFunctionUrl, AadHttpClient.configurations.v1, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestData)
            }).then((response) => {
              if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
                return response.text().then((errorText) => {
                  throw new Error(`Archive failed for item ${itemId}: ${errorText}`);
                }).catch(() => {
                  throw new Error(`Archive failed for item ${itemId}: ${response.statusText}`);
                });
              }

              return response.json().then((result) => {
                Log.info(LOG_SOURCE, `Item ${itemId} archived successfully`);
                
                // Delete the item after successful archive (fire and forget)
                this._deleteSelectedItem(itemId).catch((deleteError) => {
                  Log.error(LOG_SOURCE, deleteError);
                });

                return result;
              });
            });
          });

          // Wait for all archive operations to complete
          return Promise.all(archivePromises);
        })
        .then((results) => {
          // All items processed successfully
          Dialog.alert(`Successfully archived ${selectedItems.length} item(s).`).then(() => {
            window.location.reload();
            resolve(true);
          }).catch(() => { 
            window.location.reload();
            resolve(true);
          });
        })
        .catch((error) => {
          Log.error(LOG_SOURCE, error);
          Dialog.alert(`Error archiving items: ${error.message}`).catch(() => { /* ignore */ });
          reject(error);
        });
    });
  }

  /**
   * Deletes the selected items and moves them to recycle bin
   */
  private async _deleteSelectedItem(itemId:string): Promise<boolean> {
    
  
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const listId = this.context.pageContext.list?.id?.toString();

          
        
        
        // Use SharePoint REST API to delete item (moves to recycle bin)
        const deleteUrl = `${siteUrl}/_api/web/lists('${listId}')/items(${itemId})/recycle()`;
        
        const response = await fetch(deleteUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': await this._getRequestDigest()
          }
        });

        if (!response.ok) {
          throw new Error(`Delete failed for item ${itemId}: ${response.statusText}`);
        }

        Log.info(LOG_SOURCE, `Item ${itemId} moved to recycle bin successfully`);
        return true;
      }

    

  

  /**
   * Gets the request digest for SharePoint REST API calls
   */
  private async _getRequestDigest(): Promise<string> {
    const siteUrl = this.context.pageContext.web.absoluteUrl;
    const response = await fetch(`${siteUrl}/_api/contextinfo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get request digest');
    }

    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  }
}
