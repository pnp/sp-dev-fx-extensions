import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { Site } from 'sp-pnp-js';

export interface IRunOnceApplicationCustomizerProperties {
    property: string;
}

export default class RunOnceApplicationCustomizer
    extends BaseApplicationCustomizer<IRunOnceApplicationCustomizerProperties> {

    @override
    public onInit(): Promise<void> {
        // Need to be admin in order to remove the customizer - if not skip doing the work
        // For Group sites, the owners will be site admins
        let isSiteAdmin = this.context.pageContext.legacyPageContext.isSiteAdmin;
        if (isSiteAdmin) {
            this.DoWork(this.properties.property);
        }
        return Promise.resolve();
    }

    private async DoWork(data: string) {
        Dialog.alert(data);
        // use await if you want to block the dialog before continue
        //await Dialog.alert(data);

        window.setTimeout(async () => {
            console.log("We have waited...");
            this.removeCustomizer();
        }, 3000);
    }

    private async removeCustomizer() {
        // Remove custom action from current sute
        let site = new Site(this.context.pageContext.site.absoluteUrl);
        let customActions = await site.userCustomActions.get(); // if installed as web scope, change this line to get the user customactions from the appropriate web
        for (let i = 0; i < customActions.length; i++) {
            var instance = customActions[i];
            if (instance.ClientSideComponentId === this.componentId) {
                await site.userCustomActions.getById(instance.Id).delete(); // if insatalled at the web scope, change this line to delete customaction from appropriate web as well
                console.log("Extension removed");
                // reload the page once done if needed
                window.location.href = window.location.href;
                break;
            }
        }
    }
}
