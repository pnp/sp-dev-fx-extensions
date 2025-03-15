import * as React from "react";
import { ITreeItem } from "@pnp/spfx-controls-react/lib/TreeView";
import { TemplateFile } from "../../../hooks/useTemplateFiles";
import { IFile } from "@pnp/sp/files";
import { IAdvancedFilters } from "../components/EnhancedFilter";

type TemplatesManagementContextState = {
  templateFiles?: TemplateFile[];
  templateFilesByCategory?: { [key: string]: TemplateFile[] }[];
  loading: boolean;

  templateFilter?: { value?: string, categories?: string[] };
  setTemplateValueFilter?: (value: string) => void;
  setTemplateCategoriesFilter?: (categories: string[]) => void;
  
  // Advanced filters
  advancedFilters?: IAdvancedFilters;
  setAdvancedFilters?: (filters: IAdvancedFilters) => void;

  selectedFiles: any[];
  checkoutFiles: (files: ITreeItem[]) => void;

  copiedFiles?: { files?: IFile[], success?: boolean, message?: string };
  setCopiedFiles?: (files: IFile[], message: string) => void;
  startCopyProcess?: () => void;
  isCopyingFiles?: boolean;
  
  previewTemplate?: (file: TemplateFile) => void;
  refreshTemplates?: () => Promise<void>;
  
  // View mode (list or grid)
  viewMode?: 'list' | 'grid';
  setViewMode?: (mode: 'list' | 'grid') => void;
}

export const TemplatesManagementContext = React.createContext<TemplatesManagementContextState>({
  templateFiles: [], 
  templateFilesByCategory: [], 
  loading: true,
  selectedFiles: [], 
  checkoutFiles: () => {}, 
  templateFilter: { value: undefined, categories: [] },
  advancedFilters: {},
  viewMode: 'list'
});