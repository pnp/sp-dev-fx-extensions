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
  filePath: string[];
  pathSegments: string[];
  modified: Date;
  categories?: string[];
}


export function useTemplateFiles(initialValues: TemplateParams): {
  templateFiles: TemplateFile[],
  templateFilesByCategory: { [key: string]: TemplateFile[] }[],
  loading: boolean,
  templateStore: TemplateParams,
  initWithListParams: (newParams: TemplateParams) => void,
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
    return templateFiles;
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

  useEffect(() => {
    const { listId, webUrl } = templateStoreParams;
    if (!listId || !webUrl || !context) return;

    setLoading(true);
    readFilesFromSettings()
      .then(res => { setFiles(res); return res; })
      .then(res => { groupByCategory(res); setLoading(false); })
      .catch(error => { console.log(error); setLoading(false) });
  }, [templateStoreParams]);

  return { templateFiles: files, templateFilesByCategory: filesGroupedByCategory, loading: loading, initWithListParams: setListParams, templateStore: templateStoreParams };
}