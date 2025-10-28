// generate functional component boilerplate
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
import { getFollowedSites, getGroupImageUrl } from "../services/SiteService"
import { AppContext } from "./MySitesRoot"
import { BaseComponentContext } from "@microsoft/sp-component-base"
import { IFollowedSites } from "../models/IFollowedSites"
import { useEffect, useState } from "react"
import { StarFilled } from "@fluentui/react-icons"
import { SiteListShimmer } from "./Shimmer"

export const FollowedSites = () => {
  const context = React.useContext(AppContext) as BaseComponentContext

  const [followedSites, setFollowedSites] = useState<IFollowedSites[]>([])
  const [siteImages, setSiteImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    followedSitesFetch()
  }, [context])

  const followedSitesFetch = async () => {
    try {
      setLoading(true)
      const response = await getFollowedSites(context)
      setFollowedSites(response)

      // Fetch images for all sites
      const imagePromises = response.map(async (site) => {
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

  return (
    <List navigationMode='items'>
      {followedSites.map((site: IFollowedSites, index) => (
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
              <Tooltip content='Stop following' relationship='label' withArrow>
                <Button
                  appearance='transparent'
                  icon={<StarFilled />}
                  size='large'
                />
              </Tooltip>
            </div>
          </ListItem>
          {index < followedSites.length - 1 && (
            <Divider style={{ paddingBottom: "1rem" }} />
          )}
        </>
      ))}
    </List>
  )
}
