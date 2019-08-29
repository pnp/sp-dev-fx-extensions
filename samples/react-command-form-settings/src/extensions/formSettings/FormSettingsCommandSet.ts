import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
  Command
} from '@microsoft/sp-listview-extensibility';
import * as $ from 'jquery';
import ListService from './services/list-service';
import IFormItem from './models/form-item';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormsSettingsCommandSetProperties {

}

const LOG_SOURCE: string = 'FormsSettingsCommandSet';

export default class FormsSettingsCommandSet extends BaseListViewCommandSet<IFormsSettingsCommandSetProperties> {
  private listService = new ListService();
  private formSettings: IFormItem[] = [];
  private contentTypes: any[] = [];
  private editForms: IFormItem[];
  private displayForms: IFormItem[];
  private selectedRow = null;
  private itemId: number;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized FormsSettingsCommandSet');

    return Promise.resolve();
  }

  @override
  public async onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): Promise<void> {
    const listId = String(this.context.pageContext.list.id);
    // Retrive form settings for current list
    if (this.formSettings.length <= 0)
      this.formSettings = await this.listService.getEnabledFormSettings(listId);
    // Get available content types
    if (this.contentTypes.length <= 0)
      this.contentTypes = await this.listService.getListContentTypes(listId);

    // Override New buttons' click event
    const newForms = this.formSettings.filter(i => i.FormType === "New");
    this.overrideNewFormSettings(newForms, this.contentTypes.length);

    $("body").on("click", `button[data-automationid='FieldRenderer-name']`, (e) => {
      this.selectedRow = $(e.target).parents().closest("div[data-automationid='DetailsRow']");
      this.selectedRow.trigger("click");
      e.stopPropagation();
    });

    $("body").on("click","button[data-automationid='FieldRender-DotDotDot']",(e)=>{
      this.selectedRow=null;
    });
    // When users click on Title this method is not fired, so workground is to select the row to trigger this event

    if (event.selectedRows.length > 0) {
      // Get item Id to be replaced in with {ItemId} token
      this.itemId = event.selectedRows[0].getValueByName("ID");

      // If we have more than one content type, we need to filter the settings based on content types to override the events
      if (this.contentTypes.length > 1) {
        // Get content type value, if you have more than one, you have to add Content Type column to the list views
        const contentType = event.selectedRows[0].getValueByName("ContentType");
        this.editForms = this.formSettings.filter(i => i.ContentTypeName === contentType && i.FormType === "Edit");
        this.displayForms = this.formSettings.filter(i => i.ContentTypeName === contentType && i.FormType === "Display");
      }
      else {
        this.editForms = this.formSettings.filter(i => i.FormType === "Edit");
        this.displayForms = this.formSettings.filter(i => i.FormType === "Display");
      }
      // Override Edit button's click event
      if (this.editForms.length > 0)
        this.overrideOnClick("Edit", this.editForms[0]);
      else
        $("body").unbind("click.edit");


      // Override Open button's click event
      if (this.displayForms.length > 0) {
        this.overrideOnClick("Open", this.displayForms[0]);
        // If user clicks on Title field, we trigger the overrided event
        if (this.selectedRow) {
          this.selectedRow = null;
          this.redirect(this.displayForms[0]);
        }
      }
      else {
        this.selectedRow = null;
      }
    }
  }

  /**
    * Open settings panel component
  */
  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    if (event.itemId === "COMMAND_Form_Settings") {
      const component = await import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: 'multisharedialog-component' */
        './components/container/container'
      );

      const panel = new component.container();
      panel.listId = this.context.pageContext.list.id.toString();
      panel.formSettings = this.formSettings;
      panel.contentTypes = this.contentTypes;
      panel.render();

    }
  }
  /**
    * Override new form settings
  */
  private async overrideNewFormSettings(formSettings: IFormItem[], ctCount: number) {
    // override if only one content type exists in the list

    if (ctCount < 2)
      this.overrideOnClick("New", formSettings[0]);
    else {

      formSettings.map(form => {
        this.overrideOnClick(form.ContentTypeName, form);
      });
    }
  }
  /**
    * Override buttons' event
  */
  private overrideOnClick(tagName: string, settings: IFormItem) {
    $("body").on("click.edit", `button[name='${tagName}']`, (e) => {
      switch (tagName) {
        case "Edit":
          this.redirect(settings); return false;
        case "Open":
          this.redirect(settings); return false;
        default:
          this.redirect(settings); return false;
      }
    });
  }
  /**
    * Redirect window based on form settings
  */
  private redirect(settings: IFormItem) {
    const { OpenIn, RedirectURL, Parameters } = settings;
    let tokens = "";
    tokens = Parameters && Parameters.length > 0 ? `?${this.replaceTokens(Parameters)}` : "";
    switch (OpenIn) {
      case "Current Window":
        window.location.href = `${RedirectURL}${tokens}`;
        break;
      case "New Tab":
        window.open(`${RedirectURL}${tokens}`, "_blank");
        break;
    }
  }
  /**
    * Replace tokens
  */
  private replaceTokens(tokens: string) {
    if (!tokens)
      return "";
    return tokens.replace("{ListId}", String(this.context.pageContext.list.id))
      .replace("{WebUrl}", this.context.pageContext.web.absoluteUrl)
      .replace("{SiteUrl}", this.context.pageContext.site.absoluteUrl)
      .replace("{UserLoginName}", this.context.pageContext.user.loginName)
      .replace("{UserDisplayName}", this.context.pageContext.user.displayName)
      .replace("{UserEmail}", this.context.pageContext.user.email)
      .replace("{ItemId}", String(this.itemId));
  }
}
