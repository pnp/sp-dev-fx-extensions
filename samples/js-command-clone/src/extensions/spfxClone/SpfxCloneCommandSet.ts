import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import { SPPermission } from "@microsoft/sp-page-context";
import { IListSchema } from './IListSchema';
import { IListField } from './IListField';
import pnp from "sp-pnp-js";

import * as strings from 'SpfxCloneCommandSetStrings';

export interface ISpfxCloneCommandSetProperties {
  //Nope
}

const LOG_SOURCE: string = 'SpfxCloneCommandSet';

export default class SpfxCloneCommandSet
  extends BaseListViewCommandSet<ISpfxCloneCommandSetProperties> {

  private _listSchema: IListSchema;
  private _fieldTypesToIgnore: Array<string>;
  private  _fieldsToIgnore: Array<string>;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized SpfxCloneCommandSet');

    this.buildExclusions();

    //Provide PnP JS-Core with the proper context (needed in SPFx Components)
    return super.onInit().then(_ => {
      pnp.setup({
        spfxContext: this.context
      });
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    //Get a reference to our command
    const command: Command | undefined = this.tryGetCommand("spfxClone");

    if (command) {
      //Only show the command if at least 1 row is selected and the user has permission to add list items
      command.visible = event.selectedRows.length >= 1 && this.context.pageContext.list.permissions.hasPermission(SPPermission.addListItems);
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.commandId) {
      case 'spfxClone':
        this.ensureListSchema()
          .then((listSchema: IListSchema): void => {

            // We'll request all the selected items in a single batch
            let itemBatch: any = pnp.sp.createBatch();

            //Get an array of the internal field names for the select along with any necessary expand fields
            let fieldNames: Array<string> = new Array<string>();
            let expansions: Array<string> = new Array<string>();
            listSchema.Fields.forEach((field: IListField) => {
              switch (field.TypeAsString) {
                case 'User':
                case 'UserMulti':
                case 'Lookup':
                case 'LookupMulti':
                  fieldNames.push(field.InternalName + '/Id');
                  expansions.push(field.InternalName);
                  break;
                default:
                  fieldNames.push(field.InternalName);
              }
            });

            let items: Array<any> = new Array<any>();

            //Batch up each item
            for (let row of event.selectedRows) {

              //grab the item ID
              let itemId: number = row.getValueByName('ID');

              //Add the item to the batch
              pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).select(...fieldNames).expand(...expansions).inBatch(itemBatch).getAs<Array<any>>()
                .then((result: any) => {
                  //Copy just the fields we care about
                  let item: any = {};
                  listSchema.Fields.forEach((field: IListField) => {
                    switch (field.TypeAsString) {
                      case 'User':
                      case 'Lookup':
                        item[field.InternalName + 'Id'] = result[field.InternalName]['Id'];
                        break;
                      case 'UserMulti':
                      case 'LookupMulti':
                        item[field.InternalName + 'Id'] = {
                          results: new Array<Number>()
                        };
                        result[field.InternalName].forEach((person: any) => {
                          item[field.InternalName + 'Id'].results.push(person['Id']);
                        });
                        break;
                      case "MultiChoice":
                        item[field.InternalName] = {
                          results: result[field.InternalName]
                        };
                        break;
                      default:
                        item[field.InternalName] = result[field.InternalName];
                    }
                  });
                  items.push(item);
                })
                .catch((error: any): void => {
                  Log.error(LOG_SOURCE, error);
                  console.log(error);
                });
            }

            //Execute the batch
            itemBatch.execute()
              .then(() => {
                console.log(items);
                
                //We'll create all the new items in a single batch
                let cloneBatch: any = pnp.sp.createBatch();
                items.forEach((item: any) => {
                  pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.inBatch(cloneBatch).add(item)
                    .catch((error: any): void => {
                      Log.error(LOG_SOURCE, error);
                      this.safeLog(error);
                    });
                });

                cloneBatch.execute()
                  .then(() => {
                    //location.reload(); //Reloads the entire page since there isn't currently a way to just reload the list view
                  })
                  .catch((error: any): void => {
                    Log.error(LOG_SOURCE, error);
                    console.log(error);
                  });
                  
              })
              .catch((error: any): void => {
                Log.error(LOG_SOURCE, error);
                this.safeLog(error);
              });
          })
          .catch((error: any): void => {
            Log.error(LOG_SOURCE, error);
            this.safeLog(error);
          });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private ensureListSchema(): Promise<IListSchema> {
    return new Promise<IListSchema>((resolve: (listSchema: IListSchema) => void, reject: (error: any) => void): void => {
			if(this._listSchema) {
        resolve(this._listSchema);
      } else {
        pnp.sp.web.lists.getById(this.context.pageContext.list.id.toString()).fields.select('InternalName','TypeAsString','IsDependentLookup').getAs<IListField[]>()
          .then((results: IListField[]) => {
            //Setup the list schema
            this._listSchema = {
              Title: this.context.pageContext.list.title,
              Fields: []
            };

            //Filter out all the extra fields we don't want to clone
            for(let field of results) {
              if(this._fieldTypesToIgnore.indexOf(field.TypeAsString) == -1 && this._fieldsToIgnore.indexOf(field.InternalName) == -1 && !field.IsDependentLookup) {
                this._listSchema.Fields.push({
                  InternalName: field.InternalName,
                  TypeAsString: field.TypeAsString
                });
              }
            }
            resolve(this._listSchema);
          })
          .catch((error: any): void => {
            reject(error);
          });
      }
		});
  }

  private buildExclusions(): void {
    this._fieldTypesToIgnore = new Array<string>(
      strings.typeCounter,
      strings.typeContentType,
      strings.typeAttachments,
      strings.typeModStat,
      strings.typeComputed
    );

    this._fieldsToIgnore = new Array<string>(
      strings.fieldModified,
      strings.fieldCreated,
      strings.fieldAuthor,
      strings.fieldEditor,
      strings.field_HasCopyDestinations,
      strings.field_CopySource,
      strings.fieldowshiddenversion,
      strings.fieldWorkflowVersion,
      strings.field_UIVersion,
      strings.field_UIVersionString,
      strings.field_ModerationComments,
      strings.fieldInstanceID,
      strings.fieldGUID,
      strings.fieldWorkflowInstanceID,
      strings.fieldFileRef,
      strings.fieldFileDirRef,
      strings.fieldLast_x0020_Modified,
      strings.fieldCreated_x0020_Date,
      strings.fieldFSObjType,
      strings.fieldSortBehavior,
      strings.fieldFileLeafRef,
      strings.fieldUniqueId,
      strings.fieldSyncClientId,
      strings.fieldProgId,
      strings.fieldScopeId,
      strings.fieldFile_x0020_Type,
      strings.fieldMetaInfo,
      strings.field_Level,
      strings.field_IsCurrentVersion,
      strings.fieldItemChildCount,
      strings.fieldRestricted,
      strings.fieldOriginatorId,
      strings.fieldNoExecute,
      strings.fieldContentVersion,
      strings.field_ComplianceFlags,
      strings.field_ComplianceTag,
      strings.field_ComplianceTagWrittenTime,
      strings.field_ComplianceTagUserId,
      strings.fieldAccessPolicy,
      strings.field_VirusStatus,
      strings.field_VirusVendorID,
      strings.field_VirusInfo,
      strings.fieldAppAuthor,
      strings.fieldAppEditor,
      strings.fieldSMTotalSize,
      strings.fieldSMLastModifiedDate,
      strings.fieldSMTotalFileStreamSize,
      strings.fieldSMTotalFileCount,
      strings.fieldFolderChildCount
    );
  }

  private safeLog(message: any): void {
    if(window.console && window.console.log){
      window.console.log(message);
    }
  }

}
