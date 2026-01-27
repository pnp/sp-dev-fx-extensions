import { ISelectedItem } from "./ISelectedItem";
import { IUser } from "./IUser";

export interface IFlowRequestBody {
  originSecret?: string;
  site: string;
  tenantUrl: string;
  listId: string;
  selectedItem: ISelectedItem;
  user: IUser;
  
}
