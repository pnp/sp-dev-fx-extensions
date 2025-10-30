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
  GlobeStarFilled,
  GlobeStarRegular,
} from "@fluentui/react-icons"
import { MySitesDrawer } from "./MySitesDrawer"
import { BaseComponentContext } from "@microsoft/sp-component-base"

const PersonStar = bundleIcon(GlobeStarFilled, GlobeStarRegular)

const useStyles = makeStyles({
  root: {
    position: "fixed",
    top: "8px",
    zIndex: "10000",
    background: "transparent",
    right: "310px",
  },
})

export const AppContext = React.createContext<BaseComponentContext | undefined>(
  undefined
)

export const MySitesRoot = (props: IMySitesRoot) => {
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false)

  const { theme, context } = props

  const computedTheme = useMemo<Partial<Theme>>(() => {
    return createV9Theme(theme as never)
  }, [theme])

  const fluentStyles = useStyles()

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
        <AppContext.Provider value={context}>
          <MySitesDrawer
            openDrawer={isOpenDialog}
            setDrawerVisiblity={setIsOpenDialog}
          />
        </AppContext.Provider>
      </FluentProvider>
    </IdPrefixProvider>
  )
}
