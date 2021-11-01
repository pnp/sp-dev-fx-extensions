import { useCallback, useContext, useEffect } from "react";

import { DriveItem, List, ListItem, Site, Subscription } from "@microsoft/microsoft-graph-types";
import { HttpClient, HttpClientResponse, MSGraphClientFactory } from "@microsoft/sp-http";

import { AppContext } from "../common";
import { IConfigurationListItem } from "../components";
import { IActivities, IActivity } from "../models/IActivities";

export enum EListType {
  "file" = "file",
  "listItem" = "listItem",
}

export const useMsGraphAPI = () => {
  const { context } = useContext(AppContext);

  useEffect(() => {
    (async () => {})();
  }, [context]);

  const getLists = useCallback(
    async (searchString: string) => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const searchRequest = {
          requests: [
            {
              entityTypes: ["list"],
              query: { queryString: `${searchString}*` },
              sortProperties: [{ name: "lastModifiedDateTime", isDescending: "true" }],
            },
          ],
        };
        const listsResults = await msGraphClient.api(`/search/query`).post(searchRequest);

        return listsResults.value[0].hitsContainers[0];
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getListActivities = useCallback(
    async (siteId: string, listId: string): Promise<IActivity[]> => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const listsActivitiesResults = (await msGraphClient
          .api(`/sites/${siteId}/lists/${listId}/activities`)
          .expand("listItem($expand=fields),driveItem")
          .top(1)
          .version("beta")
          .get()) as IActivities;

        return listsActivitiesResults.value;
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getSiteInfo = useCallback(
    async (siteId: string) => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const siteResults = await msGraphClient.api(`/sites/${siteId}`).get();

        return siteResults;
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getSiteInfoByRelativeUrl = useCallback(
    async (url: string): Promise<Site> => {
      const hostName = location.hostname;
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const siteResults = await msGraphClient
          .api(`/sites/${hostName}:/${url}`)
          .select("sharepointIds, id, webUrl,displayName,parentReference")
          .get();
        return siteResults;
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getListInfo = useCallback(
    async (siteId: string, listId: string) => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const siteResults = await msGraphClient.api(`/sites/${siteId}/lists/${listId}`).get();

        return siteResults;
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getListItem = useCallback(
    async (
      siteId: string,
      listId: string,
      activity: IActivity
    ): Promise<{ itemInfo: ListItem | DriveItem; type: string }> => {
      const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
      if (!msGraphClient) return;
      let graphUrl = "";
      let itemId = "";
      let listItemResults: any;
      let type = activity?.driveItem ? "file" : activity?.listItem ? "listItem" : undefined;
      switch (type) {
        case EListType.file:
          try {
            const driveId = activity.driveItem.parentReference.driveId;
            itemId = activity.driveItem.parentReference.id;
            graphUrl = `/sites/${siteId}/drives/${driveId}/items/${itemId}`;
            listItemResults = (await msGraphClient.api(graphUrl).get()) as DriveItem;
            return { itemInfo: listItemResults, type: type };
          } catch (error) {
            return { itemInfo: undefined, type: type };
          }
        case EListType.listItem:
          try {
            itemId = activity.listItem.id;
            graphUrl = `/sites/${siteId}/lists/${listId}/items/${itemId}`;
            listItemResults = (await msGraphClient.api(graphUrl).get()) as ListItem;
            return { itemInfo: listItemResults, type: type };
          } catch (error) {
            return { itemInfo: undefined, type: type };
          }
        default:
          graphUrl = `/sites/${siteId}/lists/${listId}`;
          const lItemResults = (await msGraphClient.api(graphUrl).get()) as List;
          type = lItemResults.list.template === "documentLibrary" ? "file" : "listItem";
          return { itemInfo: undefined, type: type };
      }
    },
    [context.serviceScope]
  );

  const getListSockectIo = useCallback(
    async (siteId: string, listId: string): Promise<Subscription> => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        const listSubscription = (await msGraphClient

          .api(`/sites/${siteId}/lists/${listId}/subscriptions/socketIo`)
          .get()) as Subscription;

        return listSubscription;
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const createAppFolder = useCallback(
    async (folderName: string) => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        await msGraphClient.api(`/me/drive/special/approot`).header("content-type", "application/json").put({
          name: folderName,
          folder: {},
        });
      } catch (error) {
        console.log("er", error);
        // Ignore if folder exists
        if (error.code !== "nameAlreadyExists") {
          throw error;
        }
      }
    },
    [context.serviceScope]
  );

  const saveSettings = useCallback(
    async (settings: string) => {
      try {
        const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
        if (!msGraphClient) return;
        await msGraphClient
          .api("/me/drive/special/approot:/MyListsNotifications/appsettings.json:/content")
          .header("content-type", "plain/text")
          .put(JSON.stringify(settings));
      } catch (error) {
        throw error;
      }
    },
    [context.serviceScope]
  );

  const getSettings = useCallback(async (): Promise<IConfigurationListItem[]> => {
    try {
      const msGraphClient = await context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient();
      if (!msGraphClient) return;
      const downLoadUrlResponse = (await msGraphClient
        .api("/me/drive/special/approot:/MyListsNotifications/appsettings.json?select=@microsoft.graph.downloadUrl")
        .get()) as HttpClientResponse;
      const fileSettings = await context.httpClient.get(
        downLoadUrlResponse["@microsoft.graph.downloadUrl"],
        HttpClient.configurations.v1
      );
      const data: IConfigurationListItem[] = JSON.parse(await fileSettings.json());
      return data;
    } catch (error) {
      throw error;
    }
  }, [context.serviceScope, context.httpClient]);

  return {
    getSiteInfo,
    getLists,
    getListInfo,
    createAppFolder,
    saveSettings,
    getSettings,
    getListSockectIo,
    getListActivities,
    getListItem,
    getSiteInfoByRelativeUrl,
  };
};
