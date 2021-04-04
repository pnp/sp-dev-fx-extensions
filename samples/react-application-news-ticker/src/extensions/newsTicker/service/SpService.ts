import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import { News } from "../models/News";

export default class SpService {
  public async getNewsItems(listTitle: string, listViewTitle: string): Promise<News[]> {
    // Get xml schema for the "Published News" view
    const list = sp.web.lists.getByTitle(listTitle);
    const view = await list.views.getByTitle(listViewTitle)();
    if (!view) return [];

    const items = await list.getItemsByCAMLQuery({ViewXml: view.ListViewXml});
    return items.map(item => (<News>{
      title: item['Title'],
      content: item['Content'],
      publishDate: new Date(item['PublishDate'])
    }));
  }
}