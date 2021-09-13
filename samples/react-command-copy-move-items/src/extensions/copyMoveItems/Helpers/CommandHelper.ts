import { ICommandHelper } from "./ICommandHelper";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import { IWeb } from "@pnp/sp/webs";
import { ISiteListInfo, IFieldInfo, IListInfo, IMappingFieldInfo, qry_itembyids } from "../Models/IModel";
import { chunk, union } from "lodash";
import * as HTMLDecoder from 'html-decoder';
import * as Handlebars from "handlebars";

const _batchSizeCM: number = 50;
const _itemIdSize: number = 50;

export default class CommandHelper implements ICommandHelper {
    private _web: IWeb;
    constructor() {
        this._web = sp.web;
    }

    public getTemplateValue = (template: string, value: any) => {
        const hTemplate = Handlebars.compile(HTMLDecoder.decode(template));
        return HTMLDecoder.decode(hTemplate(value));
    }

    public getListInfo = async (listid?: string, listtitle?: string, listurl?: string): Promise<IListInfo> => {
        let list: IListInfo = null;
        if (!listid && !listtitle && !listurl) throw 'Atleast one argument is required';
        else {
            if (listid) list = await this._web.lists.getById(listid).get();
            else if (listtitle) list = await this._web.lists.getByTitle(listtitle).get();
            else if (listurl) list = await this._web.getList(listurl).get();
        }
        return list;
    }

    public getListFields = async (listid?: string, listtitle?: string, listurl?: string): Promise<IFieldInfo[]> => {
        let listFields: IFieldInfo[] = null;
        let fieldFilterQuery: string = `Hidden eq false`; //`FromBaseType eq ${true}`;
        let selectQuery: string[] = ['Id', 'InternalName', 'StaticName', 'Title', 'TypeAsString', 'TypeDisplayName', 'TypeShortDescription', 'CanBeDeleted'];

        if (!listid && !listtitle && !listurl) throw 'Atleast one argument is required';
        else {
            if (listid) listFields = await this._web.lists.getById(listid).fields.filter(fieldFilterQuery).select(selectQuery.join(',')).orderBy("Title", true).get();
            else if (listtitle) listFields = await this._web.lists.getByTitle(listtitle).fields.filter(fieldFilterQuery).select(selectQuery.join(',')).orderBy("Title", true).get();
            else if (listurl) listFields = await this._web.getList(listurl).fields.filter(fieldFilterQuery).select(selectQuery.join(',')).orderBy("Title", true).get();
        }
        let titleField = listFields.filter(f => f.InternalName.toLowerCase() === "title");
        listFields = listFields.filter(f => f.CanBeDeleted);
        return listFields.concat(titleField);
    }

    public getAllLists = async (srcListId: string): Promise<ISiteListInfo[]> => {
        let siteLists: ISiteListInfo[] = null;
        let listFilterQuery = `Hidden eq false and BaseTemplate eq 100`;
        let selectFields: string[] = ['Id', 'ItemCount', 'Title', 'EntityTypeName'];
        siteLists = await this._web.lists.filter(listFilterQuery).select(selectFields.join(',')).get();
        return siteLists.filter(l => l.Id !== srcListId);
    }

    public getListItems = async (fields: string[], listid?: string, listtitle?: string): Promise<any[]> => {
        fields.push('ID');
        if (!listid && !listtitle) throw 'Atleast one argument is required';
        else {
            if (listid) return await this._web.lists.getById(listid).items.select(...fields).orderBy("ID", true).get();
            else if (listtitle) return await this._web.lists.getByTitle(listtitle).items.select(...fields).orderBy("ID", true).get();
        }
    }

