import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import { SPPermission } from '@microsoft/sp-page-context';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import pnp from "sp-pnp-js";

import * as strings from 'LockItemCommandSetStrings';
import { ODataBatch } from 'sp-pnp-js/lib/sharepoint/batch';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ILockItemCommandSetProperties {
}

const LOG_SOURCE: string = 'LockItemCommandSet';

// to be able to access g_listData
declare var window: any;

export default class LockItemCommandSet extends BaseListViewCommandSet<ILockItemCommandSetProperties> {

  /**
   * flag to store if current user has correct permissions to proceed with Lock operation
   */
  private _hasCorrectPermissions: boolean = false;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized LockItemCommandSet');
    // this where we check the permissions
    this._hasCorrectPermissions = this.context.pageContext.list.permissions.hasPermission(SPPermission.managePermissions);

    // setting up the pnp to work correctly with SPFx
    pnp.setup({
      spfxContext: this.context
    });
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const lockItemCommand: Command = this.tryGetCommand('LOCK_ITEM');
    if (lockItemCommand) {
      //
      // Display 'Lock/Unlock document' if we're working with doc library,
      // and 'Lock/Unlock item' otherwise
      //
      if (window.g_listData.ListTemplateType === '101') {
        lockItemCommand.title = strings.LockDocument;
      }
      else {
        lockItemCommand.title = strings.LockItem;
      }


      // This command should be hidden unless exactly one row is selected and user has correct permissions.
      lockItemCommand.visible = this._hasCorrectPermissions && event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'LOCK_ITEM':
        // getting item Id
        const itemId: number = event.selectedRows[0].getValueByName('ID');
        this.getItemHasUniquePermissions(itemId)
          .then(hasUniquePermissions => {
            if (hasUniquePermissions) { // if the item has unique permissions
              this.getIsItemLocked(itemId).then(isLocked => {
                if (isLocked) { // check if item is locked
                  // unlock the item
                  this.unlockItem(itemId).then(success => {
                    if (success) {
                      alert(strings.SuccessUnlocking);
                    }
                    else {
                      alert(strings.ErrorLocking);
                    }
                  });
                }
                else {
                  // display the message that item has unique permissions and we can't lock it
                  alert(strings.UniquePermissionsWarning);
                }
              });
            }
            else {
              // lock item as it doesn't have unique permissions
              this.lockItem(itemId).then(success => {
                if (success) {
                  alert(strings.SuccessLocking);
                }
                else {
                  alert(strings.ErrorLocking);
                }
              });
            }

          });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  /**
   * Checks if the item has unique permissions requesting HasUniqueRoleAssignments
   * @param itemId item id
   */
  private getItemHasUniquePermissions(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // spHttpClient is used instead of pnp to add /HasUniqueRoleAssignments endpoint
      this.context.spHttpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/lists('${this.context.pageContext.list.id.toString()}')/items(${itemId})/HasUniqueRoleAssignments`, 
        SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => {
          response.json().then((responseJSON: any) => {
            resolve(responseJSON.value);
          }, (error: any) => { reject(error); });
        });
    });
  }

  /**
   * Checks if the item was previously locked.
   * The item is considered locked if it has unique permissions and the only role assignment is current user
   * @param itemId item Id
   */
  private getIsItemLocked(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
        .roleAssignments.get()
        .then(roles => {
          resolve(roles.length === 1 && roles[0].PrincipalId === this.context.pageContext.legacyPageContext.userId);
        });
    });
  }

  /**
   * Unlocks the item (resets role inheritance)
   * @param itemId item Id
   */
  private unlockItem(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
        .resetRoleInheritance().then(() => {
          resolve(true);
        }, () => {
          resolve(false);
        });
    });
  }

  /**
   * Locks the item. The lock process consists of 2 operations:
   * - break role inheritance for the item without copying role assignments
   * - add current user with Full Control permissions as the only role assignment to the item
   * @param itemId item Id
   */
  private lockItem(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.roleDefinitions.getByType(5).get().then(roleDefinition => {
        const batch: ODataBatch = pnp.sp.createBatch();
        pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).inBatch(batch)
          .breakRoleInheritance(false, false).then((value) => {}, (error) => {});
        pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
          .roleAssignments.inBatch(batch).add(this.context.pageContext.legacyPageContext.userId, roleDefinition.Id)
          .then(() => {}, (error) => {});

        batch.execute().then(() => {
          resolve(true);
        }, () => {
          resolve(false);
        });
      });

    });
  }
}
