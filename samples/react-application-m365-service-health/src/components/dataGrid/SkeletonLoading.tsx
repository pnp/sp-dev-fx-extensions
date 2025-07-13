// SkeletonLoading.tsx
import * as React from 'react';

import {
  Skeleton,
  SkeletonItem,
} from '@fluentui/react-components';

interface SkeletonLoadingProps {
  numberItems?: number;
  columns?: number;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  numberItems = 26,
  columns = 2,
}) => {
  const useStyles = {
    skeleton: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "16px",
    },
  };
  return (
    <Skeleton>
      <div style={useStyles.skeleton}>
    {Array.from({ length: numberItems }, (_, index) => (
      <SkeletonItem key={index} size={40} />
    ))}
  </div>
    </Skeleton>
  );
};
