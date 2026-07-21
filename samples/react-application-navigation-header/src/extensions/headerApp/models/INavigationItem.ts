import type { IHeaderFeatures } from './IHeaderFeatures';

export interface INavigationItem {
  id: string;
  label: string;
  url?: string;
  description?: string;
  
  group?: string;
  
  groupOrder?: string[];
  order?: number;
  featured?: boolean;
  featuredRank?: number;
  overviewTitle?: string;
  overviewDescription?: string;
  matchUrls?: string[];
  isExternal?: boolean;
  hasChildren?: boolean;
  children: INavigationItem[];
  
  features?: IHeaderFeatures;
  
  meta?: INavigationItemMeta;
  
  iconName?: string;
}

export interface INavigationItemMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  canonical?: string;
}
