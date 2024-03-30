import * as React from 'react';
import { useContext } from 'react';
import { groupBy } from '@microsoft/sp-lodash-subset';
import { TemplatesManagementContext } from '../../contexts/TemplatesManagementContext';
import { Icon, SearchBox, Spinner, SpinnerSize, Stack, StackItem, Text } from '@fluentui/react';
import { FileIconType, getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import styles from '../CompanyTemplates.module.scss'
import { ITreeItem, TreeView, TreeViewSelectionMode } from '@pnp/spfx-controls-react/lib/TreeView';
import "@pnp/sp/items/get-all";
import "@pnp/sp/items";
import { TemplateFile } from '../../../../hooks/useTemplateFiles';
import { CategoryFilter } from '../CategoryFilter';
import * as strings from 'CompanyTemplatesCommandSetStrings';


export interface ITemplateViewProps { }

export const StandardView: React.FunctionComponent<ITemplateViewProps> = (props: React.PropsWithChildren<ITemplateViewProps>) => {
  const { templateFiles, checkoutFiles, templateFilter, loading, setTemplateValueFilter } = useContext(TemplatesManagementContext);
  const [filteredtemplateFiles, setFilteredtemplateFiles] = React.useState<TemplateFile[]>(templateFiles);

  // Template Filtering
  React.useEffect(() => {
    let filtered = templateFiles
    if (templateFilter.categories?.length > 0) {
      filtered = filtered
        .filter(file => {
          return file.categories?.some(category => category.toLowerCase() === templateFilter?.categories[0].toLowerCase());
        });
    }
    filtered = filtered.filter(file => {
      return file.title.toLowerCase().includes(templateFilter.value?.toLowerCase() ?? '')
        || file.fileLeafRef.toLowerCase().includes(templateFilter.value?.toLowerCase() ?? '');
    });
    setFilteredtemplateFiles(filtered);
  }, [templateFilter.value, templateFilter.categories, templateFiles]);

  const onRenderItem = (treeItem: ITreeItem): JSX.Element => {
    const { data }: { data?: TemplateFile } = treeItem;

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
          {treeItem.label}
        </StackItem>
        {/* <StackItem styles={{ root: { width: '120px', textAlign: 'right' } }}>
          {new Date(data?.modified).toLocaleDateString()}
        </StackItem> */}
        <StackItem>
          {data.categories && data.categories.map(category => <Text variant='xSmall' className={styles.category}>{category}</Text>)}
        </StackItem>
      </Stack>
    </div >;
  }

  const makeFolderStructure = (items: any[], path = '', level = 1): any[] => {
    if (!items?.length) return [];

    const sorted = [...items].sort((a, b) => {
      const aValue = a.filePath.toLowerCase();
      const bValue = b.filePath.toLowerCase();
      if (aValue > bValue) return 1;
      if (bValue > aValue) return -1;
      return 0;
    });

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
          subLabel: i.filePath,
          data: i,
        })) ?? [],
    ];
  }

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
          </Stack>
          <TreeView
            items={makeFolderStructure(filteredtemplateFiles)}
            defaultExpandedChildren={false}
            showCheckboxes={true}
            defaultExpanded={false}
            selectionMode={TreeViewSelectionMode.Multiple}
            onSelect={(items) => checkoutFiles([...items])}
            onRenderItem={(i) => onRenderItem(i)}
          />
        </>}
      {
        !loading && templateFiles.length === 0 &&
        <div>{strings.StandardView.NoTemplatesFoundText}</div>
      }
    </div >
  );
};