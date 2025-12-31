import * as React from "react"
import { Skeleton, SkeletonItem } from "@fluentui/react-components"

interface ISiteListShimmerProps {
  count?: number
}

export const SiteListShimmer: React.FC<ISiteListShimmerProps> = ({
  count = 5,
}) => {
  return (
    <div>
      {[...Array(count)].map((_, index) => (
        <div key={index} style={{ marginBottom: "1rem" }}>
          <Skeleton aria-label='Loading site'>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <SkeletonItem shape='square' size={32} />
              <SkeletonItem style={{ flex: 1 }} />
            </div>
          </Skeleton>
        </div>
      ))}
    </div>
  )
}
