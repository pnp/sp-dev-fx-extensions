import * as React from 'react';
import { initializeIcons } from '@uifabric/icons';
import ReactToPrint from "react-to-print";
import styles from './print-dialog.module.scss';
import {
    DialogContent, IDropdownOption
} from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import IPrintDialogContentProps from './print-dialog-content-props';
import IPrintDialogContentState from './print-dialog-content-state';
import PrintTemplateContent from '../print-dialog-template-content/print-template-content';
import SettingsPanel from '../settings-panel/settings-panel';
// import ListHelper from '../../util/list-helper';
import ReactHtmlParser from 'react-html-parser';
import {
    Dropdown
} from 'office-ui-fabric-react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import ListService from '../../services/list-service';
import { isArray } from '@pnp/common';
import ITemplateItem from '../../models/template-item';
import { style } from 'typestyle';
import printStyles from '../print-dialog-template-content/print-template-content.module.scss';
import { sp, EmailProperties } from '@pnp/sp';
import reactElementToJSXString from 'react-element-to-jsx-string';

const _items: any[] = [];
export default class PrintDialogContent extends React.Component<IPrintDialogContentProps, IPrintDialogContentState> {
    private componentRef;
    private listService: ListService;
    constructor(props) {
        super(props);

        if (_items.length === 0) {
            for (let i = 0; i < 10; i++) {
                _items.push({
                    key: i,
                    name: 'Item ' + i,
                    value: i
                });
            }
        }

        this.state = {
            hideLoading: false,
            loadingMessage: "Loading...",
            templates: [],
            items: _items,
            showPanel: false,
            hideTemplateLoading: true,
            printTemplate: null,
            selectedTemplateIndex: -1,
            itemContent: {},
            isSiteAdmin: false
        };
        this.listService = new ListService();
        // Initialize icons
        initializeIcons();
    }

    public componentDidMount() {

        // Validate and create Print Settings list --> added list definition to elements.xml for adding Print List Settings
        // this.initializeSettings();
        // Get templates
        this.getTemplates();
        // Get select item values
        this.getItemContent();
    }

    public render(): JSX.Element {
        const templates = this.state.templates;
        const options = templates.length>0 ? templates.map(t => ({ key: t.Id, text: t.Title })) : [];
        return <div className={styles.PrintDialogContent}>
            <DialogContent
                title={`Print ${this.props.title}`}
                onDismiss={this.props.close}
                showCloseButton={true}
            >

                <div className="ms-grid-row">
                    <Spinner hidden={this.state.hideLoading} size={SpinnerSize.large} label={this.state.loadingMessage} ariaLive="assertive" />
                </div>
                <div className="ms-Grid" dir="ltr" hidden={!this.state.hideLoading}>
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm8 ms-md8 ms-lg8">
                            <Dropdown
                                placeHolder="Select your template..."
                                options={options}
                                onChanged={this._onDropDownChanged}
                            />
                        </div>
                        <div className={styles.printIcons + " ms-Grid-col ms-sm4 ms-md4 ms-lg4"}>
                            <ReactToPrint
                                trigger={() => <IconButton iconProps={{ iconName: 'Print' }} title="Print" ariaLabel="Print" />}
                                content={() => this.componentRef}
                            />
                            <span hidden={false}>
                                <IconButton iconProps={{ iconName: 'Mail' }} title="Mail" ariaLabel="Mail" onClick={this._sendAsEmail} />
                            </span>
                            <span hidden={!this.state.isSiteAdmin}><IconButton iconProps={{ iconName: 'Settings' }} title="Settings" ariaLabel="Settings" onClick={this._setShowPanel(true)} /></span>
                        </div>
                    </div>
                    <div className={`${styles.loadingMargin} ms-grid-row`}>
                        <Spinner hidden={this.state.hideTemplateLoading} size={SpinnerSize.large} label={this.state.loadingMessage} ariaLive="assertive" />
                    </div>
                    <div hidden={!this.state.printTemplate} className={`${styles.templateContent} ms-grid-row`}>
                        <PrintTemplateContent itemId={this.props.itemId} template={this.state.printTemplate} ref={el => (this.componentRef = el)} />
                    </div>
                </div>
                <SettingsPanel onTemplateAdded={this._onTemplateAdded}
                    onTemplateRemoved={this._onTemplateRemoved}
                    onTemplateUpdated={this._onTemplateUpdated}
                    templates={isArray(templates) ? templates : []} showPanel={this.state.showPanel} setShowPanel={this._setShowPanel} listId={this.props.listId} />
            </DialogContent>
        </div>;
    }

    /**
     * This function will be implemented for the next version
     */
    private _sendAsEmail = () => {

        if (this.state.printTemplate) {
            const Body = reactElementToJSXString(this._makeEmailBody());
            console.log("hello");
            console.log(Body);
            const email: EmailProperties = {
                To: ["ramin@raminahmadi.onmicrosoft.com"],
                Body,
                Subject: "Test"
            };
            sp.utility.sendEmail(email).then();
        }

    }

    /**
     * This function will be implemented for the next version
     */
    private _makeEmailBody = (): any => {
        return <div className={printStyles.Print}>
            {this.state.printTemplate &&
                <div className={printStyles.Print}>
                    <div className={printStyles.printHeader}>
                        {ReactHtmlParser(this.state.printTemplate.header)}
                    </div>
                    <div className={printStyles.printContent}>
                        {
                            this.state.printTemplate.content
                        }
                    </div>
                    <div className={printStyles.printFooter}>
                        {ReactHtmlParser(this.state.printTemplate.footer)}
                    </div>

                </div>
            }
        </div>;
    }

