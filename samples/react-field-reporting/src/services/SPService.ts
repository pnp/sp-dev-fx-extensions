import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

class SPService {
    private static _sp: SPFI;

    public static Init(sp: SPFI): void {
        this._sp = sp;
    }
    public static addListItemAsync = async (
        listName: string,
        item: any
    ): Promise<any> => {
        try {
            const result = await this._sp.web.lists
                .getByTitle(listName)
                .items.add(item);

            return result;
        } catch (err) {
            console.error("SPService -> addListItemAsync", err);
            return null;
        }
    }    
}
export default SPService;
