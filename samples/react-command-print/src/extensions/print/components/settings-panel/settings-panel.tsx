import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { List } from 'office-ui-fabric-react/lib/List';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import ListService from '../../services/list-service';
import ISettingsPanelState from './settings-panel-state';
import ISettingsPanelProps from './settings-panel-props';
import styles from './settings-panel.module.scss';
import AddUpdateTemplate from '../add-update-template-panel/add-update-template-panel';
import ITemplateItem from '../../models/template-item';
import { isArray } from '@pnp/common';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

export default class SettingsPanel extends React.Component<ISettingsPanelProps, ISettingsPanelState>{
    private listService: ListService;
    private _defaultState: ISettingsPanelState;
    constructor(props) {
        super(props);
        this.listService = new ListService();
        this._defaultState = {
            activeTemplate: {
                Columns: [],
                Footer: '',
                Header: '',
                FooterAdvancedMode: false,
                HeaderAdvancedMode: false,
                SkipBlankColumns: false,
                Title: '',
                ListId: this.props.listId
            },
            showDeleteDialog: true,
            activateTemplateIndex: -1,
            activateTemplateId: null,
            showTemplatePanel: false
        };
        this.state = this._defaultState;
    }

    public render() {
        return (
            <div className={styles.SettingsPanel}>
                <Panel isOpen={this.props.showPanel}
                    onDismissed={this.props.setShowPanel(false)}

                    type={PanelType.medium} headerText="Print Settings">
                    <h3>Print Templates:</h3>
                    <div style={{ display: 'flex', alignItems: 'stretch', height: '40px', marginBottom: '10px' }}>
                        <CommandBarButton
                            data-automation-id="test"
                            iconProps={{ iconName: 'Add' }}
                            text="Create template"
                            onClick={this._addNewTemplate}
                        />
                    </div>
                    <FocusZone direction={FocusZoneDirection.vertical}>
                        <List items={this.props.templates} onRenderCell={this._onRenderCell} />
                    </FocusZone>
                    <AddUpdateTemplate
                        onTemplateSaved={this._onTemplateSaved}
                        onTemplateChanged={this._onTemplateChanged}
                        template={this.state.activeTemplate}
                        listId={this.props.listId}
                        showTemplatePanel={this.state.showTemplatePanel}
                        setShowTemplatePanel={this._setShowTemplatePanel} />
                    <Dialog
                        hidden={this.state.showDeleteDialog}
                        onDismiss={this._closeDeleteDialog}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Remove template',
                            subText: 'Are you sure you want to delete this template?'
                        }}
                        modalProps={{
                            titleAriaId: 'myLabelId',
                            subtitleAriaId: 'mySubTextId',
                            isBlocking: true,
                            containerClassName: 'ms-dialogMainOverride'
                        }}
                    >
                        {null /** You can also include null values as the result of conditionals */}
                        <DialogFooter>
                            <PrimaryButton onClick={this._removeTempate} text="Delete" />
                            <DefaultButton onClick={this._closeDeleteDialog} text="Cancel" />
                        </DialogFooter>
                    </Dialog>
                </Panel>
            </div>
        );
    }

    private _showDeleteDialog = (item: any): void => {
        this.setState({
            showDeleteDialog: false,
            activateTemplateId: item.Id,
            activeTemplate: item
        });
    }

    private _closeDeleteDialog = (): void => {
        this.setState({ showDeleteDialog: true });
    }

    private _onTemplateSaved = async () => {
        if (!this.state.activateTemplateId) {
            let templateItem = await this.listService.AddTemplate({
                ...this.state.activeTemplate,
                Columns: JSON.stringify(this.state.activeTemplate.Columns)
            });
            this.props.onTemplateAdded(templateItem);
        }
        else {
            await this.listService.UpdateTemplate(this.state.activateTemplateId, {
                ...this.state.activeTemplate,
                Columns: JSON.stringify(this.state.activeTemplate.Columns)
            });
            this._onTemplateUpdated();
        }
        this._setShowTemplatePanel(false)();
    }

    private _setShowTemplatePanel = (showTemplatePanel: boolean): (() => void) => {
        return (): void => {
            this.setState({
                showTemplatePanel
            });
        };
    }

    private _onTemplateUpdated = () => {
        this.props.onTemplateUpdated(this.state.activateTemplateIndex, this.state.activeTemplate);
        this.setState({
            showTemplatePanel: false
        });
    }

    private _removeTempate = async () => {
        this.props.onTemplateRemoved(this.state.activateTemplateId, this.state.activeTemplate);
        this._closeDeleteDialog();
    }

    private _onTemplateChanged = (activeTemplate: ITemplateItem) => {
        this.setState({
            activeTemplate
        });
    }

    private _addNewTemplate = () => {
        this.setState({
            showTemplatePanel: true,
            activeTemplate: this._defaultState.activeTemplate,
            activateTemplateId: null
        });
    }

    private _editTemplate = (item: any, index: number) => {
        this.setState({
            activeTemplate: {
                ...item,
                Columns: isArray(item.Columns) ? item.Columns : JSON.parse(item.Columns)
            },
            showTemplatePanel: true,
            activateTemplateIndex: index,
            activateTemplateId: item.Id
        });
    }

    private _onRenderCell = (item: any, index: number): JSX.Element => {
        return (
            <div className={styles.SettingsPanel} data-is-focusable={true}>
                <div className={`${styles.itemCell} ${index % 2 === 0 && styles.itemCellEven}`} >
                    <div className={styles.itemTitle}>{item.Title}</div>
                    <div className={styles.cellIcons}>
                        <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" ariaLabel="Edit" onClick={() => this._editTemplate(item, index)} />
                        <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => this._showDeleteDialog(item)} />
                    </div>
                </div>
            </div>
        );
    }
}