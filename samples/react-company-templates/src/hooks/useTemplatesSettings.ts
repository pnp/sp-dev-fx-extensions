import { BaseComponentContext } from "@microsoft/sp-component-base";
import * as React from "react";
import { SPFx, spfi } from "@pnp/sp";
import "@pnp/sp/appcatalog";
import "@pnp/sp/webs";

export type EasyTemplatesSettings = {
  site?: string;
  list?: string;
  categoryField?: {
    Id: string;
    InternalName: string;
  }
}

export default function useTemplatesSettings(context: BaseComponentContext): {
  settings: EasyTemplatesSettings,
  setSettings: (settings: EasyTemplatesSettings) => void,
  storeListSettings: () => Promise<void>
} {
  const [settings, setSettings] = React.useState<EasyTemplatesSettings>({ site: undefined, list: undefined, categoryField: undefined });

  async function storeListSettings(): Promise<void> {
    const sp = spfi().using(SPFx(context));
    const w = await sp.getTenantAppCatalogWeb();

    // specify required key and value
    await w.setStorageEntity("easyTemplatesSettings", JSON.stringify({ categoryField: settings.categoryField, site: settings.site, list: settings.list }));
    console.log('Settings saved:');
    console.log(settings)
  }
  
  async function fetchListSettings(): Promise<void> {
    const  sp = spfi().using(SPFx(context));
    try {
      const settingsData = (await sp.web.getStorageEntity("easyTemplatesSettings"))?.Value;
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        setSettings({ site: settings.site, list: settings.list, categoryField: settings.categoryField });
      }
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    fetchListSettings().catch(error => console.log(error));
  }, [context]);

  return { settings, setSettings, storeListSettings };
}