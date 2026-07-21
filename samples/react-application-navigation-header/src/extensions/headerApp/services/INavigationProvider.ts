import type { INavigationItem } from '../models/INavigationItem';

export interface INavigationProvider {
  
  readonly providerName: string;

  
  getCachedNavigationSnapshot(): INavigationItem[] | undefined;

  
  getImmediateNavigationSnapshot(): INavigationItem[];

  
  getNavigation(): Promise<INavigationItem[]>;

  
  getChildren(parentKey: string): Promise<INavigationItem[]>;

  
  clearCache(): void;
}