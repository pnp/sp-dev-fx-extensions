import { ISPTermObject } from './SPTermStoreService';

export interface ISPTaxonomyTerm {
    termId: string;
    name: string;
}

export interface ISPTaxonomyPickerState {
    terms: ISPTaxonomyTerm[];
    loaded: boolean;
}