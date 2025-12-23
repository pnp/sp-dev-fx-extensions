import {
  Text,
  List,
  ListItem,
  Divider,
  Link,
  Image,
  Button,
  Tooltip,
} from "@fluentui/react-components"
import * as React from "react"
import {
  getFrequentSites,
  getFollowedSites,
  getGroupImageUrl,
  removeFollowedSite,
  addFollowedSite,
} from "../services/SiteService"
import { AppContext } from "./MySitesRoot"
import { BaseComponentContext } from "@microsoft/sp-component-base"
import { IFollowedSites } from "../models/IFollowedSites"
import { useEffect, useState } from "react"
import { StarFilled, StarRegular } from "@fluentui/react-icons"
import { SiteListShimmer } from "./Shimmer"

export const FrequentSites = () => {
  const context = React.useContext(AppContext) as BaseComponentContext

  const [frequentSites, setFrequentSites] = useState<IFollowedSites[]>([])
  const [siteImages, setSiteImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    frequentSitesFetch()
  }, [context])

  const frequentSitesFetch = async () => {
    try {
      setLoading(true)

      // Fetch both frequent and followed sites in parallel
      const [frequentResponse, followedResponse] = await Promise.all([
        getFrequentSites(context),
        getFollowedSites(context),
      ])

      // Create a Set of followed site IDs for fast lookup
      const followedSiteIds = new Set(
        followedResponse.map((site) => site.sharepointIds?.siteId)
      )

      console.log("followed site ids", followedSiteIds)

      // Map frequent sites with isFollowed flag
      const mappedSites = frequentResponse.map((site) => ({
        ...site,
        isFollowed: followedSiteIds.has(site.sharepointIds?.siteId),
      }))

      console.log("mapped sites", mappedSites)

      setFrequentSites(mappedSites)

      // Fetch images for all sites
      const imagePromises = mappedSites.map(async (site) => {
        try {
          const imageUrl = await getGroupImageUrl(context, site.webUrl)
          return { id: site.id, url: imageUrl }
        } catch (error) {
          console.error(`Failed to load image for ${site.title}`, error)
          return { id: site.id, url: "" }
        }
      })

      const images = await Promise.all(imagePromises)
      const imageMap = images.reduce((acc, { id, url }) => {
        acc[id] = url
        return acc
      }, {} as Record<string, string>)

      setSiteImages(imageMap)
    } catch (error) {
      console.error("Error fetching followed sites:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(siteImages).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [siteImages])

  const renderSiteImage = (site: IFollowedSites) => {
    if (siteImages[site.id]) {
      return (
        <Image
          src={siteImages[site.id]}
          alt={site.title}
          width={34}
          height={34}
        />
      )
    }

    if (site.resourceVisualization?.acronym) {
      return (
        <div
          style={{
            width: 34,
            height: 34,
            backgroundColor: site.resourceVisualization.color || "#0078D4",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
          }}
        >
          {site.resourceVisualization.acronym}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return <SiteListShimmer count={5} />
  }

  const handleUnfollow = async (site: IFollowedSites) => {
    try {
      setLoading(true)
      await removeFollowedSite(context, site.webUrl, site.id)
      // Refetch the data
      await frequentSitesFetch()
    } catch (error) {
      console.error("Failed to unfollow site", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (site: IFollowedSites) => {
    try {
      setLoading(true)
      await addFollowedSite(context, site.id, site.webUrl)
      // Refetch the data
      await frequentSitesFetch()
    } catch (error) {
      console.error("Failed to follow site", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <List navigationMode='items'>
      {frequentSites.map((site: IFollowedSites, index) => (
        <>
          <ListItem
            key={site.id}
            value={site.title}
            data-value={site.title}
            aria-label={site.title}
            style={{
              paddingBottom: "1rem",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {renderSiteImage(site)}
            <Link
              href={site.webUrl}
              target='_blank'
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Text size={400}>{site.title}</Text>
            </Link>
            <div style={{ marginLeft: "auto" }}>
              <Tooltip
                content={site.isFollowed ? "Stop following" : "Follow site"}
                relationship='label'
                withArrow
              >
                <Button
                  appearance='transparent'
                  icon={site.isFollowed ? <StarFilled /> : <StarRegular />}
                  size='large'
                  onClick={() =>
                    site.isFollowed ? handleUnfollow(site) : handleFollow(site)
                  }
                />
              </Tooltip>
            </div>
          </ListItem>
          {index < frequentSites.length - 1 && (
            <Divider style={{ paddingBottom: "1rem" }} />
          )}
        </>
      ))}
    </List>
  )
}
