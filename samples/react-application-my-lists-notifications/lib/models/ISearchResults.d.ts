interface ISearchResults {
    '@odata.context': string;
    value: Value[];
}
interface Value {
    searchTerms: any[];
    hitsContainers: HitsContainer[];
}
interface HitsContainer {
    total: number;
    moreResultsAvailable: boolean;
    hits: Hit[];
}
interface Hit {
    hitId: string;
    rank: number;
    summary: string;
    resource: Resource;
}
interface Resource {
    '@odata.type': string;
    displayName: string;
    id: string;
    lastModifiedDateTime: string;
    name: string;
    webUrl: string;
    createdBy: CreatedBy;
    parentReference: ParentReference;
}
interface ParentReference {
    id: string;
    siteId: string;
}
interface CreatedBy {
    user: User;
}
interface User {
    displayName: string;
}
//# sourceMappingURL=ISearchResults.d.ts.map