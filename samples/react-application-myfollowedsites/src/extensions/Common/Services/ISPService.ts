import { ISiteItem } from '../Modules/ISiteItem';
export interface ISPService {

    getMyFollowedSites():Promise<ISiteItem[]>;
    SortMyFollowedSites(items: ISiteItem[], sortBy: string, descending?: boolean): ISiteItem[];
}