import {
    IWebPartContext
  } from '@microsoft/sp-webpart-base';
  
import * as SPTermStore from './SPTermStoreService'; 
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface IYammerFooterBarProps {
    context: ApplicationCustomizerContext;
    sourceTermSetName: string;
    menuItems: SPTermStore.ISPTermObject[];
}