    /**
     * This function will concat the added templated to the templates list
     */
    private _onTemplateAdded = (template: ITemplateItem) => {
        this.setState(prevState => (
            {
                templates: prevState.templates.concat(template)
            }
        ));
    }

    /**
     * This function loads the selected template and display it
     */
    private _onDropDownChanged = (option: IDropdownOption, index?: number) => {
        const template = this.state.templates[index];
        this.loadTemplate(template);
        this.setState({
            selectedTemplateIndex: index
        });
    }

    /**
     * This function updates the templates list when a template updated
     */
    private _onTemplateUpdated = (index: number, template: ITemplateItem) => {
        const newTemplatesList = [...this.state.templates];
        newTemplatesList[index] = { ...template };
        this.setState({
            templates: newTemplatesList
        });

        // if user already select the updated template, update the UI with the latest changes
        if (this.state.selectedTemplateIndex === index)
            this.loadTemplate(template);

    }

    /**
     * This function loads the template and render it
     */
    private loadTemplate = (template: any) => {

        // Display loading indicator
        this.setState({
            hideTemplateLoading: false
        });

        // Get the columns to be displayed, if user updated the template recently, doesn't need to be parse it as an array
        const columns: any[] = isArray(template.Columns) ? template.Columns : JSON.parse(template.Columns);

        // For storing non-section fields
        let table: any[] = [];

        // The final print elements
        const content: any[] = [];

        if (columns.length > 0) {
            for (var i = 0; i < columns.length; i++) {
                const item = columns[i];
                if (item.Type === "Section") {
                    // If it's a section, first check if there is any field before this section and add it to the content
                    if (table.length > 0) {
                        content.push(
                            // Make the table of content
                            this._makeFieldsTable(table)
                        );
                    }
                    // Adding the section to the content with customized background and font color
                    const { BackgroundColor, FontColor } = item;
                    const sectionStyles = { backgroundColor: BackgroundColor, color: FontColor };
                    const className = style(sectionStyles);
                    content.push(<div className={`${styles.templateSection} ${className}`} style={sectionStyles}><span>{item.Title}</span></div>);

                    // Reset the table array for upcoming fields
                    table = [];
                }

                // If it's a field add it to the table
                if (item.Type === "Field") {
                    // If it has no value and Skip Blank Columns enables for this template, skip the field
                    if (template.SkipBlankColumns) {
                        if (this.state.itemContent[item.InternalName].length > 0)
                            table.push({
                                Name: item.Title,
                                Value: this.state.itemContent[item.InternalName]
                            });
                    }
                    else {
                        // Add it to the table even if it has no value (only if Skip Blank Columns not enabled)
                        table.push({
                            Name: item.Title,
                            Value: this.state.itemContent[item.InternalName]
                        });
                    }

                }
                // If it goes through all of the fields and the sections and the table is not empty, just add the remaining fields at the end of the content elements
                if (i + 1 === columns.length && table.length > 0) {
                    content.push(this._makeFieldsTable(table));
                }
            }
        }

        // Hide loading indicator, set the print template to be ready for print
        this.setState({
            printTemplate: {
                header: template.Header,
                footer: template.Footer,
                content
            },
            hideTemplateLoading: true
        });
    }

    /**
     * Make table of fields including Field Name and Field Value
     */
    private _makeFieldsTable = (table: any): JSX.Element => {
        return <table className={styles.templateTable}>
            {
                table.map(el => <tr>
                    <td className={styles.nameColumn}>
                        {el.Name}
                    </td>
                    <td className={styles.valueColumn}>
                        {el.Value}
                    </td>
                </tr>)
            }
        </table>;
    }

    /**
     * Remove the template from the templates list
     */
    private _onTemplateRemoved = async (id: number, template: ITemplateItem) => {
        const removedItem = await this.listService.removeTempate(id);
        if (removedItem)
            this.setState(prevState => ({
                templates: prevState.templates.filter(el => el != template)
            }));
    }

    // Open or Close the Settings panel
    public _setShowPanel = (showPanel: boolean): (() => void) => {
        return (): void => {
            this.setState({ showPanel });
        };
    }

    // Check if Print Settings list exists, otherwise create it
    /*
    private initializeSettings = async () => {
        const listHelper = new ListHelper(this.props.webUrl);

        listHelper.ValidatePrintSettingsList().then(_ => {
            this.setState({
                hideLoading: true
            });
        }).catch(e => {
            // Print Settings list already exists
            this.getTemplates();
        });
    }
    */
    // Get all available templates for this list
    private getTemplates = async () => {
        this.setState({
            hideLoading: false
        });
        const templates = await this.listService.GetTemplatesByListId(this.props.listId);
        this.setState({
            templates,
            hideLoading: true
        });
    }

    // Gets all fields name and value for selected item, also checks if current user is able to open settings panel
    private getItemContent = async () => {
        const { listId, itemId } = this.props;
        const itemContent = await this.listService.GetItemById(listId, itemId);
        const isSiteAdmin = await this.listService.IsCurrentUserSiteAdmin();
        this.setState({
            itemContent,
            isSiteAdmin
        });
    }
}