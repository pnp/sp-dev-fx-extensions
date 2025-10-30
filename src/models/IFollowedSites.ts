export interface IResourceVisualization {
  acronym: string
  color: string
  previewImageUrl: string
}

export interface ISharePointIds {
  listItemId: string
  siteId: string
  siteUrl: string
  webId: string
}

export interface IFollowedSites {
  id: string
  name?: string
  title?: string
  url?: string
  webUrl: string
  isFollowed?: boolean
  resourceVisualization?: IResourceVisualization
  sharepointIds?: ISharePointIds
}

export interface IFollowedSitesResponse {
  value: IFollowedSites[]
}