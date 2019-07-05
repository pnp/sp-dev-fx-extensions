import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import ISettingsPanelState from './settings-panel-state';
import ISettingsPanelProps from './settings-panel-props';
import styles from './settings-panel.module.scss';
import {
    Dropdown, Label, TextField, Toggle, IDropdownOption
} from 'office-ui-fabric-react';
import ListService from '../../services/list-service';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import IFormItem from '../../models/form-item';

export default class SettingsPanel extends React.Component<ISettingsPanelProps, ISettingsPanelState>{
    private listService: ListService;
    private formOptions = [
        { key: "Display", text: "Display" },
        { key: "New", text: "New" },
        { key: "Edit", text: "Edit" }
    ];
    constructor(props) {
        super(props);
        this.state = {
            contentTypes: [],
            formSettings: [],
            form: {},
            showTemplatePanel: true,
            formUpdated: false
        };
        this.listService = new ListService();
        this._onRenderFooterContent = this._onRenderFooterContent.bind(this);
    }

    public async componentDidMount() {

        this.setState({
            contentTypes: this.props.contentTypes.map(t => ({ key: t.Id.StringValue, text: t.Name })),
            formSettings: this.props.formSettings
        });
    }

    public render() {
        return (
            <div className={styles.SettingsPanel}>
                <Panel isOpen={this.props.showPanel}
                    onDismissed={() => this.props.setShowPanel(false)}
                    type={PanelType.medium} headerText="Form Settings"
                    onRenderFooterContent={this._onRenderFooterContent}>
                    <Label>Content type:</Label>
                    <Dropdown onChanged={this._onDropDownChanged} placeholder="Select content type..." options={this.state.contentTypes} />
                    {
                        this.state.form.ContentTypeName &&
                        <Dropdown selectedKey={this.state.form.FormType} onChanged={this._onFormDropDownChanged} label="Form:" placeholder="Select form..." options={this.formOptions} />
                    }

                    <Toggle
                        label="Enabled"
                        onText="Yes"
                        offText="No"
                        checked={this.state.form.Enabled}
                        onChanged={this._enabledToggleChange}
                        hidden={this.state.form.FormType === null}
                    />
                    {
                        this.state.form.Enabled &&
                        <div>
                            <TextField label="Redirect URL" value={this.state.form.RedirectURL} onChanged={this._onUrlChanged} />
                            <ChoiceGroup
                                className="defaultChoiceGroup"
                                selectedKey={this.state.form.OpenIn}
                                options={[
                                    {
                                        key: 'Current Window',
                                        text: 'Current Window'
                                    },
                                    {
                                        key: 'New Tab',
                                        text: 'New Tab'
                                    }
                                ]}
                                onChanged={this._onChoiceChanged}
                                label="Open in"
                            />
                            <TextField label="Parameters" value={this.state.form.Parameters} onChanged={this._onParametersChanged} multiline autoAdjustHeight />
                            <p>
                                {
                                    "Example: ID={ItemId}&ListId={ListId}&User={UserLoginName}"
                                }
                            </p>
                            <p>
                                {
                                    "Tokens: {ItemId}, {ListId}, {WebUrl}, {SiteUrl}, {UserLoginName}, {UserEmail}, {UserDisplayName}"
                                }
                            </p>
                        </div>
                    }
                </Panel>
            </div>
        );
    }

    private _onRenderFooterContent = (): JSX.Element => {
        return (
            <div>
                {
                    this.state.formUpdated &&
                    <Label className={styles.updateMessage}>Form settings updated.</Label>
                }

                {
                    this.state.form.FormType !== null &&
                    <PrimaryButton disabled={this.state.formUpdated} onClick={this._saveTemplate} style={{ marginRight: '8px' }}>Save</PrimaryButton>
                }

            </div>
        );
    }

    private _onDropDownChanged = (option: IDropdownOption, index?: number) => {

        this.setState({
            form: {
                ContentTypeName: option.text,
                FormType: null,
                Enabled: false
            },
            formUpdated: false
        }
        );
    }

    private _onFormDropDownChanged = (option: IDropdownOption, index?: number) => {


        const forms: IFormItem[] = this.state.formSettings.filter(ct => ct.FormType === option.text && ct.ContentTypeName === this.state.form.ContentTypeName);

        if (forms.length > 0) {

            const form = forms[0] as IFormItem;
            this.setState({
                form,
                formUpdated: false
            });
        }
        else {
            this.setState(prevState => (
                {
                    form: {
                        ContentTypeName: prevState.form.ContentTypeName,
                        Enabled: false,
                        FormType: option.text
                    },
                    formUpdated: false
                }
            )
            );
        }
    }

    private _enabledToggleChange = (value) => {
        this.setState(
            {
                form: {
                    ...this.state.form,
                    Enabled: value
                },
                formUpdated: false
            }
        );
    }

    private _onUrlChanged = (value) => {
        this.setState({
            form: {
                ...this.state.form,
                RedirectURL: value
            },
            formUpdated: false
        });
    }

    private _onParametersChanged = (value) => {
        this.setState({
            form: {
                ...this.state.form,
                Parameters: value
            },
            formUpdated: false
        });
    }

    private _onChoiceChanged = (option: IChoiceGroupOption, evt?: React.FormEvent<HTMLElement | HTMLInputElement>): void => {

        this.setState({
            form: {
                ...this.state.form,
                OpenIn: option.text
            },
            formUpdated: false
        });
    }

    private _saveTemplate = () => {
        const { form } = this.state;
        this.setState({
            formUpdated: false
        });

        const formObject: IFormItem = {
            Id: form.Id,
            Title: this.props.listId,
            Enabled: form.Enabled,
            ContentTypeName: form.ContentTypeName,
            FormType: form.FormType,
            OpenIn: form.OpenIn,
            RedirectURL: form.RedirectURL,
            Parameters: form.Parameters
        };

        const forms: IFormItem[] = this.state.formSettings.filter(ct => ct.FormType === form.FormType && ct.ContentTypeName === form.ContentTypeName);
        
        if (forms.length > 0) {
            this.listService.UpdateForm(form);
            let newFormSettings = this.state.formSettings;
            newFormSettings = newFormSettings.map(f => {
                return f.Id === formObject.Id ? formObject : f;
            });
            this.setState({
                formSettings: newFormSettings,
                formUpdated: true
            });

        }
        else {
            // Add new form settings
            this.listService.SaveForm(formObject);

            this.setState(prevState => ({
                formSettings: prevState.formSettings.concat(formObject),
                formUpdated: true
            }));
        }

    }

}