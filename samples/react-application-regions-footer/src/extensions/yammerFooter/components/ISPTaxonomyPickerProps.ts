import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

import { ISPTermObject } from './SPTermStoreService';
import { ISPTaxonomyTerm } from './ISPTaxonomyPickerState';

export interface ISPTaxonomyPickerProps {
  context: ApplicationCustomizerContext;
  termSetName: string;
  label: string;
  placeholder: string;
  required: boolean;
  
  allowMultipleSelections?: boolean;
  excludeOfflineTermStores?: boolean;
  excludeSystemGroup?: boolean;
  displayOnlyTermSetsAvailableForTagging?: boolean;
  
  onChanged?: (terms: ISPTaxonomyTerm[]) => void;
}
  