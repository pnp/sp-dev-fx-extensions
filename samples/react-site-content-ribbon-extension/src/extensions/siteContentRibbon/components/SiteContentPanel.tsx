import * as React from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  FluentProvider,
  IdPrefixProvider,
  InputOnChangeData,
  Link,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  SearchBox,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableColumnDefinition,
  TableColumnId,
  TableColumnSizingOptions,
  TableHeader,
  TableHeaderCell,
  TableRow,
  createTableColumn,
  useTableColumnSizing_unstable,
  useTableFeatures,
  useTableSort,
  webLightTheme,
} from '@fluentui/react-components';
import { DocumentRegular, DismissRegular } from '@fluentui/react-icons';
import { Drive } from '@microsoft/microsoft-graph-types';
import { IListViewItem } from '../models/IListViewItem';
import { filterItems, getItemThumbnail } from '../services/HelperService';
import { DriveDetailsDialog } from './DriveDetailsDialog';
import { GraphService } from '../services/GraphService';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { ListItemMenu } from './ListItemMenu';

const columnsDef = (): TableColumnDefinition<IListViewItem>[] => {
  return [
    createTableColumn<IListViewItem>({
      columnId: 'Name',
      renderHeaderCell: () => (
        <>
          <DocumentRegular /> Name
        </>
      ),
      compare: (a, b) => a.Name.localeCompare(b.Name),
    }),
    createTableColumn<IListViewItem>({
      columnId: 'Type',
      renderHeaderCell: () => <>Type</>,
      compare: (a, b) => a.Type.localeCompare(b.Type),
    }),
    createTableColumn<IListViewItem>({
      columnId: 'Items',
      renderHeaderCell: () => <>Items</>,
      compare: (a, b) => (a.Items ?? 0) - (b.Items ?? 0),
    }),
    createTableColumn<IListViewItem>({
      columnId: 'Modified',
      renderHeaderCell: () => <>Modified</>,
      compare: (a, b) => {
        const dateA = a.ModifiedDate;
        const dateB = b.ModifiedDate;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
      },
    }),
    createTableColumn<IListViewItem>({
      columnId: 'Description',
      renderHeaderCell: () => <>Description</>,
      compare: (a, b) => a.Description.localeCompare(b.Description),
    }),
  ];
};

interface ISiteContentPanelProps {
  items: IListViewItem[];
  context: ApplicationCustomizerContext;
  onClose: () => void;
}

const SiteContentPanel = (props: ISiteContentPanelProps): JSX.Element => {
  const [filteredItems, setFilteredItems] = React.useState<IListViewItem[]>(props.items);
  const [driveDetailsOpen, setDriveDetailsOpen] = React.useState(false);
  const [driveDetails, setDriveDetails] = React.useState<Drive | undefined>(undefined);
  const [columns] = React.useState<TableColumnDefinition<IListViewItem>[]>(columnsDef);

  const [columnSizingOptions] = React.useState<TableColumnSizingOptions>({
    Name: { idealWidth: 200, minWidth: 100 },
    Type: { minWidth: 80 },
    Items: { minWidth: 60 },
    Modified: { minWidth: 100 },
    Description: { minWidth: 150 },
  });

  React.useEffect(() => {
    setFilteredItems(props.items);
  }, [props.items]);

  const {
    getRows,
    columnSizing_unstable,
    tableRef,
    sort: { getSortDirection, toggleColumnSort, sort },
  } = useTableFeatures(
    { columns, items: filteredItems },
    [
      useTableColumnSizing_unstable({ columnSizingOptions, autoFitColumns: false }),
      useTableSort({}),
    ]
  );

  const headerSortProps = (
    columnId: TableColumnId
  ): { onClick: (e: React.MouseEvent) => void; sortDirection: SortDirection | undefined } => ({
    onClick: (e: React.MouseEvent) => toggleColumnSort(e, columnId),
    sortDirection: getSortDirection(columnId),
  });

  const rows = sort(getRows());

  const [graphService] = React.useState<GraphService>(() => new GraphService(props.context));

  const handleFilter = (searchText: string | undefined | null): void => {
    setFilteredItems(filterItems(props.items, searchText));
  };

  const handleDriveInfoClick = async (name: string): Promise<void> => {
    try {
      const response = await graphService.getDriveDetails(name);
      setDriveDetails(response);
      setDriveDetailsOpen(true);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <IdPrefixProvider value="site-content-ext-">
      <FluentProvider theme={webLightTheme}>
        <Drawer open={true} onOpenChange={(_, data) => !data.open && props.onClose()} position="end" size="large">
          <DrawerHeader>
            <DrawerHeaderTitle
              action={<Button appearance="subtle" aria-label="Close" icon={<DismissRegular />} onClick={props.onClose} />}
              style={{ width: '100%' }}
            >
              Site content
            </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 250 }}>
                  <SearchBox placeholder="Search" onChange={(_, data: InputOnChangeData) => handleFilter(data.value)} />
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <Table ref={tableRef} {...columnSizing_unstable.getTableProps()} noNativeElements sortable>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <Menu openOnContext key={column.columnId}>
                          <MenuTrigger>
                            <TableHeaderCell
                              key={column.columnId}
                              {...columnSizing_unstable.getTableHeaderCellProps(column.columnId)}
                              {...headerSortProps(column.columnId)}
                            >
                              {column.renderHeaderCell()}
                            </TableHeaderCell>
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem onClick={columnSizing_unstable.enableKeyboardMode(column.columnId)}>
                                Keyboard Column Resizing
                              </MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(({ item }) => (
                      <TableRow key={item.Name}>
                        <TableCell {...columnSizing_unstable.getTableCellProps('Name')}>
                          <TableCellLayout
                            media={
                              getItemThumbnail(item.Thumbnail) ? (
                                <img src={getItemThumbnail(item.Thumbnail)} alt="" style={{ width: 24, height: 24 }} />
                              ) : undefined
                            }
                          >
                            <Link data-interception="off" href={item.Target} style={{ color: 'inherit' }}>
                              {item.Name}
                            </Link>
                          </TableCellLayout>
                          <TableCellActions>
                            <ListItemMenu item={item} context={props.context} onDriveInfoClick={() => handleDriveInfoClick(item.Name)} />
                          </TableCellActions>
                        </TableCell>
                        <TableCell {...columnSizing_unstable.getTableCellProps('Type')}>
                          <TableCellLayout>{item.Type}</TableCellLayout>
                        </TableCell>
                        <TableCell {...columnSizing_unstable.getTableCellProps('Items')}>
                          <TableCellLayout>{item.Items !== null && item.Items !== undefined && item.Items > -1 ? `${item.Items}` : ''}</TableCellLayout>
                        </TableCell>
                        <TableCell {...columnSizing_unstable.getTableCellProps('Modified')}>
                          <TableCellLayout>{item.Modified ?? ''}</TableCellLayout>
                        </TableCell>
                        <TableCell {...columnSizing_unstable.getTableCellProps('Description')}>
                          <TableCellLayout>{item.Description ?? ''}</TableCellLayout>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DrawerBody>
          {driveDetailsOpen && driveDetails && <DriveDetailsDialog driveDetails={driveDetails} onClose={() => setDriveDetailsOpen(false)} />}
        </Drawer>
      </FluentProvider>
    </IdPrefixProvider>
  );
};

export default SiteContentPanel;
