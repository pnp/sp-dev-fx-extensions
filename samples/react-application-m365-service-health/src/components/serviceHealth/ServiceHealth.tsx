/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import {
  Button,
  DataGridProps,
  TableColumnSizingOptions,
} from "@fluentui/react-components";
import { DataGrid, IColumnConfig, ISortState } from "../dataGrid";

import { EMessageType } from "../../constants/EMessageTypes";
import { IHealthServices } from "../../models/IServiceHealthResults";
import { IServiceHealthProps } from "./IServiceHealthProps";
import { Icon } from "@iconify/react";
import ServiceIcon from "../serviceIcon/ServiceIcon";
import { ServiceName } from "../../hooks/useServiceIcons";
import { ShowMessage } from "../showMessage";
import { StatusIndicator } from "../statusIndicator/StatusIndicator";
import { debounce } from "lodash";
import { useM365ServiceHealth } from "../../hooks/useM365ServiceHealth";
import { useServiceHealthStyles } from "./useServiceHealthStyles";
import { useUtils } from "../../hooks/useUtils";

export const ServiceHealth: React.FC<IServiceHealthProps> = ({
  graphClientFactory,
  onSelected,
  refresh,
  scope,
}) => {
  const { data, loading, error, refreshData } = useM365ServiceHealth(
    graphClientFactory,
    scope
  );
  const { getStatusLabel } = useUtils();
  const styles = useServiceHealthStyles();
  const [sortState, setSortState] = React.useState<
    Parameters<NonNullable<DataGridProps["onSortChange"]>>[1]
  >({
    sortColumn: "status",
    sortDirection: "ascending",
  });
  const onSortChange = (nextSortState: ISortState) => {
    setSortState(nextSortState);
  };

  React.useEffect(() => {
    setSortState({
      sortColumn: "status",
      sortDirection: "ascending",
    });

   /// use debounce to avoid multiple calls
    const debouncedRefresh = debounce(async () => {
      await refreshData();
    }
    , 500);
    debouncedRefresh();
    return () => {
      debouncedRefresh.cancel();
    }
  }, [refresh]);
  

  const columnSizingOptions: TableColumnSizingOptions = {
    service: {
      minWidth: 140,
      defaultWidth: 270,
      idealWidth: 270,
    },
    status: {
      defaultWidth: 120,
      minWidth: 120,
      idealWidth: 200,
    },
    command: {
      defaultWidth: 100,
      minWidth: 100,
      idealWidth: 120,
    },
  };

  const columns: IColumnConfig<IHealthServices>[] = [
    {
      column: "service",
      header: "Service",
      order: (a, b) => a.service.localeCompare(b.service),
      media: (item) => {
        return (
          <ServiceIcon
            service={item.service as ServiceName}
            size={28}
            alt={item.service}
          />
        );
      },
    },
    {
      column: "status",
      header: "Status",
      media: (item) => {
        return <StatusIndicator status={item.status} />;
      },
      onRender: (item) => {
        return <span>{getStatusLabel(item.status)}</span>;
      },
      order: (a, b) => a.status.localeCompare(b.status),
    },
    {
      column: "id",
      header: "",
      onRender: (item) => {
        if (item.status === "serviceOperational") {
          return <></>;
        }
        return (
          <Button
            appearance="secondary"
            icon={<Icon icon="fluent:content-view-16-regular" />}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              if (onSelected) {
                onSelected(item);
              }
            }}
            aria-label="View details"
            title="View details"
          >
            View details
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <ShowMessage message={error.message} messageType={EMessageType.ERROR} />
    );
  }

  return (
    <DataGrid<IHealthServices>
      columns={columns}
      items={data}
      enableSorting={true}
      enableResizing={true}
      selectionMode="none"
      isLoadingData={loading}
      resizableColumnsOptions={{ autoFitColumns: false }}
      onSelectionChange={(items) => {
        if (onSelected) {
          onSelected(items[0]);
        }
      }}
      columnSizingOptions={columnSizingOptions}
      onSortChange={onSortChange}
      defaultSortState={sortState}
      noItemsMessage={"Service health data not available."}
      dataGridBodyClassName={styles.gridContainer}      
    />
  );
};
