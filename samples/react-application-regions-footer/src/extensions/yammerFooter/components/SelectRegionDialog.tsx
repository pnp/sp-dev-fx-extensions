import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
  autobind,
  PrimaryButton,
  CommandButton,
  Label,
  DialogFooter,
  DialogContent
} from 'office-ui-fabric-react';

import { SPTaxonomyPicker } from './SPTaxonomyPicker';
import { ISPTermObject } from './SPTermStoreService';
import { ISPTaxonomyTerm } from './ISPTaxonomyPickerState';

import { ExtensionContext } from '@microsoft/sp-extension-base';
import { Dialog } from '@microsoft/sp-dialog';

import styles from './SelectRegionDialog.module.scss';
import * as strings from 'YammerFooterApplicationCustomizerStrings';

interface ISelectRegionDialogContentProps {
  context: ApplicationCustomizerContext;
  sourceTermSetName: string;
  close: () => void;
  submit: (region: string) => void;
}

interface ISelectRegionDialogContentState {
  region: string;
}

class SelectRegionDialogContent extends 
  React.Component<ISelectRegionDialogContentProps, ISelectRegionDialogContentState> {

    constructor(props) {
      super(props);

      this.state = {
        region: ""
      };
    }
  
    public render(): JSX.Element {
      return (<div className={ styles.selectRegionDialogRoot }>
        <DialogContent
          title={ strings.SelectRegionDialogTitle }
          subText={ strings.RegionPlaceholder }
          onDismiss={ this.props.close }
          showCloseButton={ true }
          >

          <div className={ styles.selectRegionDialogContent }>
            <div className="ms-Grid">
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-u-sm12 ms-u-md12 ms-u-lg12">
                    <SPTaxonomyPicker
                        context={ this.props.context }
                        termSetName={ this.props.sourceTermSetName }
                        label={ strings.RegionLabel }
                        placeholder={ strings.RegionPlaceholder }
                        required={ true }
                        onChanged={ this._onChangedRegion }
                        />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
              <CommandButton text='Cancel' title='Cancel' onClick={ this.props.close } />
              <PrimaryButton text='OK' title='OK' onClick={() => { this.props.submit(this.state.region); }} />
          </DialogFooter>
        </DialogContent>
      </div>);
    }

    @autobind
    private _onChangedRegion(terms: ISPTaxonomyTerm[]): void {
      this.setState({
        region: terms[0].name
      });
    }
}

export default class ScheduleMeetingDialog extends BaseDialog {
    public context: ApplicationCustomizerContext;
    public sourceTermSetName: string;
    public region: string;
  
    public render(): void {
      ReactDOM.render(<SelectRegionDialogContent
        context={ this.context }
        sourceTermSetName={ this.sourceTermSetName }
        close={ this.close }
        submit={ this._submit }
      />, this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: false
      };
    }
  
    @autobind
    private _submit(region: string): void {
        this.region = region;
        this.close();
    }
}