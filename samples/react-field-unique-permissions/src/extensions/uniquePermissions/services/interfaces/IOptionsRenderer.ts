import { BaseComponentContext } from '@microsoft/sp-component-base';

export interface IOptionsRenderer {
    getIsRenderingInitialized: () => boolean;
    renderAdditionalOptions: (context: BaseComponentContext) => void;
    unMountAdditionalOptions(): void;
}