export interface ISharingLink {
    key: string;
    docId: string;
    name: string;
    description: string;
    url: string;
    roleid: string;
    role?: string;
    shareLink?: string;
    width?: number;
    height?: number;
}