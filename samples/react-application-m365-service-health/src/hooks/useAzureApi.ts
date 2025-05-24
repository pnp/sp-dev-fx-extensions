import { AZURE_API_URL } from "../constants/constants";
import { IHealthServices } from "../models/IServiceHealthResults";
import axios from "axios";

export interface UseAzureApiResult {
  getServiceHealthOverviews: () => Promise<IHealthServices[]>;
}

export const useAzureApi = (): UseAzureApiResult => {

  const getServiceHealthOverviews = async (): Promise<IHealthServices[]> => {
    const response = await axios.get(AZURE_API_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Error fetching data from Azure API: ${response.statusText}`
      );
    }

    return response.data;
  };

  return { getServiceHealthOverviews };
};
