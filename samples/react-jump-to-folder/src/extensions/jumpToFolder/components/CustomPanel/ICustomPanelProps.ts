import { ExtensionContext } from '@microsoft/sp-extension-base';
import { IFolder } from '@pnp/spfx-controls-react';

export interface ICustomPanelProps {
  /**
   * Current context
   */
  context: any;

  /**
   * Control if the panel is open
   */
  isOpen: boolean;

  /**
   * The lowest level folder that can be explored. This can be the root folder of a library.
   */
  rootFolder?: IFolder;

  /**
   * The default folder to be explored
   */
  defaultFolder?: IFolder;
}
