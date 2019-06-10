import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import { SPPermission } from "@microsoft/sp-page-context";
import { IListField } from './IListField';
import { sp } from "@pnp/sp";

import * as strings from 'SpfxCloneCommandSetStrings';

export interface ISpfxCloneCommandSetProperties {
  Lists: string;
}

const LOG_SOURCE: string = 'SpfxCloneCommandSet';

export default class SpfxCloneCommandSet
  extends BaseListViewCommandSet<ISpfxCloneCommandSetProperties> {

  private _listFields: Array<IListField>;
  private _fieldTypesToIgnore: Array<string>;
  private _fieldsToIgnore: Array<string>;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized SpfxCloneCommandSet');

    this.buildExclusions();

    //Provide PnP JS-Core with the proper context (needed in SPFx Components)
    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    //Get a reference to our command
    const command: Command | undefined = this.tryGetCommand("spfxClone");

    if (command) {
      let allowed = true;

      //If Lists is specified, the command should only show up for named lists
      if(typeof this.properties.Lists !== "undefined" && this.properties.Lists.length > 0) {
        let lists = this.properties.Lists.split(',');
        allowed = lists.indexOf(this.context.pageContext.list.title) > -1;
      }
      //Only show the command if at least 1 row is selected and the user has permission to add list items
      command.visible = event.selectedRows.length >= 1 && this.context.pageContext.list.permissions.hasPermission(SPPermission.addListItems) && allowed;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'spfxClone':
        this.ensureListSchema() //Go get the field information
          .then((listFields: Array<IListField>): void => {

            // We'll request all the selected items in a single batch
            let itemBatch: any = sp.createBatch();

            //Get an array of the internal field names for the select along with any necessary expand fields
            let fieldNames: Array<string> = new Array<string>();
            let expansions: Array<string> = new Array<string>();
            listFields.forEach((field: IListField) => {
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

            //This will be our cleansed items to clone array
            let items: Array<any> = new Array<any>();

            //Batch up each item for retrieval
            for (let row of event.selectedRows) {

              //grab the item ID
              let itemId: number = row.getValueByName('ID');

              //Add the item to the batch
              sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.getById(itemId).select(...fieldNames).expand(...expansions).inBatch(itemBatch).get<Array<any>>()
                .then((result: any) => {
                  //Copy just the fields we care about and provide some adjustments for certain field types
                  let item: any = {};
                  listFields.forEach((field: IListField) => {
                    switch (field.TypeAsString) {
                      case 'User':
                      case 'Lookup':
                        //These items need to be the underlying Id and their names have to have Id appended to them
                        item[field.InternalName + 'Id'] = result[field.InternalName]['Id'];
                        break;
                      case 'UserMulti':
                      case 'LookupMulti':
                        //These items need to be an array of the underlying Ids and the array has to be called results
                        // their names also have to have Id appended to them
                        item[field.InternalName + 'Id'] = {
                          results: new Array<Number>()
                        };
                        result[field.InternalName].forEach((prop: any) => {
                          item[field.InternalName + 'Id'].results.push(prop['Id']);
                        });
                        break;
                      case "TaxonomyFieldTypeMulti":
                        //These doesn't need to be included, since the hidden Note field will take care of these
                        // in fact, including these will cause problems
                        break;
                      case "MultiChoice":
                        //These need to be in an array of the selected choices and the array has to be called results
                        item[field.InternalName] = {
                          results: result[field.InternalName]
                        };
                        break;
                      default:
                        //Everything else is just a one for one match
                        item[field.InternalName] = result[field.InternalName];
                    }
                  });
                  items.push(item);
                })
                .catch((error: any): void => {
                  Log.error(LOG_SOURCE, error);
                  this.safeLog(error);
                });
            }

            //Execute the batch
            itemBatch.execute()
              .then(() => {

                //We'll create all the new items in a single batch
                let cloneBatch: any = sp.createBatch();

                //Process each item
                items.forEach((item: any) => {
                  sp.web.lists.getById(this.context.pageContext.list.id.toString()).items.inBatch(cloneBatch).add(item)
                    .catch((error: any): void => {
                      Log.error(LOG_SOURCE, error);
                      this.safeLog(error);
                    });
                });

                cloneBatch.execute()
                  .then(() => {
                    location.reload(); //Reloads the entire page since there isn't currently a way to just reload the list view
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

  /** Retrieves all the fields for the list */
  private ensureListSchema(): Promise<Array<IListField>> {
    return new Promise<Array<IListField>>((resolve: (listFields: Array<IListField>) => void, reject: (error: any) => void): void => {

      if(this._listFields) {
        //Looks like we already got it, so just return that
        resolve(this._listFields);

      } else {
        //Go get all the fields for the list
        sp.web.lists.getById(this.context.pageContext.list.id.toString()).fields.select('InternalName','TypeAsString','IsDependentLookup').get<IListField[]>()
          .then((results: IListField[]) => {

            //Setup the list fields
            this._listFields = new Array<IListField>();

            //Filter out all the extra fields we don't want to clone
            // This includes any field of a type we don't want (such as computed)
            // This also includes several internal fields that won't make sense to clone (such as the creation date)
            // Finally, no dependent lookup columns (projected fields)
            for(let field of results) {
              if(this._fieldTypesToIgnore.indexOf(field.TypeAsString) == -1 && this._fieldsToIgnore.indexOf(field.InternalName) == -1 && !field.IsDependentLookup) {

                this._listFields.push({
                  InternalName: field.InternalName,
                  TypeAsString: field.TypeAsString
                });

              }
            }
            resolve(this._listFields);
          })
          .catch((error: any): void => {
            reject(error);
          });
      }
		});
  }

  /** Builds the fieldTypes and fields to ignore arrays */
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

  /** Logs messages to the console if the console is available */
  private safeLog(message: any): void {
    if(window.console && window.console.log){
      window.console.log(message);
    }
  }

}
