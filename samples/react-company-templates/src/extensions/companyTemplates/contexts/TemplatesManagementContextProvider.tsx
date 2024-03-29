import * as React from "react";
import { TemplatesManagementContext } from "./TemplatesManagementContext";
import { TemplateFile, useTemplateFiles } from "../../../hooks/useTemplateFiles";
import { SPFxContext } from "./SPFxContext";
import { SPFx, spfi } from '@pnp/sp';
import { IFile } from "@pnp/sp/files";

type TemplatesManagementContextProviderProps = {}

export const TemplatesManagementContextProvider: React.FC<TemplatesManagementContextProviderProps> = (props: React.PropsWithChildren<TemplatesManagementContextProviderProps>) => {
  const context = React.useContext(SPFxContext).context;
  const { templateFiles, templateFilesByCategory, loading, initWithListParams } = useTemplateFiles({ listId: undefined, webUrl: undefined });
  const [selectedTemplateFiles, setSelectedTemplateFiles] = React.useState<TemplateFile[]>([]);
  const [filterTemplateValue, setTemplateValueFilter] = React.useState('');
  const [filterTemplateCategories, setTemplateCategoriesFilter] = React.useState([]);
  const [copiedFiles, setCopied] = React.useState<{ files: IFile[], success: boolean, message: string }>(undefined);
  const [isCopyingFiles, setIsCopyingFiles] = React.useState<boolean>(false);

  const addTemplateFilesToSelection = (files: any[]): void => {
    setSelectedTemplateFiles([]);
    setSelectedTemplateFiles(files);
  }

  const filterTemplateByValue = (value: string): void => {
    setTemplateValueFilter(undefined);
    setTemplateValueFilter(value);
  }

  const filterTemplateByCatgegories = (categories: string[]): void => {
    setTemplateCategoriesFilter(undefined);
    setTemplateCategoriesFilter(categories);
  }

  const startCopyProcess = (): void => {
    setIsCopyingFiles(true);
  }

  const setCopiedFiles = (newFiles: IFile[], message: string): void => {
    setCopied(undefined);
    setCopied({ files: newFiles, success: (newFiles?.length > 0 ? true : false), message });
    setSelectedTemplateFiles([]);
    setIsCopyingFiles(false);
  }

  async function initSourceList(): Promise<void> {
    const sp = spfi().using(SPFx(context));
    try {
      const settingsData = (await sp.web.getStorageEntity("easyTemplatesSettings"))?.Value;
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        initWithListParams({ webUrl: settings.site, listId: settings.list, categoryField: settings.categoryField });
      }
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    initSourceList().catch(error => console.log(error));
  }, []);

  return <TemplatesManagementContext.Provider value={{
    templateFiles, templateFilesByCategory, loading,
    selectedFiles: selectedTemplateFiles, checkoutFiles: addTemplateFilesToSelection,
    templateFilter: { value: filterTemplateValue, categories: filterTemplateCategories }, setTemplateValueFilter: filterTemplateByValue,
    setTemplateCategoriesFilter: filterTemplateByCatgegories,
    copiedFiles, setCopiedFiles, startCopyProcess, isCopyingFiles
  }}>
    {props.children}
  </TemplatesManagementContext.Provider>
}