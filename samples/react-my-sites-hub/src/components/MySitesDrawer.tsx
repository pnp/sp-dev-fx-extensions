import * as React from "react"
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
} from "@fluentui/react-components"
import { Dismiss24Regular } from "@fluentui/react-icons"
import { DrawerTitles } from "../utils/Strings"
import { IMySitesDrawer } from "../models/IMySitesDrawer"
import { MySitesTabs } from "./MySitesTabs"

const useStyles = makeStyles({
  drawerBody: {
    paddingTop: "0.5rem",
  },
})

export const MySitesDrawer = (props: IMySitesDrawer) => {
  const { openDrawer, setDrawerVisiblity } = props

  const styles = useStyles()
  return (
    <Drawer
      open={openDrawer}
      separator
      position='end'
      style={{ width: "400px" }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance='subtle'
              aria-label='Close'
              icon={<Dismiss24Regular />}
              onClick={() => setDrawerVisiblity(false)}
            />
          }
        >
          {DrawerTitles.mySitesPanel}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={styles.drawerBody}>
        <MySitesTabs />
      </DrawerBody>
    </Drawer>
  )
}
