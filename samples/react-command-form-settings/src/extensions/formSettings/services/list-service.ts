import {
    sp
} from "@pnp/sp";
import { Log } from '@microsoft/sp-core-library';
import IFormItem from "../models/form-item";
const LOG_SOURCE: string = 'PrintCommandSet';
export default class ListService {

    constructor() {
    }

    /**
    * Check if the current user is a site admin
    */
    public async IsCurrentUserSiteAdmin(): Promise<boolean> {
        return sp.web.currentUser.get().then(user => {
            return user.IsSiteAdmin;
        }).catch((error: any) => {
            Log.error(LOG_SOURCE, error);
            this.safeLog(error);
            return false;
        });
    }
    /**
        * Return current list content types
        */
    public async getListContentTypes(listId: string): Promise<any> {
        return sp.web.lists.getById(listId).contentTypes.filter("Name ne 'Folder'").get();
    }
    /**
        * Return all form settings related to the current list
        */
    public async getFormSettings(listId: string): Promise<IFormItem[]> {
        return sp.web.lists.getByTitle("Form Settings")
            .items.select("Id", "Title", "ContentTypeName", "FormType", "RedirectURL", "OpenIn", "Enabled", "Parameters")
            .filter(`Title eq '${listId}'`).get();
    }
    /**
     * Return enabled form settings
     */
    public async getEnabledFormSettings(listId: string): Promise<IFormItem[]> {
        return sp.web.lists.getByTitle("Form Settings")
            .items.select("Id", "Title", "ContentTypeName", "FormType", "RedirectURL", "OpenIn", "Enabled", "Parameters")
            .filter(`Title eq '${listId}' and Enabled eq 1`).get();
    }
    /**
     * Add form to Form Settings List
     */
    public async SaveForm(form: any): Promise<any> {
        return sp.web.lists.getByTitle('Form Settings').items.add(form);        
    }

    /**
     * Update an existing Form Setting
     */
    public async UpdateForm(form: any): Promise<any> {
        return sp.web.lists.getByTitle('Form Settings').items.getById(form.Id).update(form);
    }

    /** Logs messages to the console if the console is available */
    private safeLog(message: any): void {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    }

}