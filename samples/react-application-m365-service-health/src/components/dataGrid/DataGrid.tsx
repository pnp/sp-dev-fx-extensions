import * as React from "react";

import {
  Body1Strong,
  DataGridBody,
  DataGridCell,
  DataGrid as DataGridFUI,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableCellLayout,
  TableColumnDefinition,
  TableRowId,
  createTableColumn,
} from "@fluentui/react-components";

import { IDataGridProps } from "./IDataGridProps";
import { ISortState } from "./ISortState";
import { SkeletonLoading } from "./SkeletonLoading";
import { useDataGridStyles } from "./useDataGridStyles";

// Generic DataGrid component
export const DataGrid = <T,>(props: IDataGridProps<T>): JSX.Element => {
  const {
    items,
    columns,
    defaultSelectedItems = [],
    enableSorting = false,
    selectionMode = "none",
    onSelectionChange,
    onSortChange,
    defaultSortState,
    columnSizingOptions,
    enableResizing = false,
    noItemsMessage,
    isLoadingData,
    isLoadingDataMessage,
    dataGridBodyClassName,
    refreshData,
  } = props;

  const getItemIndex = (item: T): number => items.findIndex((i) => i === item);

  const [selectedItems, setSelectedItems] = React.useState<Set<number>>(
    new Set(defaultSelectedItems.map((item) => getItemIndex(item)))
  );

  const ref = React.useRef<HTMLDivElement>(null);
  const { styles } = useDataGridStyles<T>(props);

  React.useEffect(() => {
    if (defaultSelectedItems.length > 0) {
      setSelectedItems(
        new Set(defaultSelectedItems.map((item) => getItemIndex(item)))
      );
    }
  }, [defaultSelectedItems, items]);

// deselect items if refreshing data
  React.useEffect(() => {
    if (refreshData) {
      setSelectedItems(new Set());
    }
  }, [refreshData]);

  // Dynamically create TableColumnDefinition array from ColumnConfig array
  const tableColumns: TableColumnDefinition<T>[] = columns.map((colConfig) =>
    createTableColumn<T>({
      columnId: colConfig.column as string,
      renderHeaderCell: () => <Body1Strong>{colConfig.header}</Body1Strong>,
      renderCell: (item) => (
        <TableCellLayout
          media={colConfig.media ? colConfig.media(item) : undefined}
        >
          {colConfig.onRender
            ? colConfig.onRender(item)
            : String(item[colConfig?.column] ?? "")}
        </TableCellLayout>
      ),
      compare: colConfig.order,
    })
  );

  // Handle selection change
  const handleSelectionChange = (
    _e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    data: { selectedItems: Set<TableRowId> }
  ):void => {
    const newSelectedItems = new Set<number>();
    data.selectedItems.forEach((id) => {
      const index = Number(id);
      if (!isNaN(index)) {
        newSelectedItems.add(index);
      }
    });
    setSelectedItems(newSelectedItems);
    if (onSelectionChange) {
      const selectedObjects = Array.from(newSelectedItems).map(
        (index) => items[index]
      );
      onSelectionChange(selectedObjects);
    }
  };

  // Handle sort change
  const handleSortChange = (
    _e: React.MouseEvent<Element>,
    sortState: ISortState
  ):void => {
    if (onSortChange) {
      onSortChange(sortState);
    }
  };

  const onRowClick = React.useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>, item: T) => {
      e.stopPropagation();
      if (selectionMode === "row") {
        if (onSelectionChange) {
          onSelectionChange([item]);
        }
      }
    },
    [selectionMode, onSelectionChange]
  );

  const rowSelectionStyles = React.useMemo(() => {
    if (selectionMode === "row") {
      return styles.rowSelection;
    }
    return "";
  }, [selectionMode, styles.rowSelection]);

  const RenderDataGridBody = React.useCallback(() => {
    return (
      <DataGridBody<T> className={dataGridBodyClassName ?? ""}>
        {({ item, rowId }) => (
          <DataGridRow<T>
            key={rowId}
            className={rowSelectionStyles}
            onClick={(e: React.MouseEvent<HTMLTableRowElement>) =>
              onRowClick(e, item)
            }
          >
            {({ renderCell }: { renderCell: (item: T) => React.ReactNode }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    );
  }, [onRowClick, rowSelectionStyles]);

  const hasData = React.useMemo(
    () => items.length && !isLoadingData,
    [items, isLoadingData]
  );

  const RenderGridContent = React.useCallback(() => {
    if (isLoadingData) {
      return <>{isLoadingDataMessage ?? <SkeletonLoading  columns={3} numberItems={33}/>}</>;
    }
    if (hasData) {
      return <RenderDataGridBody />;
    } else if (!isLoadingData && !items.length) {
      return <div>{noItemsMessage}</div>;
    }
    return <></>;
  }, [hasData, isLoadingData, items, noItemsMessage]);

  return (
    <div ref={ref}>
      <DataGridFUI
        as="div"
        items={items}
        onSelectionChange={
          handleSelectionChange as (
            e:
              | React.MouseEvent<Element, MouseEvent>
              | React.KeyboardEvent<Element>,
            data: { selectedItems: Set<TableRowId> }
          ) => void
        }
        sortable={enableSorting}
        columns={tableColumns}
        selectionMode={
          selectionMode === "none" || selectionMode === "row"
            ? undefined
            : selectionMode === "multiple"
            ? "multiselect"
            : selectionMode === "single"
            ? "single"
            : undefined
        }
        selectedItems={selectedItems}
        defaultSortState={defaultSortState}
        onSortChange={handleSortChange}
        columnSizingOptions={columnSizingOptions}
        resizableColumns={enableResizing}
        resizableColumnsOptions={{ autoFitColumns: false }}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>

        <RenderGridContent />
      </DataGridFUI>
    </div>
  );
};
