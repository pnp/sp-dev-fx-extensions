import {
    ListAddResult,
    Web
} from "@pnp/sp";

export default class ListHelper {
    constructor(public webUrl) {

    }
    public ValidatePrintSettingsList() {

        return this.ValidateAndCreateLists();
    }

    private ValidateAndCreateLists() {

        // You might consider creating interfaces for this 
        // structure if you plan to use it a lot.
        const listStructure: any = [
            {
                "ListName": "PrintSettings",
                "ListTemplate": "100",
                "Fields": [
                    "<Field DisplayName='ListId' Type='Text' Required='FALSE' StaticName='ListId' Name='ListId' />",
                    "<Field DisplayName='Header' Type='Note' Required='FALSE' StaticName='Header' Name='Header' NumLines='6' IsolateStyles='FALSE' RestrictedMode='TRUE' AppendOnly='FALSE' UnlimitedLengthInDocumentLibrary='FALSE' RichText='FALSE' RichTextMode='Compatible' />",
                    "<Field DisplayName='Footer' Type='Note' Required='FALSE' StaticName='Footer' Name='Footer' RichText='FALSE' RichTextMode='Compatible' />",
                    "<Field DisplayName='Columns' Type='Note' Required='FALSE' StaticName='Columns' Name='Columns' RichText='FALSE' RichTextMode='Compatible' />",
                    "<Field DisplayName='HeaderAdvancedMode' Type='Boolean' Required='FALSE' StaticName='HeaderAdvancedMode' Name='HeaderAdvancedMode' />",
                    "<Field DisplayName='FooterAdvancedMode' Type='Boolean' Required='FALSE' StaticName='FooterAdvancedMode' Name='FooterAdvancedMode' />",
                    "<Field DisplayName='SkipBlankColumns' Type='Boolean' Required='FALSE' StaticName='SkipBlankColumns' Name='SkipBlankColumns' />"
                ]
            }
        ];

        return Promise.all(listStructure.map((elm) => {
            return this.CreateListInSP(elm);
        }));
    }

    private CreateListInSP(element): Promise<any> {

        // changed to literal url string
        const spWeb = new Web(this.webUrl);
        const spListTitle = element["ListName"];
        const spListTemplate = element["ListTemplate"];
        const fieldsToCreate: string[] = element["Fields"];

        return spWeb.lists.add(spListTitle, "", spListTemplate, false).then(({ list }: ListAddResult) => {

            // add all the fields in a single batch call
            const batch = spWeb.createBatch();

            for (let i = 0; i < fieldsToCreate.length; i++) {
                // add each addText call to the batch
                //list.fields.inBatch(batch).addText(fieldsToCreate[i]);
                list.fields.inBatch(batch).createFieldAsXml(fieldsToCreate[i]);
            }

            // execute the batch
            return batch.execute();
        });
    }
}