import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SettingsPanel from '../settings-panel/settings-panel';
import IFormItem from '../../models/form-item';

class container {
    private showPanel:boolean = true;
    public listId:string;
    public formSettings:IFormItem[];
    public contentTypes:any[];

    constructor(){
        
    }
    public render() {
        const settingsPanel = (
            <SettingsPanel contentTypes={this.contentTypes} formSettings={this.formSettings} showPanel={this.showPanel} setShowPanel={this._setShowPanel} listId={this.listId} />
        );
        
        ReactDOM.render([settingsPanel],document.body.firstChild as Element);
    }
    public _setShowPanel = (showSettingsPanel: boolean): void => {
        this.showPanel=showSettingsPanel;
    }
}

export{
    container
};