import * as React from 'react';
import styles from './ComponentsStyles.module.scss';

import { ISPTaxonomyPickerProps } from './ISPTaxonomyPickerProps';
import { ISPTaxonomyTerm, ISPTaxonomyPickerState } from './ISPTaxonomyPickerState';
import * as SPTermStore from './SPTermStoreService'; 

/**
 * Common Infrastructure
 */
import {
  BaseComponent,
  assign,
  autobind,
  css
} from 'office-ui-fabric-react/lib/Utilities';

/**
 * Label
 */
import { Label } from 'office-ui-fabric-react/lib/Label';

import {
  IBasePickerProps,
  BasePickerListBelow,
  BaseAutoFill,
  IPickerItemProps
} from 'office-ui-fabric-react/lib/Pickers';

import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface ISPTaxonomyTermProps {
  termId?: string;
  name?: string;
}

export interface ISPTaxonomyTermPickerProps extends IBasePickerProps<ISPTaxonomyTermProps> {
}

export class SPTaxonomyPickerControl extends BasePickerListBelow<ISPTaxonomyTermProps, ISPTaxonomyTermPickerProps> {  
}

export const SPTaxonomySuggestedItem: (termProps: ISPTaxonomyTermProps) => JSX.Element = (termProps: ISPTaxonomyTermProps) => {
  return (
    <div className={ styles.pickerRoot }>
      <span className={ styles.pickerSuggestedItem }>
        <span className={ styles.pickerSuggestedItemIcon }><i className="ms-Icon ms-Icon--Tag" aria-hidden="true"></i></span>
        <span className={ styles.pickerSuggestedItemText }>{ termProps.name }</span>
      </span>
    </div>
  );
};

export const SPTaxonomySelectedItem: (termProps: IPickerItemProps<ISPTaxonomyTermProps>) => JSX.Element = (termProps: IPickerItemProps<ISPTaxonomyTermProps>) => {

  return (
    <div
      className={ css(styles.pickerRoot, styles.pickerSelectedItem) }
      key={ termProps.item.termId }
      data-selection-index={ termProps.item.termId }
      data-is-focusable={ true }>
      <span className={ styles.pickerSelectedItemIcon }>
        <i className="ms-Icon ms-Icon--Tag" aria-hidden="true"></i>
      </span>      
      <span className={ css('ms-TagItem-text', styles.pickerSelectedItemText) }>{ termProps.item.name }</span>
      <span className={ css('ms-TagItem-close', styles.pickerSelectedItemClose) } onClick={ termProps.onRemoveItem }>
        <i className="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
      </span>
    </div>
  );
};

export class SPTaxonomyPicker extends React.Component<ISPTaxonomyPickerProps, ISPTaxonomyPickerState> {

  private terms: SPTermStore.ISPTermObject[];

  /**
   *
   */
  constructor(props: ISPTaxonomyPickerProps) {
    super(props);
    
    let termStoreService: SPTermStore.SPTermStoreService = new SPTermStore.SPTermStoreService({
      spHttpClient: this.props.context.spHttpClient,
      siteAbsoluteUrl: this.props.context.pageContext.web.absoluteUrl,
    });

    termStoreService.getTermsFromTermSetAsync(this.props.termSetName).then((response: SPTermStore.ISPTermObject[]) => {
      this.terms = response;
    });

    this.state = {
      terms: [],
      loaded: false,
    };
  }

  public render(): React.ReactElement<ISPTaxonomyPickerProps> {

    return (
      <div className={ css('ms-TextField', {'is-required': this.props.required }) }>
        <Label>{ this.props.label }</Label>
        <SPTaxonomyPickerControl
          onChange={ this._onChangeTaxonomyPicker }
          onResolveSuggestions={ this._onFilterChangedTaxonomyPicker }
          onRenderSuggestionsItem={ SPTaxonomySuggestedItem }
          onRenderItem={ SPTaxonomySelectedItem }
          getTextFromItem={ (props: ISPTaxonomyTermProps) => props.name }
          pickerSuggestionsProps={
            {
              suggestionsHeaderText: 'Suggested Items',
              noResultsFoundText: 'No Items Found',
              loadingText: 'Loading',
            }
          }
          />
      </div>
    );
  }

  @autobind
  private _onChangeTaxonomyPicker(items?: ISPTaxonomyTermProps[]): void{     
    
    /** Empty the array */
    this.setState({
      terms: new Array<ISPTaxonomyTerm>()
    }, () => {
      /** Fill it with new items */
      items.forEach((i: ISPTaxonomyTermProps) => {
        this.state.terms.push( { name: i.name, termId: i.termId });
      });

      if (this.props.onChanged != null)
      {
          this.props.onChanged(this.state.terms);
      }
    });
  }

  @autobind
  private _onFilterChangedTaxonomyPicker(filterText: string, currentItems: ISPTaxonomyTermProps[]) : ISPTaxonomyTermProps[] {
    
    if (filterText.length >= 3 && this.props.termSetName && this.terms != null && this.terms.length > 0) {
      
      let items: Array<ISPTaxonomyTermProps> = new Array<ISPTaxonomyTermProps>();
      this.terms.forEach((t: SPTermStore.ISPTermObject) => {
        if (t.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0)
        {
          items.push({ termId: t.guid.toString(), name: t.name });
        }
        this._recursiveSearchTerms(filterText, items, t);
      });

      return items;
    }
  }

  @autobind
  private _recursiveSearchTerms(filterText: string, items: Array<ISPTaxonomyTermProps>, term: SPTermStore.ISPTermObject) : ISPTaxonomyTermProps[] {
    if (filterText.length >= 3 && this.props.termSetName && this.terms != null && this.terms.length > 0) {
      term.terms.forEach((t: SPTermStore.ISPTermObject) => {
        if (t.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0) {
          items.push({ termId: t.guid.toString(), name: t.name });
        }
        this._recursiveSearchTerms(filterText, items, t);
      });

      return items;
    }      
  }
}
