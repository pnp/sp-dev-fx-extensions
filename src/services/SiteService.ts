import { BaseComponentContext } from "@microsoft/sp-component-base"
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http"
import { IFollowedSites } from "../models/IFollowedSites";

export interface IFollowedSitesResponse {
  value: IFollowedSites[]
}

export const getFollowedSites = async (
  context: BaseComponentContext
): Promise<IFollowedSites[]> => {
  try {
    const endpoint = `${context.pageContext.web.absoluteUrl}/_api/v2.1/favorites/followedSites?$top=30`

    const response: SPHttpClientResponse = await context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Caller': 'WebAppBar',
          'Prefer': 'fillSiteCount=30'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Error fetching followed sites: ${response.statusText}`)
    }

    const data: IFollowedSitesResponse = await response.json()
    return data.value
  } catch (error) {
    console.error("Error in getFollowedSites:", error)
    throw error
  }
}

export const getGroupImageUrl = async (
  context: BaseComponentContext,
  siteUrl: string
): Promise<string> => {
  try {
    const endpoint = `${siteUrl}/_api/GroupService/GetGroupImage`

    const response: SPHttpClientResponse = await context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
    )

    if (!response.ok) {
      throw new Error(`Error fetching group image: ${response.statusText}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("Error in getGroupImageUrl:", error)
    throw error
  }
}

// get frequent sites
export const getFrequentSites = async (
  context: BaseComponentContext
): Promise<IFollowedSites[]> => {
  try {
    const endpoint = `${context.pageContext.web.absoluteUrl}/_api/v2.1/insights/frequentSites?$top=30`

    const response: SPHttpClientResponse = await context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
    )

    if (!response.ok) {
      throw new Error(`Error fetching frequent sites: ${response.statusText}`)
    }

    const data: IFollowedSitesResponse = await response.json()
    return data.value
  } catch (error) {
    console.error("Error in getFrequentSites:", error)
    throw error
  }
}

export const addFollowedSite = async (
  context: BaseComponentContext,
  siteId: string,
  siteUrl: string
): Promise<void> => {
  try {
    const endpoint = `${context.pageContext.web.absoluteUrl}/_api/v2.1/favorites/followedSites/oneDrive.add`

     const requestBody = {
      value: [
        {
          webUrl: siteUrl,
          id: siteId,
        },
      ],
    }

    const response: SPHttpClientResponse = await context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error adding followed site: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error in addFollowedSite:", error)
    throw error
  }
}

// remove followed site _api/v2.1/favorites/followedSites/oneDrive.remove
export const removeFollowedSite = async (
  context: BaseComponentContext,
  webUrl: string,
  siteId: string
): Promise<void> => {
  try {
    const endpoint = `${context.pageContext.web.absoluteUrl}/_api/v2.1/favorites/followedSites/oneDrive.remove`

    const requestBody = {
      value: [
        {
          webUrl: webUrl,
          id: siteId,
        },
      ],
    }

    const response: SPHttpClientResponse = await context.spHttpClient.post(
      endpoint,
      SPHttpClient.configurations.v1,
      {
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error removing followed site: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error in removeFollowedSite:", error)
    throw error
  }
}