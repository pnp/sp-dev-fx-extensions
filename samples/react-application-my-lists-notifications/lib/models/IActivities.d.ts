import { DriveItem, ListItem } from '@microsoft/microsoft-graph-types';
export interface IActivities {
    "@odata.context": string;
    "@odata.nextLink": string;
    value: IActivity[];
}
export interface IActivity {
    "@sharePoint.localizedRelativeTime": string;
    action: Action;
    actor: Actor;
    id: string;
    times: Times;
    "listItem@odata.navigationLink": string;
    listItem?: ListItem;
    driveItem?: DriveItem;
}
export interface Times {
    lastRecordedDateTime?: string;
    recordedDateTime: string;
}
export interface Actor {
    user: User;
}
export interface User {
    email: string;
    displayName: string;
    self: Edit;
    userPrincipalName: string;
}
export interface Action {
    edit?: Edit;
    create?: Create;
    delete?: Delete;
    comment?: CommentAction;
    mention?: mention;
    move?: move;
    rename?: rename;
    restore?: restore;
    share?: share;
    version?: version;
}
export interface Delete {
    name: string;
    objectType: string;
}
export interface Edit {
}
export interface Create {
}
export interface mention {
    "mentionees": identitySet[];
}
export interface move {
    from: string;
    to: string;
}
export interface rename {
    oldName: string;
    newName: string;
}
export interface restore {
}
export interface CommentAction {
    isReply: boolean;
    parentAuthor: identitySet;
    participants: identitySet[];
}
export interface share {
    recipients: identitySet[];
}
export interface version {
    newVersion: string;
}
export interface identitySet {
    application: identity;
    applicationInstance: identity;
    conversation: identity;
    conversationIdentityType: identity;
    device: identity;
    encrypted: identity;
    guest: identity;
    phone: identity;
    user: identity;
}
export interface identity {
    displayName: string;
    id: string;
    tenantId: string;
    thumbnails: any;
}
//# sourceMappingURL=IActivities.d.ts.map