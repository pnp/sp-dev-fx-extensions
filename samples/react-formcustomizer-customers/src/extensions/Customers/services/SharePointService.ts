import { FormCustomizerContext } from "@microsoft/sp-listview-extensibility";
import { Logger, LogLevel } from "@pnp/logging";
import { SPFI } from "@pnp/sp";
import { IItemAddResult } from "@pnp/sp/items/types";
import { LogHelper } from "../helpers/LogHelper";
import CustomerMapper from "../mapper/CustomerMapper";
import { ICustomer } from "../model/ICustomer";
import { IFormData } from "../model/IFormData";
import { IProject } from "../model/IProject";
import { getSP } from "../pnpjsConfig";
import { IField } from "@pnp/sp/fields/types";
import { IContentTypeInfo } from "@pnp/sp/content-types";
import { Guid } from "@microsoft/sp-core-library";
import "@pnp/sp/content-types";
import "@pnp/sp/lists"

class SharePointService {


    private static _sp: SPFI = null;

    public static Init(context: FormCustomizerContext) {
        this._sp = getSP(context)
        LogHelper.info('SharePointService', 'constructor', 'PnP SP context initialised');
    }

    public static getProjects = async (listName: string) => {
        try {

            //const taxNoteField: any = await this._sp.web.lists.getByTitle("Customers").fields.getByTitle("CustomerLocations_0")();
            const items: any = await this._sp.web.lists
                .getByTitle(listName)
                .items.select("*", "ID", "Title")
                .getAll();

            return items;
        } catch (err) {
            LogHelper.error('SharePointService', 'getProjects', err);
            throw err;
        }

    }
    public static async AddCustomer(formData: IFormData) {

        const response: IItemAddResult = await this._sp.web.lists.getByTitle("Customers").items
            .add(formData);
        return response;

    }
    public static async UpdateCustomer(formData: IFormData, itemId: number) {

        const response: IItemAddResult = await this._sp.web.lists
            .getByTitle("Customers").items
            .getById(itemId)
            .update(formData);
        return response;
    }

    public static getCustomer = async (itemId: number, listTitle: string) => {
        try {
            let cResult = {} as ICustomer;
            const customerResponse: ICustomer = await this._sp.web.lists
                .getByTitle(listTitle)
                .items.getById(itemId)
                .select("*", "ID", "Title", "Email", "WorkAddress", "Interests", "Projects/Title", "Projects/ID", "TaxCatchAll/ID", "TaxCatchAll/Term").expand("Projects", "TaxCatchAll")();

            if (customerResponse != null && customerResponse != undefined) {
                cResult = CustomerMapper.mapCustomerInfo(customerResponse);
            }

            const assoicatedProjects: any[] = customerResponse && customerResponse.Projects.length > 0 ? customerResponse.Projects : [];
            if (assoicatedProjects.length > 0) {

                const projectMappedData = await Promise.all(assoicatedProjects.map(async (item: IProject) => {

                    const response: IProject = await SharePointService.getProjectDetail(item.ID, "Projects");
                    return response;

                }));

                cResult.Projects = projectMappedData;

            }

            return cResult;
        } catch (err) {
            LogHelper.error('SharePointService', 'getCustomer', err);
            throw err;
        }

    }

    public static getProjectDetail = async (projrectId: number, listTitle: string) => {

        let pResult: IProject;

        try {
            const response: any = await this._sp.web.lists
                .getByTitle(listTitle)
                .items.getById(projrectId)
                .select("*", "ID", "Title", "Status", "StartDate", "Members/EMail", "Members/Title").expand("Members")();

            if (response != null && response != undefined) {
                pResult = CustomerMapper.mapCustomerProjects(response);
            }


            return pResult;
        } catch (err) {
            LogHelper.error('SharePointService', 'getProjectDetail', err);
            throw err;
        }
    }

    public static getLocationsFieldDetails = async (listId: Guid): Promise<{TermSetId: string, TextField: string}> => {
        const locationsField: IField = await this._sp.web.lists.getById(listId.toString()).fields.getByTitle('Customer Locations').select('ID','TermSetId','TextField')();
        const locationsTextField: IField = await this._sp.web.lists.getById(listId.toString()).fields.getById(locationsField['TextField']).select('ID','InternalName')();

        return { 
            TermSetId: locationsField['TermSetId'],
            TextField: locationsTextField['InternalName']
        };
    }

    public static getCustomerContentTypeId = async (listId: Guid): Promise<string> => {
        const listContentTypes: IContentTypeInfo[] = await this._sp.web.lists.getById(listId.toString()).contentTypes();        
        return listContentTypes[0].Id.StringValue;
    }
}
export default SharePointService;
