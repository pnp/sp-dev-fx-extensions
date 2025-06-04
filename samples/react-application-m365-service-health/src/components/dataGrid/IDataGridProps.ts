import { IColumnConfig } from './IColumnConfig';
import { ISortState } from './ISortState';
import { TableColumnSizingOptions } from '@fluentui/react-components';

export interface IDataGridProps<T>   {
  columns: IColumnConfig<T>[];
  items: T[];
  enableSorting?: boolean;
  enableResizing?: boolean;
  selectionMode?: "none" | "single" | "multiple" | "row" |undefined;
  defaultSelectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  defaultSortState?: ISortState;
  onSortChange?: (sortState: ISortState) => void;
  columnSizingOptions?: TableColumnSizingOptions;
  resizableColumnsOptions?: { autoFitColumns: boolean };
  noItemsMessage?: string | JSX.Element;
  isLoadingData?: boolean;
  isLoadingDataMessage?: string | JSX.Element;
  dataGridBodyClassName?: string;
  refreshData?: boolean;
}