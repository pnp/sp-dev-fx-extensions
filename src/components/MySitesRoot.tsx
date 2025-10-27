import * as React from "react"
import { IMySitesRoot } from "../models/IMySitesRoot"
import { createV9Theme } from "@fluentui/react-migration-v8-v9"
import {
  Button,
  FluentProvider,
  IdPrefixProvider,
  makeStyles,
  Theme,
  Tooltip,
} from "@fluentui/react-components"
import { useMemo, useState } from "react"
import {
  bundleIcon,
  PersonStarFilled,
  PersonStarRegular,
} from "@fluentui/react-icons"
import { getFollowedSites } from "../services/SiteService"
import { MySitesDrawer } from "./MySitesDrawer"

const PersonStar = bundleIcon(PersonStarFilled, PersonStarRegular)

const useStyles = makeStyles({
  root: {
    position: "fixed",
    top: "8px",
    zIndex: "10000",
    background: "transparent",
    right: "310px",
  },
})

export const MySitesRoot = (props: IMySitesRoot) => {
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false)

  const { theme, context } = props

  const computedTheme = useMemo<Partial<Theme>>(() => {
    return createV9Theme(theme as never)
  }, [theme])

  const fluentStyles = useStyles()

  React.useEffect(() => {
    followedSitesFetch()
  }, [context])

  const followedSitesFetch = async () => {
    await getFollowedSites(context)
  }

  return (
    <IdPrefixProvider value='my-sites-hub-provider-'>
      <FluentProvider theme={computedTheme} className={fluentStyles.root}>
        <Tooltip
          content='Click to see your favorite sites'
          relationship='label'
          withArrow
        >
          <Button
            appearance='transparent'
            icon={<PersonStar color='white' />}
            onClick={() => setIsOpenDialog(!isOpenDialog)}
          />
        </Tooltip>
        <MySitesDrawer
          openDrawer={isOpenDialog}
          setDrawerVisiblity={setIsOpenDialog}
        />
      </FluentProvider>
    </IdPrefixProvider>
  )
}
