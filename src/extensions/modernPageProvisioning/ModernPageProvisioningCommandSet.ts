import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import {
  ClientSideText, ClientSideWebpart,
  ClientSideWebpartPropertyTypes, sp
} from "@pnp/sp";

import TemplateBuilderDialog from './components/TemplateBuilderDialog'


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IModernPageProvisioningCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
}

const LOG_SOURCE: string = 'ModernPageProvisioningCommandSet';

export default class ModernPageProvisioningCommandSet extends BaseListViewCommandSet<IModernPageProvisioningCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ModernPageProvisioningCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {

  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case 'COMMAND_1':

        const dialog : TemplateBuilderDialog = new TemplateBuilderDialog();
        dialog.show();
        
        break;
      default:
        throw new Error('Unknown command');

    }
  }


  private async createCustomPage(pagename: string): Promise<void> {
    const page = await sp.web.addClientSidePage(pagename + ".aspx");
    // this code adds a section, and then adds a control to that section. The control is added to the section's defaultColumn, and if there are no columns a single
    // column of factor 12 is created as a default. Here we add the ClientSideText part
    page.addSection().addControl(new ClientSideText("@pnp/sp is a great library!"));

    // here we add a section, add two columns, and add a text control to the second section so it will appear on the right of the page
    // add and get a reference to a new section
    const section = page.addSection();

    // add a column of factor 6
    section.addColumn(6);

    // add and get a reference to a new column of factor 6
    const column = section.addColumn(6);

    // add a text control to the second new column
    column.addControl(new ClientSideText("Be sure to check out the @pnp docs at https://pnp.github.io/pnpjs/"));

    const partDefs = await sp.web.getClientSideWebParts();

    // find the definition we want, here by id
    const partDef = partDefs.filter(c => c.Id === "490d7c76-1824-45b2-9de3-676421c997fa");

    // optionally ensure you found the def
    if (partDef.length < 1) {
      // we didn't find it so we throw an error
      throw new Error("Could not find the web part");
    }

    // create a ClientWebPart instance from the definition
    const part = ClientSideWebpart.fromComponentDef(partDef[0]);

    // set the properties on the web part. Here we have imported the ClientSideWebpartPropertyTypes module and can use that to type
    // the available settings object. You can use your own types or help us out and add some typings to the module :).
    // here for the embed web part we only have to supply an embedCode - in this case a youtube video.
    part.setProperties<ClientSideWebpartPropertyTypes.Embed>({
      embedCode: "https://www.youtube.com/watch?v=IWQFZ7Lx-rg",
    });

    // we add that part to a new section
    page.addSection().addControl(part);

    // save our content changes back to the server
    await page.save();

    // we need to save our content changes
    await page.save();
  }
}
