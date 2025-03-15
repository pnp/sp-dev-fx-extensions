import * as React from 'react';
import { useContext } from 'react';
import { groupBy } from '@microsoft/sp-lodash-subset';
import { TemplatesManagementContext } from '../../contexts/TemplatesManagementContext';
import { Icon, SearchBox, Spinner, SpinnerSize, Stack, StackItem, Text, Toggle } from '@fluentui/react';
import { FileIconType, getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import styles from '../CompanyTemplates.module.scss';
import { ITreeItem, TreeView, TreeViewSelectionMode } from '@pnp/spfx-controls-react/lib/TreeView';
import { TemplateFile } from '../../../../hooks/useTemplateFiles';
import { CategoryFilter } from '../CategoryFilter';
import { EnhancedFilter } from '../EnhancedFilter'; // Import from the correct path
import * as strings from 'CompanyTemplatesCommandSetStrings';
import { DetailsList, DetailsListLayoutMode, IColumn, Selection, SelectionMode } from '@fluentui/react/lib/DetailsList';

export interface ITemplateViewProps { }

export const StandardView: React.FunctionComponent<ITemplateViewProps> = (props: React.PropsWithChildren<ITemplateViewProps>) => {
  const { 
    templateFiles, 
    checkoutFiles, 
    templateFilter, 
    advancedFilters,
    loading, 
    setTemplateValueFilter, 
    previewTemplate,
    viewMode,
    setViewMode
  } = useContext(TemplatesManagementContext);
  
  const [filteredtemplateFiles, setFilteredtemplateFiles] = React.useState<TemplateFile[]>(templateFiles);
  const [selectedItems, setSelectedItems] = React.useState<TemplateFile[]>([]);
  
  // Create a selection instance for DetailsList
  const [selection] = React.useState(
    new Selection({
      onSelectionChanged: () => {
        const selectedItems = selection.getSelection() as TemplateFile[];
        setSelectedItems(selectedItems);
        checkoutFiles(selectedItems.map(item => ({
          key: item.id,
          label: item.fileLeafRef,
          data: item
        })));
      }
    })
  );

  // Apply all filters to templates
  React.useEffect(() => {
    let filtered = templateFiles;
    
    // Apply category filter
    if (templateFilter.categories?.length > 0) {
      filtered = filtered
        .filter(file => {
          return file.categories?.some(category => category.toLowerCase() === templateFilter?.categories[0].toLowerCase());
        });
    }
    
    // Apply text search filter
    filtered = filtered.filter(file => {
      return file.title.toLowerCase().includes(templateFilter.value?.toLowerCase() ?? '')
        || file.fileLeafRef.toLowerCase().includes(templateFilter.value?.toLowerCase() ?? '');
    });
    
    // Apply advanced filters
    if (advancedFilters) {
      // Date range filter
      if (advancedFilters.dateFrom) {
        filtered = filtered.filter(file => {
          const modifiedDate = new Date(file.modified);
          return modifiedDate >= advancedFilters.dateFrom;
        });
      }
      
      if (advancedFilters.dateTo) {
        filtered = filtered.filter(file => {
          const modifiedDate = new Date(file.modified);
          return modifiedDate <= advancedFilters.dateTo;
        });
      }
      
      // File size filter
      if (advancedFilters.fileSize) {
        filtered = filtered.filter(file => file.size <= advancedFilters.fileSize);
      }
    }
    
    setFilteredtemplateFiles(filtered);
  }, [templateFilter.value, templateFilter.categories, templateFiles, advancedFilters]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTemplateNameClick = (file: TemplateFile): void => {
    if (file && file.type !== 'Folder' && previewTemplate) {
      previewTemplate(file);
    }
  };

  // Format date for display
  const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  // Open SharePoint version history
  const openVersionHistory = (file: TemplateFile): void => {
    const versionHistoryUrl = `${file.siteUrl}/_layouts/15/versions.aspx?list=${file.fileRef.split('/')[2]}&ID=${file.id}`;
    window.open(versionHistoryUrl, '_blank');
  };

  // Bulk download selected templates
  const downloadSelectedTemplates = (): void => {
    selectedItems.forEach(file => {
      window.open(file.serverRelativeUrl || file.fileRef, '_blank');
    });
  };

  // TreeView rendering
  const onRenderItem = (treeItem: ITreeItem): JSX.Element => {
    const { data }: { data?: TemplateFile } = treeItem;

    if (!data) return null;

    if (data.type === 'Folder') {
      return <div className={styles.treeNode}>
        <Icon {...getFileTypeIconProps({ type: FileIconType.folder, size: 16, imageFileType: 'png' })} />
        {treeItem.label}
      </div>;
    }

    return <div className={styles.treeLeaf}>
      <Stack horizontal horizontalAlign='space-between' style={{ width: '100%' }}>
        <StackItem verticalFill={true}>
          <Icon {...getFileTypeIconProps({ extension: data?.fileType, size: 16, imageFileType: 'png' })} style={{ verticalAlign: 'text-bottom' }} />
          <span 
            className={styles.templateName} 
            onClick={() => handleTemplateNameClick(data)}
          >
            {treeItem.label}
          </span>
        </StackItem>
        
        <StackItem styles={{ root: { marginRight: '10px', textAlign: 'right' } }}>
          <Text variant='small'>{formatFileSize(data?.size || 0)}</Text>
          {data?.version && <Text variant='small'> | v{data.version}</Text>}
          <Icon 
            iconName="History" 
            title="Version History" 
            className={styles.actionIcon} 
            onClick={() => openVersionHistory(data)}
          />
        </StackItem>
        
        <StackItem>
          {data.categories && data.categories.map(category => 
            <Text key={category} variant='xSmall' className={styles.category}>{category}</Text>
          )}
        </StackItem>
      </Stack>
    </div>;
  };

  // DetailsList columns for grid view
  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'fileLeafRef',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      onRender: (item: TemplateFile) => (
        <Stack horizontal verticalAlign="center">
          <Icon {...getFileTypeIconProps({ extension: item.fileType, size: 16, imageFileType: 'png' })} style={{ marginRight: 8 }} />
          <span 
            className={styles.templateName} 
            onClick={() => handleTemplateNameClick(item)}
          >
            {item.fileLeafRef}
          </span>
        </Stack>
      )
    },
    {
      key: 'category',
      name: 'Categories',
      fieldName: 'categories',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: TemplateFile) => (
        <Stack horizontal tokens={{ childrenGap: 5 }}>
          {item.categories && item.categories.map(category => 
            <Text key={category} variant='xSmall' className={styles.category}>{category}</Text>
          )}
        </Stack>
      )
    },
    {
      key: 'modified',
      name: 'Modified',
      fieldName: 'modified',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: TemplateFile) => formatDate(item.modified)
    },
    {
      key: 'size',
      name: 'Size',
      fieldName: 'size',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      onRender: (item: TemplateFile) => formatFileSize(item.size || 0)
    },
    {
      key: 'version',
      name: 'Version',
      fieldName: 'version',
      minWidth: 70,
      maxWidth: 70,
      isResizable: true,
      onRender: (item: TemplateFile) => item.version || '1.0'
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 70,
      maxWidth: 70,
      onRender: (item: TemplateFile) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <Icon 
            iconName="History" 
            title="Version History" 
            className={styles.actionIcon} 
            onClick={() => openVersionHistory(item)}
          />
          <Icon 
            iconName="Download" 
            title="Download" 
            className={styles.actionIcon} 
            onClick={() => window.open(item.serverRelativeUrl || item.fileRef, '_blank')}
          />
        </Stack>
      )
    }
  ];

  const makeFolderStructure = (items: TemplateFile[], path = '', level = 1): any[] => {
    if (!items?.length) return [];

    const sorted = [...items].sort((a, b) => {
      const aValue = Array.isArray(a.filePath) ? a.filePath.join('/').toLowerCase() : a.filePath.toString().toLowerCase();
      const bValue = Array.isArray(b.filePath) ? b.filePath.join('/').toLowerCase() : b.filePath.toString().toLowerCase();
      if (aValue > bValue) return 1;
      if (bValue > aValue) return -1;
      return 0;
    });

    // Group items by path segment
    const grouped = groupBy(sorted, (i) => {
      if (i.pathSegments.length <= level) return '$this';
      return i.pathSegments[level - 1];
    });

    return [
      ...Object
        .keys(grouped)
        .filter((directory) => directory !== '$this')
        .map((directory): any => ({
          key: `${path}${directory}`,
          label: directory,
          subLabel: "Test",
          data: { title: directory, type: 'Folder' },
          selectable: false,
          children: makeFolderStructure(grouped[directory], `${path}${directory}/`, level + 1)
        })),
      ...grouped.$this?.filter(i => !i.title.includes('.DS'))
        .map((i: TemplateFile) => ({
          key: i.id,
          label: i.fileLeafRef,
          subLabel: Array.isArray(i.filePath) ? i.filePath.join('/') : i.filePath.toString(),
          data: i,
        })) ?? [],
    ];
  };

  return (
    <div>
      <h2 className={`od-ItemContent-title ${styles.dialogTitle}`} key={'title'}>{strings.StandardView.Title}</h2>
      {loading && <div><Spinner size={SpinnerSize.large} label={strings.StandardView.LoadingTemplatesLabel} labelPosition='top' /></div>}
      {(!loading && templateFiles.length > 0) &&
        <>
          <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign='center' styles={{ root: { padding: '0.5rem 0', borderBottom: '1px solid #edebe9', borderTop: '1px solid #edebe9' } }}>
            <Text>{strings.StandardView.FilterTemplatesLabel}</Text>
            <CategoryFilter />
            <SearchBox placeholder={strings.StandardView.SearchBoxPlaceholder} onSearch={newValue => setTemplateValueFilter(newValue)} onClear={() => setTemplateValueFilter(undefined)} styles={{ root: { width: '350px' } }} />
            <EnhancedFilter />
            <Toggle 
              label="View"
              inlineLabel
              onText="Grid"
              offText="List"
              checked={viewMode === 'grid'}
              onChange={(_, checked) => setViewMode(checked ? 'grid' : 'list')}
            />
          </Stack>

          {selectedItems.length > 0 && (
            <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { padding: '8px 0' } }}>
              <Text>{`${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected`}</Text>
              <Text 
                className={styles.actionText}
                onClick={downloadSelectedTemplates}
              >
                Download selected
              </Text>
            </Stack>
          )}
          
          {viewMode === 'list' ? (
            <TreeView
              items={makeFolderStructure(filteredtemplateFiles)}
              defaultExpandedChildren={false}
              showCheckboxes={true}
              defaultExpanded={false}
              selectionMode={TreeViewSelectionMode.Multiple}
              onSelect={(items) => checkoutFiles(items)}
              onRenderItem={(i) => onRenderItem(i)}
            />
          ) : (
            <DetailsList
              items={filteredtemplateFiles.filter(f => f.type !== 'Folder')}
              columns={columns}
              setKey="set"
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.multiple}
              selectionPreservedOnEmptyClick={true}
              isHeaderVisible={true}
              selection={selection}
              className={styles.detailsList}
            />
          )}
        </>}
      {
        !loading && templateFiles.length === 0 &&
        <div>{strings.StandardView.NoTemplatesFoundText}</div>
      }
    </div>
  );
};