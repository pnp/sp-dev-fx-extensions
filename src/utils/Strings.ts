// Constants.ts
import {
  GlobeStarRegular,
  ClockRegular,
  DocumentOnePageSparkleRegular,
} from "@fluentui/react-icons"

export const DrawerTitles = {
  mySitesPanel: "My Sites",
  aiInsightsPanel: "AI Insights",
}

export const Tooltips = {
  followedTab: "Sites you are following",
  frequentTab: "Sites you visit frequently",
  recommendedTab: "Recommended sites for you",
  followButton: "Follow this site",
  unfollowButton: "Unfollow this site",
  pinButton: "Pin panel",
  closeButton: "Close panel",
}

export const Tabs = [
  { key: "followed", label: "Followed", icon: GlobeStarRegular },
  { key: "frequent", label: "Frequent", icon: ClockRegular },
  { key: "custom", label: "Custom", icon: DocumentOnePageSparkleRegular },
]
