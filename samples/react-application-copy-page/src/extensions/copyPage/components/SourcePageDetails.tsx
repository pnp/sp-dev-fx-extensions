
// src/components/SourcePageDetails.tsx
import * as React from 'react';
import { Text } from '@fluentui/react';

export const SourcePageDetails = ({ pageName }: { pageName: string }): JSX.Element  => (
  <>
    <Text>Page to copy: {pageName}</Text>
  </>
);