import {
    ClientSideText, ClientSideWebpart,
    ClientSideWebpartPropertyTypes, sp, ClientSidePage, CheckinType
} from "@pnp/sp";

export class TemplateBuilderHelper {

    public static async  getInfos(pagename: string): Promise<string> {

        var resultData: any = await sp.web.lists.getByTitle("Site Pages")
            .items.getById(15)
            .select("Title")
            .get();

        return await resultData.Title;
    }

    public static async createCustomPage(pagename: string, pageType: string): Promise<string> {
        const page = await sp.web.addClientSidePage(`MyFirstPage.aspx`);

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

        // we need to save our content changes
        await page.save();
        //const page = await sp.web.addClientSidePage(pagename + ".aspx");
        //console.log("pagetype" + pageType);
        //
        //const partDefs = await sp.web.getClientSideWebParts();

        switch (pageType) {
            case 'A':
                //console.log("case a");

                //const section = page.addSection();
                // page.save();
                //await page.checkin("test",CheckinType.Minor);

                //console.log("section added");

                //// add and get a reference to a new column of factor 6
                //const column1 = section.addColumn(0);

                //// find the definition we want, here by id
                //const partDef = partDefs.filter(c => c.Id === "7f718435-ee4d-431c-bdbf-9c4ff326f46e");

                //// optionally ensure you found the def
                //if (partDef.length < 1) {
                //    // we didn't find it so we throw an error
                //    console.log('ops');
                //    throw new Error("Could not find the web part");
                //}

                //// create a ClientWebPart instance from the definition
                //const part = ClientSideWebpart.fromComponentDef(partDef[0]);
                //// add a text control to the second new column
                //column1.addControl(part);

                //const column2 = section.addColumn(8);
                //console.log("column added case a");

                //// add a text control to the second new column
                //column2.addControl(new ClientSideText("Lorem Ipsum 123"));

                //console.log("case wp added");

                // set the properties on the web part. Here we have imported the ClientSideWebpartPropertyTypes module and can use that to type
                // the available settings object. You can use your own types or help us out and add some typings to the module :).
                // here for the embed web part we only have to supply an embedCode - in this case a youtube video.
                //part.setProperties<ClientSideWebpartPropertyTypes.Embed>({
                //    embedCode: "https://www.youtube.com/watch?v=IWQFZ7Lx-rg",
                //});

                // we add that part to a new section
                //page.addSection().addControl(part);

                // we need to save our content changes
                break;

            default:
                break;
        }
        //await page.save();
        console.log("case saved");

        return await "done";
    }
}