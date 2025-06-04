import { TableColumnId } from '@fluentui/react-components';



export interface ISortState {

  sortColumn: TableColumnId | undefined;

  sortDirection: 'ascending' | 'descending';

}