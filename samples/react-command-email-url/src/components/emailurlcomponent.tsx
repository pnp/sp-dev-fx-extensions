import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Promise } from 'es6-promise';

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { BaseComponent, assign, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IBasePickerSuggestionsProps, NormalPeoplePicker } from 'office-ui-fabric-react/lib/Pickers';
import { css } from 'office-ui-fabric-react';
import { IPersonaProps, Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { IPersonaWithMenu } from 'office-ui-fabric-react/lib/components/pickers/PeoplePicker/PeoplePickerItems/PeoplePickerItem.Props';
import styles from './emailurlcomponentui.module.scss';

import { IEmailUrlComponentProps } from './emailurlcomponentprops';
import { IPeopleDataResult } from './IPeopleDataResult';

const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested People',
    noResultsFoundText: 'No results found',
    loadingText: 'Loading'
};

export interface IEmailUrlPopupState {
    selectedPeople: any,
    delayResults?: boolean;
    showDialog?: boolean;
    peopleList: IPersonaProps[];
}

export default class EmailUrlComponent extends React.Component<any, any> {

    private _peopleList;

    constructor() {
        super();

        let peopleList = [];

        this.state = {
            selectedPeople: [],
            delayResults: false,
            peopleList: peopleList,
            showDialog: true
        };
    }

    public render(): React.ReactElement<any> {

        return (
            <div>
                <Dialog
                    isOpen={this.state.showDialog}
                    type={DialogType.largeHeader}
                    onDismiss={this._closeDialog.bind(this)}
                    title={this.props.listTitle}
                    subText={this.props.fileName}
                    isBlocking={true}
                    containerClassName='ms-dialogMainOverride'
                >

                    <Link target="_blank" href={this._getFileFullPath()}>{this._getFileFullPath()}</Link>

                    <p />
                    <NormalPeoplePicker
                        onResolveSuggestions={this._onFilterChanged}
                        getTextFromItem={(persona: IPersonaProps) => persona.primaryText}
                        pickerSuggestionsProps={suggestionProps}
                        className={'ms-PeoplePicker'}
                        key={'normal'}
                        onChange={this._onSelectionChanged}
                    />

                    <DialogFooter>
                        <PrimaryButton onClick={this._eMailLink.bind(this)} text='Email' />
                        <DefaultButton onClick={this._closeDialog.bind(this)} text='Cancel' />
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }

    @autobind
    private _closeDialog() {
        this.setState({ showDialog: false });
    }

    @autobind
    private _onFilterChanged(filterText: string, currentPersonas: IPersonaProps[], limitResults?: number) {
        if (filterText) {
            if (filterText.length > 3) {
                return this._searchPeople(filterText, this._peopleList, currentPersonas);
            }
        } else {
            return [];
        }
    }

    @autobind
    private _onSelectionChanged(items) {
        this.setState({ selectedPeople: items });
    }

    private _searchPeople(terms: string, results: IPersonaProps[], currentPersonas: IPersonaProps[]): IPersonaProps[] | Promise<IPersonaProps[]> {

        return new Promise<IPersonaProps[]>((resolve, reject) =>
            this.props.spHttpClient.get(`${this.props.siteUrl}/_api/search/query?querytext='*${terms}*'&rowlimit=10&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'`,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        'Accept': 'application/json;odata=nometadata',
                        'odata-version': ''
                    }
                })
                .then((response: SPHttpClientResponse): Promise<{ PrimaryQueryResult: IPeopleDataResult }> => {
                    return response.json();
                })
                .then((response: { PrimaryQueryResult: IPeopleDataResult }): void => {
                    let relevantResults: any = response.PrimaryQueryResult.RelevantResults;

                    let resultCount: number = relevantResults.TotalRows;
                    let people = [];
                    let persona: IPersonaProps = {};

                    if (resultCount > 0) {

                        relevantResults.Table.Rows.forEach(function (row) {
                            row.Cells.forEach(function (cell) {
                                if (cell.Key === 'WorkEmail')
                                    persona.secondaryText = cell.Value;
                                if (cell.Key === 'PictureURL')
                                    persona.imageUrl = cell.Value;
                                if (cell.Key === 'PreferredName')
                                    persona.primaryText = cell.Value;
                            });

                            var found: boolean = false;

                            for (var i: number = 0; i < currentPersonas.length; i++) {

                                if (persona.primaryText == currentPersonas[i].primaryText) {
                                    found = true;
                                    break;
                                }
                            }

                            if (found === false) {
                                people.push(persona);
                            }
                        });
                    }

                    resolve(people);
                }, (error: any): void => {
                    reject(this._peopleList = []);
                }));
    }

    private _getFileFullPath() {
        if (this.props.fileRelativePath && this.props.siteUrl) {
            return this.props.siteUrl.substring(0, this.props.siteUrl.indexOf('.')) + ".sharepoint.com" + decodeURIComponent(this.props.fileRelativePath);
        }
        else {
            return "";
        }
    }

    private _eMailLink() {

        this.setState({ showDialog: false });

        let eMailTo = this.state.selectedPeople.map((p: IPersonaProps) => p.secondaryText);
        let eMailSubject = "Did you hear about this in SharePoint Online?";
        let eMailBody = "I thought you might find this information interesting: <" + this._getFileFullPath() + ">"

        window.parent.location.href = 'mailto:' + eMailTo + '?subject=' + eMailSubject + '&body=' + eMailBody;

    }

}