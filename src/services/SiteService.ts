import { BaseComponentContext } from "@microsoft/sp-component-base"
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http"

export interface IFollowedSite {
  id: string
  name: string
  url: string
  webUrl: string
  // Add other properties as needed
}

export interface IFollowedSitesResponse {
  value: IFollowedSite[]
}

export const getFollowedSites = async (
  context: BaseComponentContext
): Promise<IFollowedSite[]> => {
  try {
    const endpoint = `${context.pageContext.web.absoluteUrl}/_api/v2.1/favorites/followedSites?$expand=contentTypes&$top=100`

    const response: SPHttpClientResponse = await context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
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
