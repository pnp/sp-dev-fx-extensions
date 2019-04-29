import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './add-update-template.module.scss';
import { modules, formats } from './editor-toolbar';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import AddUpdateTemplatePanelState from './add-update-template-panel-state';
import AddUpdateTemplatePanelProps from './add-update-template-panel-props';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IDragDropEvents } from 'office-ui-fabric-react/lib/utilities/dragdrop/interfaces';
import { DetailsList, IColumn, Selection, DetailsListLayoutMode, IDetailsRowProps, SelectionMode, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList';
import { IColumnReorderOptions } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import ListService from '../../services/list-service';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { ColorPicker } from 'office-ui-fabric-react/lib/ColorPicker';
import { style } from "typestyle";
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

let _draggedItem: any = null;
let _draggedIndex = -1;
let _draggedType: string = "Fields";
export default class AddUpdateTemplate extends React.Component<AddUpdateTemplatePanelProps, AddUpdateTemplatePanelState> {
    private listService: ListService;
    private _fieldSelection: Selection;
    private _itemSelection: Selection;
    private _columns: IColumn[] = [
        {
            key: 'Title',
            name: 'Field',
            fieldName: 'Title',
            minWidth: 120,
            isResizable: true,
            ariaLabel: 'Operations for Field'
        }];
    private _itemColumns: IColumn[] = [
        {
            key: 'Title',
            name: 'Field',
            fieldName: 'Title',
            minWidth: 90,
            isResizable: true,
            ariaLabel: 'Operations for Field'
        }, {
            key: 'manage',
            name: 'Manage',
            fieldName: '',
            minWidth: 50,
            isResizable: false
        }];
    private _defautState: any;
    private _sectionBackgroundColor: string;
    private _sectionFontColor: string;
    private _selectedColor: string;
    constructor(props) {
        super(props);

        this.listService = new ListService();
        this._sectionBackgroundColor = '#CECECE';
        this._sectionFontColor = '#000';
        this._selectedColor = '#000';
        this._defautState = {
            helperItems: [{
                Title: 'Drag your fields here'
            }],
            listId: this.props.listId,
            templateColumns: [],
            section: {
                Title: '',
                Id: '',
                BackgroundColor: this._sectionBackgroundColor,
                FontColor: this._sectionFontColor,
                Type: 'Section'
            },
            columns: this._columns,
            itemColumns: this._itemColumns,
            isColumnReorderEnabled: false,
            frozenColumnCountFromStart: '1',
            frozenColumnCountFromEnd: '0',
            showColorPicker: false,
            isFontColorPicker: false,
            sectionErrorMessage: '',
            titleErrorMessage: ''
        };
        this.state = {
            ...this._defautState,
            fields: []
        };

        this._fieldSelection = new Selection();
        this._itemSelection = new Selection();
    }

    public async componentDidMount() {
        let fields: any[] = await this.listService.GetFieldsbyListId(this.props.listId);
        this.setState({
            fields
        });
    }

    public render() {
        const { fields, columns, itemColumns, helperItems } = this.state;
        const { Title, Header, Footer, HeaderAdvancedMode, FooterAdvancedMode, SkipBlankColumns } = this.props.template;
        const items = this.props.template.Columns;

        return (
            <div>
                <Panel
                    isOpen={this.props.showTemplatePanel}
                    type={PanelType.largeFixed}
                    onDismiss={this._onClosePanel}
                    isFooterAtBottom={true}
                    headerText="Add/Update template"
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={this._onRenderFooterContent}
                >
                    <div className={`${styles.AddUpdateTemplate} ms-Grid}`}>
                        <TextField value={Title} label="Name" errorMessage={this.state.titleErrorMessage} onChanged={(name) => { this.props.onTemplateChanged({ ...this.props.template, Title: name }); this.setState({ titleErrorMessage: '' }); }} />
                        <Label>Columns (Drag fields from the left table to the right one)</Label>
                        <div className="ms-Grid-row">
                            <div className={`ms-Grid-col ms-sm6 ms-md6 ms-lg6`}>
                                <MarqueeSelection selection={this._fieldSelection}>
                                    <DetailsList
                                        className={styles.detailsList}
                                        isHeaderVisible={false}
                                        layoutMode={DetailsListLayoutMode.fixedColumns}
                                        setKey={'fields'}
                                        items={fields}
                                        columns={columns}
                                        selection={this._fieldSelection}
                                        selectionPreservedOnEmptyClick={true}
                                        dragDropEvents={this._getFieldsDragEvents()}
                                        ariaLabelForSelectionColumn="Toggle selection"
                                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                                    />
                                </MarqueeSelection>
                            </div>
                            <div className={`ms-Grid-col ms-sm6 ms-md6 ms-lg6`}>
                                {
                                    items.length > 0 ?
                                        <MarqueeSelection selection={this._itemSelection}>
                                            <DetailsList
                                                className={styles.detailsList}
                                                isHeaderVisible={false}
                                                layoutMode={DetailsListLayoutMode.justified}
                                                setKey={'Id'}
                                                items={items}
                                                columns={itemColumns}
                                                selection={this._itemSelection}
                                                selectionPreservedOnEmptyClick={true}
                                                onRenderItemColumn={this._renderItemColumn}
                                                onRenderRow={this._renderRow}
                                                dragDropEvents={this._getDragDropEvents()}
                                                columnReorderOptions={this.state.isColumnReorderEnabled ? this._getColumnReorderOptions() : undefined}
                                                ariaLabelForSelectionColumn="Toggle selection"
                                                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                                            />
                                        </MarqueeSelection>
                                        :
                                        <DetailsList
                                            className={styles.detailsList}
                                            isHeaderVisible={false}
                                            items={helperItems}
                                            columns={columns}
                                            selectionMode={SelectionMode.none}
                                            selectionPreservedOnEmptyClick={false}
                                            dragDropEvents={this._getDragDropEvents()}
                                        />
                                }

                            </div>
                        </div>
                        <Label>Add section</Label>
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm10 ms-md10 ms-lg10">
                                <TextField errorMessage={this.state.sectionErrorMessage} onChanged={(value) => this.setState({ section: { ...this.state.section, Title: value, Id: value }, sectionErrorMessage: '' })} value={this.state.section.Title} />

                            </div>
                            <div className="ms-Grid-col ms-sm1 ms-md2 ms-lg2">
                                <IconButton iconProps={{ iconName: 'Color' }} title="Background Color" style={{ color: this.state.section.BackgroundColor }} ariaLabel="Background Color" onClick={() => this._openColorPicker(false)} />
                                <IconButton iconProps={{ iconName: 'FontColor' }} title="Font Color" style={{ color: this.state.section.FontColor }} ariaLabel="Font Color" onClick={() => this._openColorPicker(true)} />
                                <IconButton iconProps={{ iconName: 'Accept' }} title="Accept" ariaLabel="Accept" onClick={this._addSection} />
                            </div>
                        </div>

                        <Toggle
                            defaultChecked={HeaderAdvancedMode}
                            label="Header"
                            onText="Advanced mode"
                            offText="Simple mode"                            
                            onChanged={this._headerAdvancedToggleChange}
                        />
                        <div className={styles.editorContainer}>
                            <div hidden={HeaderAdvancedMode}>
                                <ReactQuill modules={modules} formats={formats} className={styles.quillEditor} value={HeaderAdvancedMode ? '' : Header} onChange={this._headerEditorChange} />
                            </div>
                            <div hidden={!HeaderAdvancedMode}>
                                <TextField multiline rows={11} placeholder="Put your HTML code here..." value={Header} onChanged={(value) => this.props.onTemplateChanged({ ...this.props.template, Header: value })} />
                            </div>
                        </div>
                        <Toggle
                            defaultChecked={FooterAdvancedMode}
                            label="Footer"
                            onText="Advanced mode"
                            offText="Simple mode"
                            onChanged={this._footerAdvancedToggleChange}
                        />
                        <div className={styles.editorContainer}>

                            <div hidden={FooterAdvancedMode}>
                                <ReactQuill modules={modules} formats={formats} className={styles.quillEditor} value={FooterAdvancedMode ? '' : Footer} onChange={this._footerEditorChange} />
                            </div>
                            <div hidden={!FooterAdvancedMode}>
                                <TextField multiline rows={11} value={Footer} onChanged={(value) => this.props.onTemplateChanged({ ...this.props.template, Footer: value })} placeholder="Put your HTML code here..." />
                            </div>
                        </div>
                        <Toggle
                            defaultChecked={SkipBlankColumns}
                            label="Skip blank columns"
                            onText="On"
                            offText="Off"
                            onChanged={this._skipBlankColumnsToggleChange}
                        />
                    </div>
                    <Dialog
                        onDismissed={this._closeColorPicker}
                        isClickableOutsideFocusTrap={true}
                        isOpen={this.state.showColorPicker}
                        ignoreExternalFocusing={true}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Color picker',
                            showCloseButton: true
                        }}
                        modalProps={{
                            titleAriaId: 'myLabelId',
                            ignoreExternalFocusing: true,

                            subtitleAriaId: 'mySubTextId',
                            isBlocking: true,
                            containerClassName: 'ms-dialogMainOverride'
                        }}
                    >
                        <ColorPicker color={this._selectedColor} onColorChanged={this._onColorChange} />
                        <DialogFooter>
                            <PrimaryButton onClick={this._onColorSelected} text="OK" />
                            <DefaultButton onClick={this._closeColorPicker} text="Cancel" />
                        </DialogFooter>
                    </Dialog>
                </Panel>

            </div>

        );
    }

    private _skipBlankColumnsToggleChange = (value) => {
        this.props.onTemplateChanged({ ...this.props.template, SkipBlankColumns: value });
    }

    private _headerEditorChange = (value) => {
        this.props.onTemplateChanged({ ...this.props.template, Header: value });
    }

    private _footerEditorChange = (value) => {
        this.props.onTemplateChanged({ ...this.props.template, Footer: value });
    }

    private _headerAdvancedToggleChange = (checked: boolean) => {
        this.props.onTemplateChanged({
            ...this.props.template,
            HeaderAdvancedMode: checked
        });
    }

    private _footerAdvancedToggleChange = (checked: boolean) => {
        this.props.onTemplateChanged({
            ...this.props.template,
            FooterAdvancedMode: checked
        });
    }

    private _openColorPicker = (isFontColorPicker: boolean) => {
        this.setState({
            showColorPicker: true,
            isFontColorPicker
        });
    }
    private _onColorChange = (color: string): void => {
        this._selectedColor = color;
    }

    private _closeColorPicker = () => {
        this.setState({
            showColorPicker: false
        });
    }

    private _onColorSelected = () => {
        const fontColorChanged = this.state.isFontColorPicker;
        this.setState({
            showColorPicker: false,
            section: {
                ...this.state.section,
                BackgroundColor: !fontColorChanged ? this._selectedColor : this.state.section.BackgroundColor,
                FontColor: fontColorChanged ? this._selectedColor : this.state.section.FontColor
            }
        });
    }

    private _addSection = () => {

        if (this.state.section.Title.length < 1) {
            this.setState({
                sectionErrorMessage: 'Please enter a name for your section'
            });
        }
        else {
            this.setState({
                section: this._defautState.section,
                sectionErrorMessage: ''
            });
            this.props.onTemplateChanged(
                {
                    ...this.props.template,
                    Columns: this.props.template.Columns.concat(this.state.section)
                }
            );
        }


    }

    public _onClosePanel = () => {
        this.setState({ ...this._defautState });
        this.props.setShowTemplatePanel(false)();
    }

    private _onRenderFooterContent = (): JSX.Element => {
        return (
            <div>
                <PrimaryButton onClick={this._saveTemplate} style={{ marginRight: '8px' }}>Save</PrimaryButton>
                <DefaultButton onClick={() => this._onClosePanel()}>Cancel</DefaultButton>
            </div>
        );
    }

    private _saveTemplate = () => {
        if (this.props.template.Title.length < 1)
            this.setState({
                titleErrorMessage: 'Please enter a name for your template'
            });
        else
            this.props.onTemplateSaved();
    }

    private _renderRow = (props: IDetailsRowProps, defaultRender?: any) => {
        if (props.item.Type === 'Section') {
            const { BackgroundColor, FontColor } = props.item;
            const className = style({ backgroundColor: BackgroundColor, color: FontColor });
            return <DetailsRow {...props} className={className} />;
        }
        return <DetailsRow {...props} />;
    }

    private _renderItemColumn = (item: any, index: number, column: IColumn) => {
        const fieldContent = item[column.fieldName || ''];
        switch (column.key) {
            case 'manage':
                return <IconButton className={styles.removeIconContainer} onClick={() => this._onRemoveItem(item)} iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" />;
            default:
                return <span>{fieldContent}</span>;
        }
    }

    private _onRemoveItem = (item: any) => {
        this.props.onTemplateChanged({
            ...this.props.template,
            Columns: this.props.template.Columns.filter(el => el != item)
        });

    }
    // Details list methods

    private _handleColumnReorder = (draggedIndex: number, targetIndex: number) => {
        const draggedItems = this.state.columns[draggedIndex];
        const newColumns: IColumn[] = [...this.state.columns];

        // insert before the dropped item
        newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedItems);
        this.setState({ columns: newColumns });
    }

    private _getColumnReorderOptions = (): IColumnReorderOptions => {
        return {
            frozenColumnCountFromStart: parseInt(this.state.frozenColumnCountFromStart, 10),
            frozenColumnCountFromEnd: parseInt(this.state.frozenColumnCountFromEnd, 10),
            handleColumnReorder: this._handleColumnReorder
        };
    }

    private _getFieldsDragEvents = (): IDragDropEvents => {
        return {
            canDrop: () => {
                return false;
            },
            canDrag: () => {
                return true;
            },
            onDragEnter: () => {
                return 'dragEnter';
            }, // return string is the css classes that will be added to the entering element.
            onDragLeave: () => {
                return;
            },
            onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
                _draggedItem = item;
                _draggedIndex = itemIndex!;
                _draggedType = "Fields";
            },
            onDragEnd: (item?: any, event?: DragEvent) => {
                _draggedItem = null;
                _draggedIndex = -1;

            }
        };
    }

    private _getDragDropEvents = (): IDragDropEvents => {
        return {
            canDrop: () => {
                return true;
            },
            canDrag: () => {
                return true;
            },
            onDragEnter: () => {
                return 'dragEnter';
            }, // return string is the css classes that will be added to the entering element.
            onDragLeave: () => {
                return;
            },
            onDrop: (item?: any, event?: DragEvent) => {
                if (_draggedItem) {
                    this._insertAfterItem(item);
                }
            },
            onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
                _draggedItem = item;
                _draggedIndex = itemIndex!;
                _draggedType = "Items";
            },
            onDragEnd: (item?: any, event?: DragEvent) => {

                _draggedItem = null;
                _draggedIndex = -1;

            }
        };
    }

    private _insertAfterItem = (item: any): void => {
        const draggedItems = _draggedType === "Fields" ? this._fieldSelection.isIndexSelected(_draggedIndex) ? this._fieldSelection.getSelection() : [_draggedItem] : this._itemSelection.isIndexSelected(_draggedIndex) ? this._itemSelection.getSelection() : [_draggedItem];
        
        const items: any[] = this.props.template.Columns.filter((i: number) => draggedItems.indexOf(i) === -1);
        let insertIndex = items.indexOf(item);
        // if dragging/dropping on itself, index will be 0.
        if (insertIndex === -1) {
            insertIndex = 0;
        }

        // Insert dragged items to the collection
        items.splice(insertIndex + 1, 0, ...draggedItems);

        // Clear the selection
        this._fieldSelection.setAllSelected(false);

        // Update the state
        this.props.onTemplateChanged({
            ...this.props.template,
            Columns: items
        });
    }
}