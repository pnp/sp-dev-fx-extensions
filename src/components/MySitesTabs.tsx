import { Tab, TabList } from "@fluentui/react-components"
import * as React from "react"
import { Tabs } from "../utils/Strings"
import { FrequentSites } from "./FrequentSites"
import { FollowedSites } from "./FollowedSites"
import { CustomSites } from "./CustomSites"

const TAB_COMPONENTS: Record<string, React.ReactNode> = {
  followed: <FollowedSites />,
  frequent: <FrequentSites />,
  custom: <CustomSites />,
}

export const MySitesTabs = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>("followed")

  return (
    <>
      <TabList
        appearance='filled-circular'
        aria-label='My Sites Tabs'
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as string)}
      >
        {Tabs.map((tab) => (
          <Tab key={tab.key} value={tab.key} icon={<tab.icon />}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <div
        style={{
          marginTop: "1rem",
          overflowY: "scroll",
          height: "calc(100vh - 150px)",
        }}
      >
        {TAB_COMPONENTS[selectedTab]}
      </div>
    </>
  )
}
