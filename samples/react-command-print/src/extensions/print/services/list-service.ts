import {
    sp
} from "@pnp/sp";
import IListField from '../models/list-field';
import * as strings from 'PrintCommandSetStrings';
import { Log } from '@microsoft/sp-core-library';
const LOG_SOURCE: string = 'PrintCommandSet';
export default class ListService {

    private _fieldTypesToIgnore: Array<string>;
    private _fieldsToIgnore: Array<string>;
    constructor() {
        this.buildExclusions();
    }

     /**
     * Check if the current user is a site admin
     */
    public async IsCurrentUserSiteAdmin(): Promise<boolean>{
        return sp.web.currentUser.get().then(user=>{
            return user.IsSiteAdmin;
        }).catch((error: any) => {
            Log.error(LOG_SOURCE, error);
            this.safeLog(error);
            return false;
        });
    }
    /**
     * GetItemById
     */
    public async GetItemById(listId: string, itemId: number): Promise<any> {
        return sp.web.lists.getById(listId).items.getById(itemId).fieldValuesAsText.get()
            .then((result: any) => {
                return result;
            })
            .catch((error: any): void => {
                Log.error(LOG_SOURCE, error);
                this.safeLog(error);
            });
    }
    /**
     * GetTemplatesByListId
     */
    public async GetTemplatesByListId(listId: string): Promise<any[]> {
        return sp.web.lists.getByTitle('Print Settings List').items.filter(`ListId eq '${listId}'`).select('Id', 'Title', 'Header', 'Footer', 'Columns', 'ListId', 'HeaderAdvancedMode', 'FooterAdvancedMode','SkipBlankColumns').get().then(items => {
            return items;
        }).catch(error => {
            Log.error(LOG_SOURCE, error);
            this.safeLog(error);
            return error.message;
        });
    }

    /**
     * GetFieldsByListId
     */
    public async GetFieldsbyListId(listId: string): Promise<Array<IListField>> {
        return sp.web.lists.getById(listId).fields.select('Id', 'Title', 'InternalName', 'TypeAsString', 'IsDependentLookup', 'StaticName').get().then((results: any) => {
            //Setup the list fields
            const _listFields = new Array<IListField>();
            // This includes any field of a type we don't want (such as computed)
            // This also includes several internal fields that won't make sense to clone (such as the creation date)
            // Finally, no dependent lookup columns (projected fields)
            for (let field of results) {
                const { InternalName, TypeAsString, Title, IsDependentLookup, Id } = field;
                if (this._fieldTypesToIgnore.indexOf(TypeAsString) == -1 && this._fieldsToIgnore.indexOf(InternalName) == -1 && !IsDependentLookup) {
                    _listFields.push({
                        InternalName: InternalName.replace(/_/g, '_x005f_').replace(' ', ''),
                        Title: Title,
                        Id: Id,
                        Type: 'Field'
                    });

                }
            }
            return _listFields;
        }).catch(error => {
            Log.error(LOG_SOURCE, error);
            return error.message;
        });
    }

     /**
     * Add a template to Print Settings List
     */
    public async AddTemplate(template: any): Promise<any> {
        return sp.web.lists.getByTitle('Print Settings List').items.add(template).then(({ data }) => data).catch(error => {
            Log.error(LOG_SOURCE, error);
            return error.message;
        });
    }

     /**
     * Update an existing template
     */
    public async UpdateTemplate(id: number, template: any): Promise<boolean> {

        return sp.web.lists.getByTitle('Print Settings List').items.getById(id).update(template).then(e => true).catch(error => {
            Log.error(LOG_SOURCE, error);
            return error.message;
        });
    }

     /**
     * Remove a template
     */
    public async removeTempate(id: number): Promise<boolean> {
        return sp.web.lists.getByTitle('Print Settings List').items.getById(id).delete().then(e => true).catch(error => {
            Log.error(LOG_SOURCE, error);
            return error.message;
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
            strings.field_ContentTypeId,
            strings.field_HasCopyDestinations,
            strings.field_CopySource,
            strings.fieldowshiddenversion,
            strings.fieldWorkflowVersion,
            strings.field_UIVersion,
            strings.field_UIVersionString,
            strings.field_ModerationComments,
            strings.fieldInstanceID,
            strings.field_ComplianceAssetId,
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
            strings.fieldFolderChildCount,
            strings.fieldOrder
        );
    }

    /** Logs messages to the console if the console is available */
    private safeLog(message: any): void {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    }

}