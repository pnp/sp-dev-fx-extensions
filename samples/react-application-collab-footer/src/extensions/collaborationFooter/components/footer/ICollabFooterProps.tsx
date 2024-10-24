import { IContextualMenuItem } from '@fluentui/react'; // Updated import for Fluent UI

export interface ICollabFooterProps {
    // Menu items passed from the extension to the React component for shared links
    sharedLinks: IContextualMenuItem[];

    // Menu items for personal links
    myLinks: IContextualMenuItem[];

    // Function to edit the list of personal links (My Links)
    editMyLinks: () => Promise<ICollabFooterEditResult>;
}

export interface ICollabFooterEditResult {
    // Making editResult optional with explicit boolean or null types
    editResult?: boolean | null;
    // myLinks can be either a list or null
    myLinks: IContextualMenuItem[] | null;
}