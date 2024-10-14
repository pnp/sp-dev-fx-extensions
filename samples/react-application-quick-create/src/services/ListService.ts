import { spfi, SPFx, ISPFXContext } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/content-types/list";
import { IListInfo } from "@pnp/sp/lists";
import { IListQueryOptions } from "../interfaces/IListQueryOptions";
import { IContentTypeInfo } from "@pnp/sp/content-types/types";

export const ListItemService = (context: ISPFXContext) => {
  const sp = spfi().using(SPFx(context));

  const get = (option?: IListQueryOptions): Promise<IListInfo[]> => {
    let lists = sp.web.lists;

    if (option?.select) {
      lists = lists.select(option.select);
    }

    if (option?.expand) {
      lists = lists.expand(option.expand);
    }

    if (option?.filter) {
      lists = lists.filter(option.filter);
    }

    if (option?.orderBy) {
      lists = lists.orderBy(option.orderBy);
    }

    return lists();
  };

  const getContentTypes = (listTitle: string): Promise<IContentTypeInfo[]> => {
    return sp.web.lists.getByTitle(listTitle).contentTypes();
  };

  return {
    get,
    getContentTypes,
  };
};
