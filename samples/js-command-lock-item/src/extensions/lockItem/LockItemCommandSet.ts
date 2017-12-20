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

import pnp from "sp-pnp-js";

import * as strings from 'LockItemCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ILockItemCommandSetProperties {
}

const LOG_SOURCE: string = 'LockItemCommandSet';

declare var window: any;

export default class LockItemCommandSet extends BaseListViewCommandSet<ILockItemCommandSetProperties> {

  private _hasCorrectPermissions: boolean = false;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized LockItemCommandSet');
    this._hasCorrectPermissions = this.context.pageContext.list.permissions.hasPermission(SPPermission.managePermissions);
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


      // This command should be hidden unless exactly one row is selected.
      lockItemCommand.visible = this._hasCorrectPermissions && event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'LOCK_ITEM':
        const itemId: number = event.selectedRows[0].getValueByName('ID');
        this.getItemHasUniquePermissions(itemId)
          .then(hasUniquePermissions => {
            if (hasUniquePermissions) {
              this.getIsItemLocked(itemId).then(isLocked => {
                if (isLocked) {
                  this.unlockItem(itemId).then(success => {
                    if (success) {
                      location.reload(true);
                    }
                    else {
                      alert(strings.ErrorLocking);
                    }
                  });
                }
                else {
                  alert(strings.UniquePermissionsWarning);
                }
              });
            }
            else {
              this.lockItem(itemId).then(success => {
                if (success) {
                  location.reload(true);
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

  private getItemHasUniquePermissions(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
        .select('ID', 'HasUniqueRoleAssignments').get()
        .then((item: any) => {
          resolve(item.HasUniqueRoleAssignments);
        });
    });
  }

  private getIsItemLocked(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
        .roleAssignments.get()
        .then(roles => {
          resolve(roles.length === 1 && roles.PrincipalId === this.context.pageContext.legacyPageContext.userId);
        });
    });
  }

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

  private lockItem(itemId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pnp.sp.web.roleDefinitions.getByType(5).get().then(roleDefinition => {
        var batch = pnp.sp.createBatch();
        pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).inBatch(batch)
          .breakRoleInheritance(false, false).then(() => {
            console.log('break role inheritance succeded');
          }, (error) => {
            console.log('break role inheritance failed');
            console.log(error);
          });
        pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId)
          .roleAssignments.inBatch(batch).add(this.context.pageContext.legacyPageContext.userId, roleDefinition.Id);
        batch.execute().then(() => {
          resolve(true);
        }, () => {
          resolve(false);
        });
      });

    });
  }
}
