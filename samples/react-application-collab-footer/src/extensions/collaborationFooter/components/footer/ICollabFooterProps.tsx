import { IContextualMenuItem } from '@fluentui/react'; // Updated import for Fluent UI
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IFooterService } from '../../../../services/ServiceFactory';

export interface ICollabFooterProps {
    // Menu items passed from the extension to the React component for shared links
    sharedLinks: IContextualMenuItem[];

    // Menu items for personal links
    myLinks: IContextualMenuItem[];

    // Function to edit the list of personal links (My Links)
    editMyLinks: () => Promise<ICollabFooterEditResult>;

    // Function to open link selection dialog (for hybrid storage type)
    openLinkSelection?: () => Promise<void>;

    // Storage type to determine which buttons to show
    storageType?: string;

    // SharePoint context for real API calls
    context?: BaseComponentContext;

    // Footer service for SharePoint operations
    footerService?: IFooterService;

    // Configuration for centralized home site (optional, defaults to tenant root)
    homeSiteUrl?: string;

    // Flag to indicate legacy mode (personal links only)
    legacyMode?: boolean;

    // Callback for when personal links are updated (used in legacy mode)
    onPersonalLinksUpdated?: (updatedLinks: IContextualMenuItem[]) => void;
}

export interface ICollabFooterEditResult {
    // Making editResult optional with explicit boolean or null types
    editResult?: boolean | null;
    // myLinks can be either a list or null
    myLinks: IContextualMenuItem[] | null;
}