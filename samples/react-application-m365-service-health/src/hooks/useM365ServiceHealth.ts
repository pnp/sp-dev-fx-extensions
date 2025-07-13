import {
  IHealthServices,
  IServiceHealthResults,
} from "../models/IServiceHealthResults";
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from "react";

import { EScope } from "../constants/EScope";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import React from "react";
import { sortBy } from "lodash";
import { useAzureApi } from "./useAzureApi";

export interface UseM365ServiceHealthResult {
  data: IHealthServices[];
  loading: boolean;
  error: Error | undefined;
  refreshData: () => Promise<void>;
}

export const useM365ServiceHealth = (
  graphClientFactory: MSGraphClientV3,
  scope: string
): UseM365ServiceHealthResult => {
  const [data, setData] = useState<IHealthServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const { getServiceHealthOverviews } = useAzureApi();
  const sortDataByStatus = React.useCallback(
    (data: IHealthServices[]): IHealthServices[] => {
      const sorted = sortBy(data, (item) => {
        const status = item.status.toLowerCase();
        if (status === "serviceOperational") {
          return "z"; // Move "Service Restored" to the end
        }
        return status;
      });
      return sorted;
    },
    []
  );

  const fetchData = React.useCallback(
    async (isCancelled: boolean): Promise<void> => {
      setError(undefined);
      try {
        // test Scope
        let data: IHealthServices[] = [];
        switch (scope.toLowerCase().trim()) {
          case EScope.ALL:
            data = await getServiceHealthOverviews();
            break;
          case EScope.ADMINS:
          case "":
            {
              const client = graphClientFactory;
              const response: IServiceHealthResults = await client
                .api(
                  "/admin/serviceAnnouncement/healthOverviews?$expand=issues"
                )
                .version("v1.0")
                .get();
              data = response.value;
            }
            break;
          default:
            data = [];
            break;
        }
        if (!isCancelled) {
          setData(sortDataByStatus(data));
        }
      } catch (error) {
        if (!isCancelled) {
          setError(error as Error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let isCancelled = false; // Flag to track if the component is unmounted

    fetchData(isCancelled);

    return () => {
      isCancelled = true; // Cleanup function to set isCancelled to true component unmount
      setLoading(false);
    };
  }, []);

  const refreshData = async (): Promise<void> => {
    await fetchData(false);
  };

  return { data, loading, error, refreshData };
};
