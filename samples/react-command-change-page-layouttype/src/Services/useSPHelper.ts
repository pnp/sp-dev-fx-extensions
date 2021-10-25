import { useCallback } from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import { IPageInfo, ISelPageInfo } from '../extensions/showHidePageTitle/IModel';

export const useSPHelper = (listTitle: string) => {

    const getItemInfo = useCallback(async (pages: IPageInfo[]) => {
        let finalResponse: ISelPageInfo[] = [];
        if (listTitle) {
            if (pages.length > 0) {
                let batch = sp.web.createBatch();
                let splist = await sp.web.lists.getByTitle(listTitle);
                let response: any[] = [];
                pages.map(async (page: IPageInfo) => {
                    response.push(await splist.items.getById(page.ID)
                        .select('ID', 'Title', 'PageLayoutType', 'Created', 'Modified', 'Author/Title', 'Editor/Title', 'FileRef', 'FileLeafRef', 'CheckoutUser/Title')
                        .expand('Author', 'Editor', 'CheckoutUser')
                        .inBatch(batch).get());
                });
                await batch.execute();
                if (response && response.length > 0) {
                    response.map(res => {
                        finalResponse.push({
                            ID: res.ID,
                            Title: res.Title,
                            Author: res.Author.Title,
                            Editor: res.Editor.Title,
                            Created: res.Created,
                            Modified: res.Modified,
                            Path: res.FileRef,
                            Filename: res.FileLeafRef,
                            PageLayoutType: res.PageLayoutType,
                            CheckedOutBy: res.CheckoutUser ? res.CheckoutUser.Title : undefined
                        });
                    });
                }
                return finalResponse;
            }
        }
    }, [listTitle]);

    const updatePage = useCallback(async (pages: ISelPageInfo[]): Promise<boolean> => {
        if (pages && listTitle && pages.length > 0) {
            let batch = sp.web.createBatch();
            let splist = await sp.web.lists.getByTitle(listTitle);
            pages.map(async (page: ISelPageInfo) => {
                await splist.items.getById(page.ID).inBatch(batch).update({
                    PageLayoutType: page.LayoutToUpdate
                });
            });
            await batch.execute();
            return true;
        } else return false;
    }, [listTitle]);

    return {
        getItemInfo,
        updatePage
    };
};