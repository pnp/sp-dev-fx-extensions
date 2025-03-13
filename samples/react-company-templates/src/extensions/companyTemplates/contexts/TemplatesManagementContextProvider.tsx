import * as React from "react";
import { TemplatesManagementContext } from "./TemplatesManagementContext";
import { TemplateFile, useTemplateFiles } from "../../../hooks/useTemplateFiles";
import { SPFxContext } from "./SPFxContext";
import { SPFx, spfi } from '@pnp/sp';
import { IFile } from "@pnp/sp/files";
import { TemplatePreview } from "../components/TemplatePreview";
import { ITreeItem } from "@pnp/spfx-controls-react/lib/TreeView";
import { IAdvancedFilters } from "../components/EnhancedFilter";

type TemplatesManagementContextProviderProps = {}

export const TemplatesManagementContextProvider: React.FC<TemplatesManagementContextProviderProps> = (props: React.PropsWithChildren<TemplatesManagementContextProviderProps>) => {
  const context = React.useContext(SPFxContext).context;
  const { templateFiles, templateFilesByCategory, loading, initWithListParams, reloadTemplates } = useTemplateFiles({ listId: undefined, webUrl: undefined });
  const [selectedTemplateFiles, setSelectedTemplateFiles] = React.useState<TemplateFile[]>([]);
  const [filterTemplateValue, setTemplateValueFilter] = React.useState('');
  const [filterTemplateCategories, setTemplateCategoriesFilter] = React.useState([]);
  const [advancedFilters, setAdvancedFilters] = React.useState<IAdvancedFilters>({});
  const [copiedFiles, setCopied] = React.useState<{ files: IFile[], success: boolean, message: string }>(undefined);
  const [isCopyingFiles, setIsCopyingFiles] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  
  // New state for preview functionality
  const [previewFile, setPreviewFile] = React.useState<TemplateFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState<boolean>(false);

  // Fixed: Convert ITreeItem array to TemplateFile array
  const addTemplateFilesToSelection = (files: ITreeItem[]): void => {
    // Map the tree items to template files, extracting the data property
    const templateFiles = files.map(item => item.data as TemplateFile).filter(Boolean);
    setSelectedTemplateFiles([]);
    setSelectedTemplateFiles(templateFiles);
  }

  const filterTemplateByValue = (value: string): void => {
    setTemplateValueFilter(undefined);
    setTemplateValueFilter(value);
  }

  const filterTemplateByCatgegories = (categories: string[]): void => {
    setTemplateCategoriesFilter(undefined);
    setTemplateCategoriesFilter(categories);
  }

  const updateAdvancedFilters = (filters: IAdvancedFilters): void => {
    setAdvancedFilters(filters);
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
  
  // Preview functionality
  const previewTemplate = (file: TemplateFile): void => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };
  
  // Handle preview panel dismiss
  const handlePreviewDismiss = (): void => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

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
    templateFiles, 
    templateFilesByCategory, 
    loading,
    selectedFiles: selectedTemplateFiles, 
    checkoutFiles: addTemplateFilesToSelection,
    templateFilter: { value: filterTemplateValue, categories: filterTemplateCategories }, 
    setTemplateValueFilter: filterTemplateByValue,
    setTemplateCategoriesFilter: filterTemplateByCatgegories,
    advancedFilters,
    setAdvancedFilters: updateAdvancedFilters,
    copiedFiles, 
    setCopiedFiles, 
    startCopyProcess, 
    isCopyingFiles,
    previewTemplate,
    refreshTemplates: reloadTemplates,
    viewMode,
    setViewMode
  }}>
    {props.children}
    {previewFile && (
      <TemplatePreview 
        file={previewFile} 
        isOpen={isPreviewOpen} 
        onDismiss={handlePreviewDismiss} 
      />
    )}
  </TemplatesManagementContext.Provider>
}