    public getListItemsByIds = async (fields: string[], itemids: string[], listid?: string, listtitle?: string): Promise<any[]> => {
        if (!listid && !listtitle) throw 'Atleast one argument is required';
        let viewFields: string = '';
        let IdFilterQry: string = '';
        let finalItems: any[] = [];
        fields.push('ID');
        fields.map(fld => {
            viewFields += `<FieldRef Name='${fld}' />`;
        });
        return new Promise(async (res, rej) => {
            if (itemids.length > _itemIdSize) {
                let chunkItemids: any[] = chunk(itemids, _itemIdSize);
                Promise.all(chunkItemids.map(async chunkdata => {
                    IdFilterQry = '';
                    chunkdata.map(itemid => {
                        IdFilterQry += `<Value Type="Number">${itemid}</Value>`;
                    });
                    let _viewxml = this.getTemplateValue(qry_itembyids, { Ids: IdFilterQry, viewfields: viewFields });
                    let chunkitems: any[] = [];
                    if (listid) chunkitems = await this._web.lists.getById(listid).getItemsByCAMLQuery({
                        ViewXml: _viewxml
                    });
                    else if (listtitle) chunkitems = await this._web.lists.getByTitle(listtitle).getItemsByCAMLQuery({
                        ViewXml: _viewxml
                    });
                    finalItems = union(finalItems, chunkitems);
                })).then(() => {
                    res(finalItems);
                });
            } else {
                itemids.map(itemid => {
                    IdFilterQry += `<Value Type="Number">${itemid}</Value>`;
                });
                let _viewxml = this.getTemplateValue(qry_itembyids, { Ids: IdFilterQry, viewfields: viewFields });
                if (listid) finalItems = await this._web.lists.getById(listid).getItemsByCAMLQuery({
                    ViewXml: _viewxml
                });
                else if (listtitle) finalItems = await this._web.lists.getByTitle(listtitle).getItemsByCAMLQuery({
                    ViewXml: _viewxml
                });
                res(finalItems);
            }
        });
    }

    public copyItems = async (srcItems: any[], mappedFields: IMappingFieldInfo[], destListId: string, destEntType: string): Promise<boolean> => {
        return new Promise(async (res, rej) => {
            if (destListId && srcItems.length > 0 && mappedFields.length > 0) {
                let targetList = this._web.lists.getById(destListId);
                if (srcItems.length > _batchSizeCM) {
                    let chunkUserArr: any[] = chunk(srcItems, _batchSizeCM);
                    Promise.all(chunkUserArr.map(async chnkdata => {
                        let batch = this._web.createBatch();
                        chnkdata.map(srcitem => {
                            let objField = new Object();
                            mappedFields.map(fld => {
                                objField[fld.DFInternalName] = srcitem[fld.SFInternalName];
                            });
                            targetList.items.inBatch(batch).add(objField);
                        });
                        await batch.execute();
                    })).then(() => {
                        res(true);
                    }).catch(err => {
                        console.log(err);
                        res(false);
                    });
                } else {
                    let batch = this._web.createBatch();
                    srcItems.map(srcitem => {
                        let objField = new Object();
                        mappedFields.map(fld => {
                            objField[fld.DFInternalName] = srcitem[fld.SFInternalName];
                        });
                        targetList.items.inBatch(batch).add(objField);
                    });
                    await batch.execute();
                    res(true);
                }
            }
        });
    }

    public moveItems = async (srcItems: any[], srcListId: string, mappedFields: IMappingFieldInfo[], destListId: string, destEntType: string): Promise<boolean> => {
        return new Promise(async (res, rej) => {
            if (srcListId && destListId && srcItems.length > 0 && mappedFields.length > 0) {
                let targetList = this._web.lists.getById(destListId);
                let srcList = this._web.lists.getById(srcListId);
                if (srcItems.length > _batchSizeCM) {
                    let chunkUserArr: any[] = chunk(srcItems, _batchSizeCM);
                    Promise.all(chunkUserArr.map(async chnkdata => {
                        let batch = this._web.createBatch();
                        let delBbatch = this._web.createBatch();
                        chnkdata.map(srcitem => {
                            let objField = new Object();
                            mappedFields.map(fld => {
                                objField[fld.DFInternalName] = srcitem[fld.SFInternalName];
                            });
                            targetList.items.inBatch(batch).add(objField);
                            srcList.items.getById(srcitem['ID']).inBatch(delBbatch).recycle();
                        });
                        await batch.execute();
                        await delBbatch.execute();
                    })).then(() => {
                        res(true);
                    }).catch(err => {
                        console.log(err);
                        res(false);
                    });
                } else {
                    let batch = this._web.createBatch();
                    let delBbatch = this._web.createBatch();
                    srcItems.map(srcitem => {
                        let objField = new Object();
                        mappedFields.map(fld => {
                            objField[fld.DFInternalName] = srcitem[fld.SFInternalName];
                        });
                        targetList.items.inBatch(batch).add(objField);
                        srcList.items.getById(srcitem['ID']).inBatch(delBbatch).recycle();
                    });
                    await batch.execute();
                    await delBbatch.execute();
                    res(true);
                }
            }
        });
    }
}