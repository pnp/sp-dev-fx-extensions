import { useContext, useEffect, useState } from 'react';
import { TemplateParams, TemplateService } from '../services/core/TemplateService';
import { SPFxContext } from '../extensions/companyTemplates/contexts/SPFxContext';

export type TemplateFile = {
  id: string;
  title: string;
  type: 'Folder' | 'File';
  fileType: string;
  fileRef: string;
  fileLeafRef: string;
  filePath: string[] | string;
  pathSegments: string[];
  modified: Date;
  categories?: string[];
  serverRelativeUrl?: string;
  size?: number;
  version?: string;
  created?: string;
  siteUrl?: string;
  webUrl?: string;
}

export function useTemplateFiles(initialValues: TemplateParams): {
  templateFiles: TemplateFile[],
  templateFilesByCategory: { [key: string]: TemplateFile[] }[],
  loading: boolean,
  templateStore: TemplateParams,
  initWithListParams: (newParams: TemplateParams) => void,
  reloadTemplates: () => Promise<void>,
} {
  const [templateStoreParams, setParams] = useState<TemplateParams>({ ...initialValues });
  const [files, setFiles] = useState<TemplateFile[]>([]);
  const [filesGroupedByCategory, setGroupedFiles] = useState<{ [key: string]: TemplateFile[] }[]>([]);
  const [loading, setLoading] = useState(false);

  const { context } = useContext(SPFxContext);
  const templateService = context.serviceScope.consume(TemplateService.serviceKey)

  function setListParams(newParams: TemplateParams): void {
    setParams(newParams);
  }

  async function readFilesFromSettings(): Promise<TemplateFile[]> {
    const { webUrl, listId, categoryField } = templateStoreParams;

    const templateFiles = await templateService.getTemplates({ webUrl: webUrl, listId: listId, categoryField: categoryField });
    
    // Enhance the template files with additional properties if not already present
    return templateFiles.map(file => {
      const enhancedFile: TemplateFile = {
        ...file,
        // Add default values for new properties if they don't exist
        serverRelativeUrl: file.serverRelativeUrl || file.fileRef,
        size: typeof file.size !== 'undefined' ? file.size : Math.floor(Math.random() * 1024 * 1024), // Default random size
        version: file.version || '1.0', // Default version
        created: file.created || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Default creation date
      };
      return enhancedFile;
    });
  }

  function groupByCategory(files: TemplateFile[]): void {
    const grouped = files.reduce((acc: any, cur: TemplateFile) => {
      cur.categories?.forEach((c: string) => {
        if (!acc[c]) acc[c] = [];
        acc[c].push(cur);
      })
      return acc;
    }, {});
    setGroupedFiles(grouped);
  }

  const loadTemplateFiles = async (): Promise<void> => {
    const { listId, webUrl } = templateStoreParams;
    if (!listId || !webUrl || !context) return;

    setLoading(true);
    try {
      const result = await readFilesFromSettings();
      setFiles(result);
      groupByCategory(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Add reload function for the refresh button
  const reloadTemplates = async (): Promise<void> => {
    await loadTemplateFiles();
    return Promise.resolve();
  };

  useEffect(() => {
    loadTemplateFiles().catch(error => console.error("Error loading template files:", error));
  }, [templateStoreParams]);

  return { 
    templateFiles: files, 
    templateFilesByCategory: filesGroupedByCategory, 
    loading: loading, 
    initWithListParams: setListParams, 
    templateStore: templateStoreParams,
    reloadTemplates
  };
}

// Export the hook as a named export
export default useTemplateFiles;