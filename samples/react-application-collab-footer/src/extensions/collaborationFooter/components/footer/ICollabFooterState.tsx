import { IContextualMenuItem } from '@fluentui/react';

export interface ICollabFooterState {
    // State variable to show the result of saving my links, with an explicit null as a valid option
    myLinksSaved: boolean | null;
    // Used to hold the personal links menu items, initialized as an empty array
    myLinks: IContextualMenuItem[];
}
