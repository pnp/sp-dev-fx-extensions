import { IMenuItem } from "../../../../models/IMenuItem";

export interface ISubMenuSitesProps {
  key: string; 
  name: string; 
  label: string;
  searchText: string;
  searchCallback: (searchText: string) => Promise<IMenuItem[]>;
  dataItems: IMenuItem[];
  divisionHomeUrl: string;
  showSpinner: boolean;
}