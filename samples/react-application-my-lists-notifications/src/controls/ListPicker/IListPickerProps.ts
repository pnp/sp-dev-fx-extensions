import { IBasePickerStyles, ITag } from "office-ui-fabric-react/lib/Pickers";
import { Theme } from "spfx-uifabric-themes";

import { BaseComponentContext } from "@microsoft/sp-component-base";

export interface IListPickerProps {
  appcontext?: BaseComponentContext;
  onSelectedLists: (tagsList: ITag[]) => void;
  selectedLists: ITag[];
  itemLimit?: number;
  label?: string;
  styles?: IBasePickerStyles;
  themeVariant?: Theme;
}
