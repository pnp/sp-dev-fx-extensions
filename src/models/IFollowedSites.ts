export interface IResourceVisualization {
  acronym: string
  color: string
  previewImageUrl: string
}

export interface IFollowedSites {
  id: string
  name?: string
  title?: string
  url?: string
  webUrl: string
  isFollowed?: boolean
  resourceVisualization?: IResourceVisualization
}

export interface IFollowedSitesResponse {
  value: IFollowedSites[]
}
