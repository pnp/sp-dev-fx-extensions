import * as React from "react"
import { IMySitesRoot } from "../models/IMySitesRoot"
import { createV9Theme } from "@fluentui/react-migration-v8-v9"
import {
  Button,
  FluentProvider,
  IdPrefixProvider,
  Theme,
} from "@fluentui/react-components"
import { useMemo } from "react"
import {
  bundleIcon,
  PersonStarFilled,
  PersonStarRegular,
} from "@fluentui/react-icons"

const PersonStar = bundleIcon(PersonStarFilled, PersonStarRegular)

export const MySitesRoot = (props: IMySitesRoot) => {
  const { theme } = props

  const computedTheme = useMemo<Partial<Theme>>(() => {
    return createV9Theme(theme as never)
  }, [theme])

  return (
    <IdPrefixProvider value='my-sites-hub-provider-'>
      <FluentProvider theme={computedTheme}>
        <Button appearance='subtle' icon={<PersonStar />} />
      </FluentProvider>
    </IdPrefixProvider>
  )
}
