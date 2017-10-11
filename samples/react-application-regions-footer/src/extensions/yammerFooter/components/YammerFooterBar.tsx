import * as React from 'react';
import styles from '../YammerFooter.module.scss';
import * as strings from 'YammerFooterApplicationCustomizerStrings';

import { IYammerFooterBarProps } from './IYammerFooterBarProps';
import { IYammerFooterBarState } from './IYammerFooterBarState';
import { IRegionForFooter } from './IRegionForFooter';

import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { PrimaryButton, CommandButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';

//import { IContextualMenuItem, ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';

import { Dialog } from '@microsoft/sp-dialog';
import SelectRegionDialog from './SelectRegionDialog';

import * as SPTermStore from './SPTermStoreService'; 

export default class YammerFooterBar extends React.Component<IYammerFooterBarProps, IYammerFooterBarState> {

   /**
   * Main constructor for the component
   */
  constructor(props: IYammerFooterBarProps) {
    super();
    
    const editMode: boolean = false;
    const currentRegion: string = (sessionStorage.getItem(`currentRegion-${props.context.pageContext.site.id}`) != undefined) ? 
        sessionStorage.getItem(`currentRegion-${props.context.pageContext.site.id}`) : undefined;
    
    // TODO: Retrieve the currently configured one
    this.state = {
        editMode: editMode,
        region: currentRegion
    };

    window.setTimeout(this.refreshEditMode, 1000);
  }

  @autobind
  private refreshEditMode(): void {
    let currentEditMode: boolean = window.location.search.toLowerCase().indexOf('mode=edit') > 0;
    // console.log(`EditMode: ${currentEditMode}`);
    this.setState({
        editMode: currentEditMode
    }, () => {
        window.setTimeout(this.refreshEditMode, 1000);        
    });
  }

  private projectRegion(term: SPTermStore.ISPTermObject): IRegionForFooter {

    return({
        regionName: term.name,
        contactName: this.getCustomProperty(term, "ContactName"),
        contactEmail: this.getCustomProperty(term, "ContactEmail"),
        contactPhone: this.getCustomProperty(term, "ContactPhone"),
        yammerGroupUrl: this.getCustomProperty(term, "YammerGroupURL"),
    });
  }

  private getCustomProperty(term: SPTermStore.ISPTermObject, propertyName: string): string {
    return((term.customProperties[propertyName] != undefined ?
      term.customProperties[propertyName]
      : null));
  }

  private getLocalCustomProperty(term: SPTermStore.ISPTermObject, propertyName: string): string {
    return((term.localCustomProperties[propertyName] != undefined ?
      term.localCustomProperties[propertyName]
      : null));
  }

  public render(): React.ReactElement<IYammerFooterBarProps> {

    const defaultRegion: IRegionForFooter = 
    {
        contactName: "---",
        contactEmail: "---",
        contactPhone: "---",
        regionName: "---",
        yammerGroupUrl: "---",
    };

    const regionsForFooter: IRegionForFooter[] = (this.props.menuItems != null) ?
        this.props.menuItems.map((i) => {
            return(this.projectRegion(i));
        }) : null;

    const currentRegion: IRegionForFooter = (regionsForFooter != null && regionsForFooter.length > 0) ?
        ((this.state.region != null) ? 
            regionsForFooter.filter((e, i, a) => { return(e.regionName == this.state.region); })[0] : defaultRegion)
        : null;

    return (
      <div className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.app}`}>
        <div className={`ms-bgColor-neutralLighter ms-fontColor-white ${styles.bottom}`}>
            {
                (!this.state.editMode) ?
                <div className={`ms-Grid ${styles.footerGrid}`}>
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm3 ms-md3 ms-lg3">
                            <CommandButton 
                                data-automation="regionName"
                                className={ styles.footerGridRowContent }
                                iconProps={ { iconName: 'WorldClock' } }>{ strings.RegionLabel } {currentRegion.regionName}</CommandButton>
                            {/* <Label className={ styles.footerGridRowContent }>Region: {currentRegion.regionName}</Label> */}
                        </div>
                        <div className="ms-Grid-col ms-sm3 ms-md3 ms-lg3">
                            <CommandButton 
                                data-automation="contactName"
                                className={ styles.footerGridRowContent }
                                iconProps={ { iconName: 'Contact' } }>{ strings.RegionManagerLabel } {currentRegion.contactName}</CommandButton>
                            {/* <Label className={ styles.footerGridRowContent }>Manager: {currentRegion.contactName}</Label> */}
                        </div>
                        <div className="ms-Grid-col ms-sm3 ms-md3 ms-lg3">
                            <CommandButton 
                                data-automation="contactEmail"
                                className={ styles.footerGridRowContent }
                                iconProps={ { iconName: 'Mail' } }
                                href={`mailto:${currentRegion.contactEmail}`}>{currentRegion.contactEmail}</CommandButton>
                        </div>
                        <div className="ms-Grid-col ms-sm3 ms-md3 ms-lg3">
                            <CommandButton 
                                data-automation="yammerGroupUrl"
                                className={ styles.footerGridRowContent }
                                iconProps={ { iconName: 'YammerLogo' } }
                                href={ currentRegion.yammerGroupUrl }>Yammer Group</CommandButton>
                        </div>
                    </div>
                </div>
                :
                <div className={`ms-Grid ${styles.footerGrid}`}>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <PrimaryButton 
                            data-automation="editRegion"
                            onClick={ this._clickEditRegion }
                            iconProps={ { iconName: 'WorldClock' } }>Select the Region</PrimaryButton>
                    </div>
                </div>
            </div>
        }
        </div>
      </div>
    );
  }

  @autobind
  private _clickEditRegion(): void {
    const dialog: SelectRegionDialog = new SelectRegionDialog();
    dialog.context = this.props.context;
    dialog.sourceTermSetName = this.props.sourceTermSetName;

    dialog.show().then(() => {

        let selectedRegion: string = this._processRegionSelection(dialog.region);
        console.log(`Selected region: ${selectedRegion}`);

        this.setState({
            region: selectedRegion
        }, () => {
            sessionStorage.setItem(`currentRegion-${this.props.context.pageContext.site.id}`, selectedRegion);
        });
    });
  }

  @autobind
  private _processRegionSelection(selectedValue: string): string {

    let selectedItem: SPTermStore.ISPTermObject = this._searchSelectedItem(this.props.menuItems, selectedValue);
    console.log(selectedItem);

    let selectedRegion: string = this._searchSelectedRegion(this.props.menuItems, selectedItem);
    console.log(selectedRegion);
    
    return(selectedRegion);
  }

  @autobind
  private _searchSelectedRegion(items: SPTermStore.ISPTermObject[], selectedItem: SPTermStore.ISPTermObject): string {

    let selectedRegion: string = "";

    // If we are at the top level, just return the selected item
    if (selectedItem.parentTermName == "") {
        selectedRegion = selectedItem.name;
    }
    else {
        // Otherwise search backward in hierarchy
        let parentItem: SPTermStore.ISPTermObject = this._searchSelectedItem(this.props.menuItems, selectedItem.parentTermName);
        if (parentItem != undefined) {
            selectedRegion = this._searchSelectedRegion(this.props.menuItems, parentItem);
        }
    }

    return(selectedRegion);
  }

  @autobind
  private _searchSelectedItem(items: SPTermStore.ISPTermObject[], selectedValue: string): SPTermStore.ISPTermObject {

    let selectedItem: SPTermStore.ISPTermObject = null;
    
    let matchingItems = items.filter((e, i, a) => { return(e.name == selectedValue); });
    if (matchingItems != undefined && matchingItems.length > 0) {
        selectedItem = matchingItems[0];
    }
    else {
        items.forEach((i: SPTermStore.ISPTermObject, index: number) => {
            let childSelectedItem: SPTermStore.ISPTermObject = this._searchSelectedItem(i.terms, selectedValue);
            if (childSelectedItem != undefined)
            {
                selectedItem = childSelectedItem;
            }
        });
    }

    return(selectedItem);
  }
}

